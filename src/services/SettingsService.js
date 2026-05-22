/**
 * Settings Service
 * Verwaltung der Anwendungseinstellungen mit lokaler Speicherung
 */
import { CONFIG, DEFAULT_SETTINGS } from '../config/index.js'
import { Events } from '../events/manager.js'

export class SettingsService {
  constructor () {
    this.settings = { ...DEFAULT_SETTINGS }
    this.initialize()
  }

  /**
   * Initialisiert den Settings Service
   */
  initialize () {
    this.loadSettings()
    this.setupUIListeners()
    this.applySettings()
  }

  /**
   * Lädt gespeicherte Einstellungen aus localStorage
   */
  loadSettings () {
    try {
      const savedSettings = localStorage.getItem(CONFIG.STORAGE.settings)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        this.settings = { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      this.settings = { ...DEFAULT_SETTINGS }
    }
  }

  /**
   * Setzt UI Event Listener
   */
  setupUIListeners () {
    // Länge Slider
    const lengthSlider = document.querySelector(CONFIG.UI.lengthSliderSelector)
    const lengthValue = document.querySelector(CONFIG.UI.lengthValueSelector)

    if (lengthSlider && lengthValue) {
      lengthSlider.addEventListener('input', e => {
        this.updateSetting('length', parseInt(e.target.value))
        lengthValue.textContent = e.target.value
      })
    }

    // Optionen Checkboxes
    const options = ['uppercase', 'lowercase', 'numbers', 'symbols', 'ambiguous']
    options.forEach(option => {
      const checkbox = document.querySelector(CONFIG.UI[`${option}Selector`])
      if (checkbox) {
        checkbox.addEventListener('change', e => {
          this.updateSetting(option, e.target.checked)
        })
      }
    })
  }

  /**
   * Aktualisiert eine Einstellung
   * @param {string} key - Einstellungsschlüssel
   * @param {*} value - Neuer Wert
   */
  updateSetting (key, value) {
    const oldValue = this.settings[key]
    this.settings[key] = value

    // Speichere die Änderung
    this.saveSettings()

    // Emitiere Event bei Änderung
    if (oldValue !== value) {
      Events.emitSettingsChanged({
        setting: key,
        oldValue,
        newValue: value,
        settings: this.settings
      })
    }
  }

  /**
   * Wendet die aktuellen Einstellungen an
   */
  applySettings () {
    // Setze UI Elemente auf gespeicherte Werte
    const lengthSlider = document.querySelector(CONFIG.UI.lengthSliderSelector)
    const lengthValue = document.querySelector(CONFIG.UI.lengthValueSelector)

    if (lengthSlider && lengthValue) {
      lengthSlider.value = this.settings.length
      lengthValue.textContent = this.settings.length
    }

    // Setze Checkboxes
    const options = ['uppercase', 'lowercase', 'numbers', 'symbols', 'ambiguous']
    options.forEach(option => {
      const checkbox = document.querySelector(CONFIG.UI[`${option}Selector`])
      if (checkbox) {
        checkbox.checked = this.settings[option]
      }
    })
  }

  /**
   * Speichert die Einstellungen in localStorage
   */
  saveSettings () {
    try {
      localStorage.setItem(CONFIG.STORAGE.settings, JSON.stringify(this.settings))
    } catch (error) {
    }
  }

  /**
   * Gibt alle aktuellen Einstellungen zurück
   * @returns {Object} Aktuelle Einstellungen
   */
  getSettings () {
    return { ...this.settings }
  }

  /**
   * Setzt Einstellungen auf Standardwerte zurück
   */
  resetSettings () {
    this.settings = { ...DEFAULT_SETTINGS }
    this.saveSettings()
    this.applySettings()
    Events.emitSettingsChanged({
      action: 'reset',
      settings: this.settings
    })
  }

  /**
   * Importiert Einstellungen
   * @param {Object} newSettings - Neue Einstellungen
   */
  importSettings (newSettings) {
    this.settings = { ...DEFAULT_SETTINGS, ...newSettings }
    this.saveSettings()
    this.applySettings()
    Events.emitSettingsChanged({
      action: 'import',
      settings: this.settings
    })
  }

  /**
   * Exportiert aktuelle Einstellungen
   * @returns {Object} Exportierte Einstellungen
   */
  exportSettings () {
    return JSON.stringify(this.settings, null, 2)
  }
}
