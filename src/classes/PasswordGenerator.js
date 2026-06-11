/**
 * PasswordGenerator Klasse
 * Kernklasse für die Passwortgenerierung mit kryptographisch sicherer Entropie
 */
import { CONFIG, DEFAULT_SETTINGS } from '../config/index.js'
import { createCryptoProxy } from '../interfaces.js'

/**
 * Konsolidierter Ambiguous-Filter
 * @param {string} text
 * @param {boolean} removeAmbiguous
 * @returns {string}
 */
function applyAmbiguousFilter (text, removeAmbiguous) {
  return removeAmbiguous
    ? text.replace(CONFIG.CHARACTERS.ambiguous, '')
    : text
}

export class PasswordGenerator {
  /**
   * Erstellt einen neuen PasswordGenerator
   * @param {Object} options - Optionen für die Generierung
   * @param {Object} deps - Abhängigkeiten ({ cryptoProxy })
   */
  constructor (options = {}, deps = {}) {
    this.options = { ...DEFAULT_SETTINGS, ...options }
    this.crypto = deps.cryptoProxy || createCryptoProxy()
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
    const characterSet = this.getCharacterSet()

    if (characterSet.length === 0) {
      throw new Error('Mindestens eine Zeichenart muss ausgewählt sein')
    }

    const password = this.generateSecurePassword(characterSet)
    return this.ensureCharacterMix(password)
  }

  /**
   * Erstellt das Zeichen-Set basierend auf den Optionen
   * @returns {string} Zeichen-Set
   */
  getCharacterSet () {
    let characters = ''

    if (this.options.uppercase) {
      characters += applyAmbiguousFilter(CONFIG.CHARACTERS.uppercase, this.options.ambiguous)
    }
    if (this.options.lowercase) {
      characters += applyAmbiguousFilter(CONFIG.CHARACTERS.lowercase, this.options.ambiguous)
    }
    if (this.options.numbers) {
      characters += applyAmbiguousFilter(CONFIG.CHARACTERS.numbers, this.options.ambiguous)
    }
    if (this.options.symbols) {
      characters += applyAmbiguousFilter(CONFIG.CHARACTERS.symbols, this.options.ambiguous)
    }

    return characters
  }

  /**
   * Generiert ein sicheres Passwort mit Crypto API
   * Verwendet Rejection Sampling um Modulo-Bias zu vermeiden
   * @param {string} characterSet - Das verfügbare Zeichen-Set
   * @returns {string} Generiertes Passwort
   */
  generateSecurePassword (characterSet) {
    const setSize = characterSet.length
    const password = new Array(this.options.length)

    for (let i = 0; i < this.options.length; i++) {
      password[i] = this.getRandomCharacter(characterSet, setSize)
    }

    return password.join('')
  }

  /**
   * Holt ein einzelnes zufälliges Zeichen ohne Modulo-Bias
   * @param {string} characterSet - Das Zeichen-Set
   * @param {number} setSize - Größe des Zeichen-Sets
   * @returns {string} Zufälliges Zeichen
   */
  getRandomCharacter (characterSet, setSize) {
    const maxValid = Math.floor(0x100000000 / setSize) * setSize

    while (true) {
      const array = new Uint32Array(1)
      this.crypto.getRandomValues(array)
      const randomValue = array[0]

      if (randomValue < maxValid) {
        return characterSet[randomValue % setSize]
      }
    }
  }

  /**
   * Holt einen sicheren zufälligen Index für Arrays
   * @param {number} arrayLength - Länge des Arrays
   * @returns {number} Zufälliger Index
   */
  getSecureRandomIndex (arrayLength) {
    const maxValid = Math.floor(0x100000000 / arrayLength) * arrayLength

    while (true) {
      const array = new Uint32Array(1)
      this.crypto.getRandomValues(array)
      const randomValue = array[0]

      if (randomValue < maxValid) {
        return randomValue % arrayLength
      }
    }
  }

  /**
   * Stellt sicher, dass jede aktivierte Zeichenart mindestens einmal vorkommt
   * @param {string} password - Das generierte Passwort
   * @returns {string} Passwort mit garantierter Zeichenmischung
   */
  ensureCharacterMix (password) {
    const requiredSets = []

    if (this.options.uppercase) {
      requiredSets.push(applyAmbiguousFilter(CONFIG.CHARACTERS.uppercase, this.options.ambiguous))
    }
    if (this.options.lowercase) {
      requiredSets.push(applyAmbiguousFilter(CONFIG.CHARACTERS.lowercase, this.options.ambiguous))
    }
    if (this.options.numbers) {
      requiredSets.push(applyAmbiguousFilter(CONFIG.CHARACTERS.numbers, this.options.ambiguous))
    }
    if (this.options.symbols) {
      requiredSets.push(applyAmbiguousFilter(CONFIG.CHARACTERS.symbols, this.options.ambiguous))
    }

    if (requiredSets.length === 0) return password

    const chars = password.split('')

    // Prüfe welche Sets fehlen und ersetze Zeichen
    requiredSets.forEach((set) => {
      const hasCharFromSet = chars.some(char => set.includes(char))
      if (!hasCharFromSet) {
        const replaceIndex = this.getSecureRandomIndex(chars.length)
        const newChar = this.getRandomCharacter(set, set.length)
        chars[replaceIndex] = newChar
      }
    })

    return chars.join('')
  }

  /**
   * Berechnet die Entropie eines Passworts
   * Verwendet die Größe des Zeichen-Pools (nicht nur der vorkommenden Zeichen)
   * @returns {number} Entropie in Bits
   */
  calculateEntropy () {
    const characterSet = this.getCharacterSet()
    const poolSize = characterSet.length

    if (poolSize === 0) return 0

    return this.options.length * Math.log2(poolSize)
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
