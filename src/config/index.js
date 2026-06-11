/**
 * Passwortgenerator Konfiguration
 * Zentrale Konfigurationswerte für die Anwendung
 */
export const CONFIG = {
  // UI Konfiguration
  UI: {
    containerSelector: '.container',
    passwordInputSelector: '#password',
    generateBtnSelector: '.generate-btn',
    copyBtnSelector: '#copyBtn',
    themeToggleSelector: '#themeToggle',
    lengthSliderSelector: '#length',
    lengthValueSelector: '#lengthVal',
    uppercaseSelector: '#uppercase',
    lowercaseSelector: '#lowercase',
    numbersSelector: '#numbers',
    symbolsSelector: '#symbols',
    ambiguousSelector: '#ambiguous'
  },

  // Passwort Konfiguration
  PASSWORD: {
    minLength: 12,
    maxLength: 32,
    defaultLength: 16,
    defaultOptions: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      ambiguous: false
    }
  },

  // Zeichen Sets
  CHARACTERS: {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    // Ähnliche Zeichen zum Ausschließen
    ambiguous: /[Il1|O0o]/g
  },

  // SVG Icons
  ICONS: {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    check: '<svg viewBox="0 0 24 24" style="stroke:#2ecc71"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
  },

  // LocalStorage Keys
  STORAGE: {
    theme: 'password-generator-theme',
    passwordHistory: 'password-generator-history',
    settings: 'password-generator-settings'
  },

  // Events
  EVENTS: {
    passwordGenerated: 'password:generated',
    passwordCopied: 'password:copied',
    themeChanged: 'theme:changed',
    settingsChanged: 'settings:changed'
  }
}

/**
 * Standard Einstellungen
 */
export const DEFAULT_SETTINGS = {
  length: CONFIG.PASSWORD.defaultLength,
  uppercase: CONFIG.PASSWORD.defaultOptions.uppercase,
  lowercase: CONFIG.PASSWORD.defaultOptions.lowercase,
  numbers: CONFIG.PASSWORD.defaultOptions.numbers,
  symbols: CONFIG.PASSWORD.defaultOptions.symbols,
  ambiguous: CONFIG.PASSWORD.defaultOptions.ambiguous
}
