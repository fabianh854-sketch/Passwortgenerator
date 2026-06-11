/**
 * Hauptanwendung - Passwortgenerator
 * Zentrale Event-Orchestration zwischen allen Komponenten
 */
import { PasswordGenerator } from './classes/PasswordGenerator.js'
import { ThemeManager } from './services/ThemeManager.js'
import { SettingsService } from './services/SettingsService.js'
import { UIManager } from './services/UIManager.js'
import { Events, eventManager } from './events/manager.js'

export class PasswordGeneratorApp {
  constructor () {
    this.passwordGenerator = null
    this.themeManager = null
    this.settingsService = null
    this.uiManager = null
    this.isInitialized = false
  }

  async start () {
    this.initializeServices()
    this.setupEventOrchestration()
    this.initializeUI()
    this.isInitialized = true
  }

  initializeServices () {
    this.settingsService = new SettingsService()
    this.themeManager = new ThemeManager()
    this.passwordGenerator = new PasswordGenerator()
    this.uiManager = new UIManager()
  }

  setupEventOrchestration () {
    eventManager.on('ui:generate', () => this.handleGenerate())
    eventManager.on('ui:toggleTheme', () => this.handleToggleTheme())
    eventManager.on('ui:settingChanged', (data) => this.handleSettingChanged(data))

    Events.onSettingsChanged((data) => this.handleSettingsChanged(data))
    Events.onThemeChanged((data) => this.handleThemeChanged(data))
  }

  initializeUI () {
    const settings = this.settingsService.getSettings()

    this.uiManager.applySettings(settings)
    this.applyTheme(this.themeManager.getCurrentTheme())
    this.generateAndDisplayPassword()
  }

  handleGenerate () {
    this.generateAndDisplayPassword()
  }

  handleToggleTheme () {
    this.themeManager.toggleTheme()
  }

  handleSettingChanged (data) {
    this.settingsService.updateSetting(data.key, data.value)
  }

  handleSettingsChanged (data) {
    if (data.setting === 'length') {
      this.uiManager.updateSliderValue(data.newValue)
    } else if (['uppercase', 'lowercase', 'numbers', 'symbols', 'ambiguous'].includes(data.setting)) {
      this.uiManager.setCheckbox(data.setting, data.newValue)
    }

    if (data.action === 'import' || data.action === 'reset') {
      this.uiManager.applySettings(data.settings)
    }

    this.generateAndDisplayPassword()
  }

  handleThemeChanged (data) {
    this.applyTheme(data.theme)
  }

  applyTheme (theme) {
    const htmlElement = document.documentElement
    htmlElement.setAttribute('data-theme', theme)
    this.uiManager.updateThemeIcon(theme)
  }

  generateAndDisplayPassword () {
    try {
      const settings = this.settingsService.getSettings()
      this.passwordGenerator.updateOptions(settings)
      const password = this.passwordGenerator.generate()
      this.uiManager.displayPassword(password)

      Events.emitPasswordGenerated({
        password,
        options: this.passwordGenerator.getOptions()
      })
    } catch (error) {
      this.uiManager.showError(error.message)
    }
  }
}

// Globale Anwendung Instanz
let appInstance = null

export function getApp () {
  if (!appInstance) {
    appInstance = new PasswordGeneratorApp()
  }
  return appInstance
}

export async function startApp () {
  const app = getApp()
  await app.start()
  return app
}
