/**
 * UI Manager Service
 * Verwaltung der Benutzeroberfläche und Interaktionen
 */
import { CONFIG } from '../config/index.js'
import { Events } from '../events/manager.js'

export class UIManager {
  constructor () {
    this.passwordGenerator = null
    this.themeManager = null
    this.settingsService = null
    this.initialize()
  }

  /**
   * Initialisiert den UI Manager
   */
  initialize () {
    this.setupEventListeners()
    this.updateUIElements()
  }

  /**
   * Setzt Event Listener für UI Interaktionen
   */
  setupEventListeners () {
    // Generieren Button
    const generateBtn = document.querySelector(CONFIG.UI.generateBtnSelector)
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePassword())
    }

    // Kopieren Button
    const copyBtn = document.querySelector(CONFIG.UI.copyBtnSelector)
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyPassword())
    }

    // Theme Toggle
    const themeToggle = document.querySelector(CONFIG.UI.themeToggleSelector)
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme())
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', e => this.handleKeyboardShortcuts(e))
  }

  /**
   * Aktualisiert UI Elemente
   */
  updateUIElements () {
    // Setze initialen Fokus auf Passwortfeld
    const passwordInput = document.querySelector(CONFIG.UI.passwordInputSelector)
    if (passwordInput) {
      passwordInput.focus()
    }
  }

  /**
   * Generiert ein neues Passwort
   */
  generatePassword () {
    try {
      if (!this.passwordGenerator) {
        throw new Error('PasswordGenerator nicht initialisiert')
      }

      // Aktuelle Einstellungen abrufen
      const settings = this.settingsService.getSettings()
      this.passwordGenerator.updateOptions(settings)

      // Passwort generieren
      const password = this.passwordGenerator.generate()

      // UI aktualisieren
      this.displayPassword(password)

      // Event auslösen
      Events.emitPasswordGenerated({
        password,
        options: this.passwordGenerator.getOptions()
      })
    } catch (error) {
      this.showError(error.message)
    }
  }

  /**
   * Zeigt das generierte Passwort an
   * @param {string} password - Das Passwort
   */
  displayPassword (password) {
    const passwordInput = document.querySelector(CONFIG.UI.passwordInputSelector)
    if (passwordInput) {
      passwordInput.value = password
    }
  }

  /**
   * Kopiert das Passwort in die Zwischenablage
   */
  async copyPassword () {
    const passwordInput = document.querySelector(CONFIG.UI.passwordInputSelector)
    const copyBtn = document.querySelector(CONFIG.UI.copyBtnSelector)

    if (!passwordInput || !passwordInput.value) {
      this.showError('Kein Passwort zum Kopieren vorhanden')
      return
    }

    try {
      // Selektiere das Passwort
      passwordInput.select()
      passwordInput.setSelectionRange(0, 99999)

      // Kopiere in Zwischenablage
      await navigator.clipboard.writeText(passwordInput.value)

      // Visuelle Rückmeldung
      if (copyBtn) {
        const originalContent = copyBtn.innerHTML
        copyBtn.innerHTML = CONFIG.ICONS.check

        setTimeout(() => {
          copyBtn.innerHTML = originalContent
        }, 1500)
      }

      // Event auslösen
      Events.emitPasswordCopied({
        password: passwordInput.value,
        timestamp: Date.now()
      })
    } catch (error) {
      this.showError('Fehler beim Kopieren des Passworts')
    }
  }

  /**
   * Schaltet das Theme um
   */
  toggleTheme () {
    if (this.themeManager) {
      this.themeManager.toggleTheme()
    }
  }

  /**
   * Handelt Keyboard Shortcuts
   * @param {KeyboardEvent} e - Keyboard Event
   */
  handleKeyboardShortcuts (e) {
    // Strg+R: Neugenerieren
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault()
      this.generatePassword()
    }

    // Strg+C: Kopieren (wenn Passwortfeld fokussiert ist)
    if (e.ctrlKey && e.key === 'c' && document.activeElement.id === 'password') {
      e.preventDefault()
      this.copyPassword()
    }

    // Strg+D: Theme Toggle
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault()
      this.toggleTheme()
    }
  }

  /**
   * Zeigt eine Fehlermeldung an
   * @param {string} message - Fehlermeldung
   */
  showError (message) {
    // Optional: Toast Notification implementieren
    alert(message) // Einfache Implementierung
  }

  /**
   * Setzt den Password Generator
   * @param {PasswordGenerator} generator - Die Generator Instanz
   */
  setPasswordGenerator (generator) {
    this.passwordGenerator = generator
  }

  /**
   * Setzt den Theme Manager
   * @param {ThemeManager} manager - Der Manager Instanz
   */
  setThemeManager (manager) {
    this.themeManager = manager
  }

  /**
   * Setzt den Settings Service
   * @param {SettingsService} service - Der Service Instanz
   */
  setSettingsService (service) {
    this.settingsService = service
  }
}
