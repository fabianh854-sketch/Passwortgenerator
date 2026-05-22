/**
 * Hauptanwendung - Passwortgenerator
 * Zentrale Klasse die alle Komponenten koordiniert
 */
import { CONFIG } from './config/index.js'
import { PasswordGenerator } from './classes/PasswordGenerator.js'
import { ThemeManager } from './services/ThemeManager.js'
import { SettingsService } from './services/SettingsService.js'
import { UIManager } from './services/UIManager.js'

export class PasswordGeneratorApp {
  constructor () {
    this.passwordGenerator = null
    this.themeManager = null
    this.settingsService = null
    this.uiManager = null
    this.isInitialized = false
  }

  /**
   * Startet die Anwendung
   */
  async start () {
    // Initialisiere alle Services
    this.initializeServices()

    // Setze Beziehungen zwischen Services
    this.setupServiceRelationships()

    // Initialisiere UI
    this.initializeUI()

    this.isInitialized = true
  }

  /**
   * Initialisiert alle Services
   */
  initializeServices () {
    // Settings Service zuerst (benötigt für UI)
    this.settingsService = new SettingsService()

    // Theme Manager
    this.themeManager = new ThemeManager()

    // Password Generator
    this.passwordGenerator = new PasswordGenerator()

    // UI Manager
    this.uiManager = new UIManager()
  }

  /**
   * Setzt Beziehungen zwischen Services
   */
  setupServiceRelationships () {
    // UI Manager bekommt Zugriff auf andere Services
    this.uiManager.setPasswordGenerator(this.passwordGenerator)
    this.uiManager.setThemeManager(this.themeManager)
    this.uiManager.setSettingsService(this.settingsService)
  }

  /**
   * Initialisiert die Benutzeroberfläche
   */
  initializeUI () {
    // Setze Event Listener für UI Interaktionen
    this.setupUIEventListeners()

    // Aktualisiere UI mit geladenen Einstellungen
    this.settingsService.applySettings()

    // Generiere erstes Passwort
    this.generateInitialPassword()
  }

  /**
   * Setzt UI Event Listener
   */
  setupUIEventListeners () {
    // Event Listener für Settings Änderungen
    document.addEventListener('change', e => {
      if (this.isSettingsChange(e)) {
        this.handleSettingsChange(e)
      }
    })
  }

  /**
   * Prüft ob es sich um eine Einstellungsänderung handelt
   * @param {Event} e - Das Event
   * @returns {boolean}
   */
  isSettingsChange (e) {
    const selectors = [
      CONFIG.UI.lengthSliderSelector,
      CONFIG.UI.uppercaseSelector,
      CONFIG.UI.lowercaseSelector,
      CONFIG.UI.numbersSelector,
      CONFIG.UI.symbolsSelector,
      CONFIG.UI.ambiguousSelector
    ]

    return selectors.some(selector => e.target.matches(selector))
  }

  /**
   * Handlet Einstellungsänderungen
   * @param {Event} e - Das Event
   */
  handleSettingsChange (e) {
    const settings = this.settingsService.getSettings()
    this.passwordGenerator.updateOptions(settings)
    const password = this.passwordGenerator.generate()
    this.uiManager.displayPassword(password)
  }

  /**
   * Generiert das initiale Passwort
   */
  generateInitialPassword () {
    const settings = this.settingsService.getSettings()
    this.passwordGenerator.updateOptions(settings)
    const password = this.passwordGenerator.generate()

    this.uiManager.displayPassword(password)
  }
}

// Globale Anwendung Instanz
let appInstance = null

/**
 * Gibt die globale Anwendung Instanz zurück
 * @returns {PasswordGeneratorApp}
 */
export function getApp () {
  if (!appInstance) {
    appInstance = new PasswordGeneratorApp()
  }
  return appInstance
}

/**
 * Startet die Anwendung (wird direkt aufgerufen)
 */
export async function startApp () {
  const app = getApp()
  await app.start()
  return app
}
