import CryptoJS from 'crypto-js';
import { validateAppData } from './validation.js';

const STORAGE_KEY = 'lifeWeeksData';
const KEY_STORAGE = 'lifeWeeksEncKey';
const KEY_DERIVATION_SALT = 'memento-vivere-salt-2024';

// Generate a persistent per-browser encryption key
const generatePersistentKey = () => {
  try {
    // Create a unique seed for this device/browser
    const userAgent = navigator.userAgent || 'unknown';
    const random = CryptoJS.lib.WordArray.random(16).toString();
    const deviceSeed = `${userAgent}-${random}`;

    // Derive a key with PBKDF2
    const derivedKey = CryptoJS.PBKDF2(deviceSeed, KEY_DERIVATION_SALT, {
      keySize: 256/32, // 256-bit key
      iterations: 10000, // OWASP recommended minimum
      hasher: CryptoJS.algo.SHA256
    });
    return derivedKey.toString();
  } catch (error) {
    console.error('Failed to generate persistent key:', error);
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
};

// Browser compatibility check for Brave and other privacy-focused browsers
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage not available:', error.message);
    return false;
  }
};

// Detect Brave browser
const isBraveBrowser = () => {
  return (navigator.brave && navigator.brave.isBrave) || false;
};

// Get or create encryption key stored in localStorage so it persists across reloads
const getEncryptionKey = () => {
  if (!isStorageAvailable()) {
    console.warn('Storage not available, using session-only key');
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
  
  try {
    let key = localStorage.getItem(KEY_STORAGE);
    if (!key) {
      key = generatePersistentKey();
      localStorage.setItem(KEY_STORAGE, key);
      
      // Special handling for Brave browser
      if (isBraveBrowser()) {
        console.log('Brave browser detected - data will be stored locally only');
      }
    }
    return key;
  } catch (error) {
    console.warn('Failed to access localStorage, using temporary key:', error);
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
};

// Legacy key for backward compatibility during migration
const LEGACY_SECRET_KEY = 'memento-vivere-key-2024';

const encrypt = (data) => {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

const decrypt = (encryptedData) => {
  try {
    // If value looks like plaintext JSON, parse and migrate
    const firstChar = encryptedData?.trim?.()[0];
    if (firstChar === '{' || firstChar === '[') {
      const parsed = JSON.parse(encryptedData);
      const reEncrypted = encrypt(parsed);
      if (reEncrypted) {
        localStorage.setItem(STORAGE_KEY, reEncrypted);
        localStorage.setItem(
          STORAGE_KEY + '_checksum',
          CryptoJS.SHA256(JSON.stringify(parsed)).toString()
        );
      }
      return parsed;
    }

    // Try with persistent key
    const currentKey = getEncryptionKey();
    let bytes = CryptoJS.AES.decrypt(encryptedData, currentKey);
    let decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
      // Fallback to legacy fixed key
      bytes = CryptoJS.AES.decrypt(encryptedData, LEGACY_SECRET_KEY);
      decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedData) {
        const parsedData = JSON.parse(decryptedData);
        const reEncrypted = encrypt(parsedData);
        if (reEncrypted) {
          localStorage.setItem(STORAGE_KEY, reEncrypted);
          const newChecksum = CryptoJS.SHA256(JSON.stringify(parsedData)).toString();
          localStorage.setItem(STORAGE_KEY + '_checksum', newChecksum);
        }
        return parsedData;
      }
    }

    return decryptedData ? JSON.parse(decryptedData) : null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const saveToSecureStorage = (birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories = {}, goals = []) => {
  try {
    const data = validateAppData({ 
      birthDay, 
      birthMonth, 
      birthYear, 
      lifeExpectancy, 
      milestones, 
      customCategories, 
      goals 
    });
    
    const encrypted = encrypt(data);
    if (encrypted) {
      localStorage.setItem(STORAGE_KEY, encrypted);
      localStorage.setItem(STORAGE_KEY + '_checksum', CryptoJS.SHA256(JSON.stringify(data)).toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save to secure storage:', error);
    return false;
  }
};

export const loadFromSecureStorage = () => {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    const storedChecksum = localStorage.getItem(STORAGE_KEY + '_checksum');
    
    if (!encryptedData) {
      return null;
    }

    const decryptedData = decrypt(encryptedData);
    if (!decryptedData) {
      console.warn('Failed to decrypt data, clearing storage');
      clearSecureStorage();
      return null;
    }

    // Calculate both SHA-256 and MD5 checksums for backward compatibility
    const calculatedSHA256 = CryptoJS.SHA256(JSON.stringify(decryptedData)).toString();
    const calculatedMD5 = CryptoJS.MD5(JSON.stringify(decryptedData)).toString();
    
    if (storedChecksum) {
      // Check if stored checksum matches SHA-256 (new format)
      if (calculatedSHA256 === storedChecksum) {
        // Checksum is valid with SHA-256
      } else if (calculatedMD5 === storedChecksum) {
        // Legacy MD5 checksum detected, migrate to SHA-256
        console.log('Migrating checksum from MD5 to SHA-256');
        localStorage.setItem(STORAGE_KEY + '_checksum', calculatedSHA256);
      } else {
        // Neither checksum matches - data integrity compromised
        console.warn('Data integrity check failed, clearing storage');
        clearSecureStorage();
        return null;
      }
    }

    return validateAppData(decryptedData);
  } catch (error) {
    console.error('Failed to load from secure storage:', error);
    clearSecureStorage();
    return null;
  }
};

export const clearSecureStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY + '_checksum');
  // keep KEY_STORAGE so user data remains decryptable across reloads
};

export const migrateFromLegacyStorage = () => {
  try {
    const legacyData = localStorage.getItem('lifeWeeksData');
    if (legacyData) {
      // If it looks like already-encrypted (starts with 'U2F' from CryptoJS), skip
      const firstChar = legacyData.trim()[0];
      const looksEncrypted = firstChar !== '{' && firstChar !== '[';
      if (looksEncrypted) {
        return false;
      }
      const parsed = JSON.parse(legacyData);
      const validated = validateAppData(parsed);
      saveToSecureStorage(
        validated.birthDay,
        validated.birthMonth,
        validated.birthYear,
        validated.lifeExpectancy,
        validated.milestones,
        validated.customCategories,
        validated.goals
      );
      localStorage.removeItem('lifeWeeksData');
      console.log('Successfully migrated legacy data to secure storage');
      return true;
    }
  } catch (error) {
    console.error('Failed to migrate legacy data:', error);
  }
  return false;
};

export const exportSecureData = (birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories = {}, goals = []) => {
  try {
    const data = validateAppData({ 
      birthDay, 
      birthMonth, 
      birthYear, 
      lifeExpectancy, 
      milestones, 
      customCategories, 
      goals 
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memento-vivere-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export data:', error);
    return false;
  }
};

// Utility function to rotate encryption key (forces re-encryption with new key)
export const rotateEncryptionKey = () => {
  try {
    // Load current data
    const currentData = loadFromSecureStorage();
    if (!currentData) {
      console.log('No data found to rotate');
      return false;
    }
    // Create a new key and save
    localStorage.removeItem(KEY_STORAGE);
    // Re-save data with new key
    const success = saveToSecureStorage(
      currentData.birthDay,
      currentData.birthMonth,
      currentData.birthYear,
      currentData.lifeExpectancy,
      currentData.milestones,
      currentData.customCategories,
      currentData.goals
    );
    
    if (success) {
      console.log('Encryption key rotated successfully');
    }
    
    return success;
  } catch (error) {
    console.error('Failed to rotate encryption key:', error);
    return false;
  }
};