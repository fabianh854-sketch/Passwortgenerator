/**
 * Interfaces / Abstraktionen
 * Bereitstellung flexibler, austauschbarer Abhängigkeiten (Dependency Injection Hooks)
 */

/**
 * Erzeugt einen DOM-Abstraktions-Proxy
 * Entkoppelt Module von direktem `document.querySelector`-Zugriff
 * Ermöglicht Dependency Injection für UI-Komponenten
 */
export function createDOMProxy (root = document) {
  /**
   * @param {string} selector
   * @returns {Element|null}
   */
  const query = (selector) => root.querySelector(selector)

  /**
   * @param {string} selector
   * @returns {NodeListOf<Element>}
   */
  const queryAll = (selector) => root.querySelectorAll(selector)

  return {
    getRoot: () => root,
    query,
    queryAll,
    addEventListener: (type, listener, options) => root.addEventListener(type, listener, options),
    removeEventListener: (type, listener, options) => root.removeEventListener(type, listener, options)
  }
}

/**
 * Erzeugt einen Storage-Abstraktions-Proxy
 * Default: window.localStorage (im Browser) oder Memory-Storage (in Tests)
 * Ermöglicht vollständige Entkopplung von globalen APIs
 */
export function createStorageProxy (storage = null) {
  const memory = new Map()

  const backend = storage || {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  }

  return {
    get: (key) => backend.getItem(key),
    set: (key, value) => backend.setItem(key, String(value)),
    remove: (key) => backend.removeItem(key)
  }
}

/**
 * Crypto-Abstraktion (für Tests austauschbar)
 * @param {Crypto} [cryptoInstance]
 */
export function createCryptoProxy (cryptoInstance = null) {
  const hasNativeCrypto = typeof crypto !== 'undefined' && crypto.getRandomValues
  const backend = cryptoInstance || (hasNativeCrypto ? crypto : null)

  if (!backend) {
    throw new Error('Kein crypto-Backend verfügbar. Bitte einen Crypto-Stub für Tests injecten.')
  }

  return {
    getRandomValues: (typedArray) => backend.getRandomValues(typedArray)
  }
}
