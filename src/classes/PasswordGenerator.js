/**
 * PasswordGenerator Klasse
 * Kernklasse für die Passwortgenerierung mit erweiterter Funktionalität
 */
import { CONFIG, DEFAULT_SETTINGS } from '../config/index.js'

export class PasswordGenerator {
  /**
   * Erstellt einen neuen PasswordGenerator
   * @param {Object} options - Optionen für die Generierung
   */
  constructor (options = {}) {
    this.options = { ...DEFAULT_SETTINGS, ...options }
    this.initialize()
  }

  /**
   * Initialisiert den Generator
   */
  initialize () {
    // Validiere Optionen
    this.validateOptions()
  }

  /**
   * Validiert die Generator-Optionen
   */
  validateOptions () {
    if (
      this.options.length < CONFIG.PASSWORD.minLength ||
      this.options.length > CONFIG.PASSWORD.maxLength
    ) {
      throw new Error(
        `Passwortlänge muss zwischen ${CONFIG.PASSWORD.minLength} und ${CONFIG.PASSWORD.maxLength} sein`
      )
    }
  }

  /**
   * Generiert ein neues Passwort
   * @returns {string} Das generierte Passwort
   */
  generate () {
    // Erstelle Zeichenmenge basierend auf Optionen
    const characterSet = this.getCharacterSet()

    if (characterSet.length === 0) {
      throw new Error('Mindestens eine Zeichenart muss ausgewählt sein')
    }

    // Generiere sicheres Passwort
    const password = this.generateSecurePassword(characterSet)

    // Filtere ähnliche Zeichen falls gewünscht
    return this.options.ambiguous ? this.filterAmbiguousCharacters(password) : password
  }

  /**
   * Erstellt das Zeichen-Set basierend auf den Optionen
   * @returns {string} Zeichen-Set
   */
  getCharacterSet () {
    let characters = ''

    if (this.options.uppercase) {
      characters += CONFIG.CHARACTERS.uppercase
    }
    if (this.options.lowercase) {
      characters += CONFIG.CHARACTERS.lowercase
    }
    if (this.options.numbers) {
      characters += CONFIG.CHARACTERS.numbers
    }
    if (this.options.symbols) {
      characters += CONFIG.CHARACTERS.symbols
    }

    return characters
  }

  /**
   * Generiert ein sicheres Passwort mit Crypto API
   * @param {string} characterSet - Das verfügbare Zeichen-Set
   * @returns {string} Generiertes Passwort
   */
  generateSecurePassword (characterSet) {
    const password = new Array(this.options.length)
    const array = new Uint32Array(this.options.length)

    window.crypto.getRandomValues(array)

    for (let i = 0; i < this.options.length; i++) {
      password[i] = characterSet[array[i] % characterSet.length]
    }

    return password.join('')
  }

  /**
   * Filtert ähnliche Zeichen aus dem Passwort
   * @param {string} password - Das Passwort
   * @returns {string} Gefiltertes Passwort
   */
  filterAmbiguousCharacters (password) {
    return password.replace(
      CONFIG.CHARACTERS.ambiguous,
      ''
    )
  }

  /**
   * Berechnet die Entropie eines Passworts
   * @param {string} password - Das Passwort
   * @returns {number} Entropie in Bits
   */
  calculateEntropy (password) {
    const setSize = new Set(password.split('')).size
    return password.length * Math.log2(setSize)
  }

  /**
   * Aktualisiert die Generator-Optionen
   * @param {Object} newOptions - Neue Optionen
   */
  updateOptions (newOptions) {
    this.options = { ...this.options, ...newOptions }
    this.validateOptions()
  }

  /**
   * Setzt die Optionen auf Standardwerte zurück
   */
  resetOptions () {
    this.options = { ...DEFAULT_SETTINGS }
  }

  /**
   * Gibt aktuelle Optionen zurück
   * @returns {Object} Aktuelle Optionen
   */
  getOptions () {
    return { ...this.options }
  }
}
