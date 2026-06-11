/**
 * Settings Service
 * Verwaltung der Anwendungseinstellungen mit lokaler Speicherung
 * Kein DOM-Zugriff – reiner Data-Service
 */
import { CONFIG, DEFAULT_SETTINGS } from '../config/index.js'
import { Events } from '../events/manager.js'
import { createStorageProxy } from '../interfaces.js'

export class SettingsService {
  /**
   * @param {Object} deps
   * @param {Object} deps.storageProxy - Storage-Abstraktion (optional)
   */
  constructor (deps = {}) {
    this.storage = deps.storageProxy || createStorageProxy(typeof localStorage !== 'undefined' ? localStorage : null)
    this.settings = { ...DEFAULT_SETTINGS }
    this.loadSettings()
  }

  /**
   * Lädt gespeicherte Einstellungen
   */
  loadSettings () {
    try {
      const savedSettings = this.storage.get(CONFIG.STORAGE.settings)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        this.settings = { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.warn('Fehler beim Laden der Einstellungen:', error) // eslint-disable-line no-console
      this.settings = { ...DEFAULT_SETTINGS }
    }
  }

  /**
   * Aktualisiert eine Einstellung
   * @param {string} key - Einstellungsschlüssel
   * @param {*} value - Neuer Wert
   */
  updateSetting (key, value) {
    const oldValue = this.settings[key]
    this.settings[key] = value
    this.saveSettings()

    if (oldValue !== value) {
      Events.emitSettingsChanged({
        setting: key,
        oldValue,
        newValue: value,
        settings: { ...this.settings }
      })
    }
  }

  /**
   * Speichert die Einstellungen
   */
  saveSettings () {
    try {
      this.storage.set(CONFIG.STORAGE.settings, JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Fehler beim Speichern der Einstellungen:', error) // eslint-disable-line no-console
    }
  }

  getSettings () {
    return { ...this.settings }
  }

  getSetting (key) {
    return this.settings[key]
  }

  resetSettings () {
    this.settings = { ...DEFAULT_SETTINGS }
    this.saveSettings()
    Events.emitSettingsChanged({
      action: 'reset',
      settings: { ...this.settings }
    })
  }

  importSettings (newSettings) {
    this.settings = { ...DEFAULT_SETTINGS, ...newSettings }
    this.saveSettings()
    Events.emitSettingsChanged({
      action: 'import',
      settings: { ...this.settings }
    })
  }

  exportSettings () {
    return JSON.stringify(this.settings, null, 2)
  }
}
