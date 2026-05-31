// Build/version stamp. The __*__ constants are injected by Vite `define`
// (see vite.config.js) and declared as globals in eslint.config.js. The typeof
// guard keeps this safe if the module is ever imported without Vite's define.
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
export const GIT_COMMIT = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'local'
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : ''

// Compact label for display, e.g. "v1.0.0 · a1b2c3d"
export const VERSION_LABEL = `v${APP_VERSION}${GIT_COMMIT ? ` · ${GIT_COMMIT}` : ''}`
