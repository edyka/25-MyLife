import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing library to automatically use act()
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 10000,
})

// Mock localStorage
global.localStorage = {
  storage: {},
  getItem: function (key) {
    return this.storage[key] || null
  },
  setItem: function (key, value) {
    this.storage[key] = value
  },
  removeItem: function (key) {
    delete this.storage[key]
  },
  clear: function () {
    this.storage = {}
  },
}

// Mock crypto for tests without recursion
const nodeCrypto = await import('crypto')
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: arr => nodeCrypto.webcrypto.getRandomValues(arr),
    subtle: {
      digest: async () => new Uint8Array(),
    },
  },
})
