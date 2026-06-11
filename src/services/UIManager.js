/**
 * UI Manager Service
 * Reiner Darstellungs-Layer ohne Business-Logik
 * Kommuniziert ausschließlich über Events
 */
import { CONFIG } from '../config/index.js'
import { Events, eventManager } from '../events/manager.js'
import { createDOMProxy } from '../interfaces.js'

export class UIManager {
  /**
   * @param {Object} deps
   * @param {Object} deps.dom - DOM-Proxy (optional)
   */
  constructor (deps = {}) {
    this.dom = deps.dom || createDOMProxy()
    this.initialize()
  }

  initialize () {
    this.setupEventListeners()
    this.updateUIElements()
  }

  setupEventListeners () {
    const generateBtn = this.dom.query(CONFIG.UI.generateBtnSelector)
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        eventManager.emit('ui:generate')
      })
    }

    const copyBtn = this.dom.query(CONFIG.UI.copyBtnSelector)
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.handleCopyClick())
    }

    const themeToggle = this.dom.query(CONFIG.UI.themeToggleSelector)
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        eventManager.emit('ui:toggleTheme')
      })
    }

    this.setupSettingsListeners()

    this.dom.addEventListener('keydown', e => this.handleKeyboardShortcuts(e))
  }

  setupSettingsListeners () {
    const lengthSlider = this.dom.query(CONFIG.UI.lengthSliderSelector)
    if (lengthSlider) {
      lengthSlider.addEventListener('input', e => {
        const value = parseInt(e.target.value)
        this.updateLengthDisplay(value)
        eventManager.emit('ui:settingChanged', { key: 'length', value })
      })
    }

    const options = ['uppercase', 'lowercase', 'numbers', 'symbols', 'ambiguous']
    options.forEach(option => {
      const checkbox = this.dom.query(CONFIG.UI[`${option}Selector`])
      if (checkbox) {
        checkbox.addEventListener('change', e => {
          eventManager.emit('ui:settingChanged', {
            key: option,
            value: e.target.checked
          })
        })
      }
    })
  }

  handleCopyClick () {
    const passwordInput = this.dom.query(CONFIG.UI.passwordInputSelector)
    if (!passwordInput || !passwordInput.value) {
      this.showError('Kein Passwort zum Kopieren vorhanden')
      return
    }

    this.copyToClipboard(passwordInput.value)
  }

  async copyToClipboard (password) {
    try {
      await navigator.clipboard.writeText(password)
      this.showCopyFeedback()
      Events.emitPasswordCopied({ password, timestamp: Date.now() })
    } catch (error) {
      this.showError('Fehler beim Kopieren des Passworts')
    }
  }

  handleKeyboardShortcuts (e) {
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault()
      eventManager.emit('ui:generate')
    }

    const activeId = document.activeElement ? document.activeElement.id : ''
    if (e.ctrlKey && e.key === 'c' && activeId === 'password') {
      e.preventDefault()
      this.handleCopyClick()
    }

    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault()
      eventManager.emit('ui:toggleTheme')
    }
  }

  updateUIElements () {
    const passwordInput = this.dom.query(CONFIG.UI.passwordInputSelector)
    if (passwordInput) {
      passwordInput.focus()
    }
  }

  // === Render-Methoden ===

  displayPassword (password) {
    const passwordInput = this.dom.query(CONFIG.UI.passwordInputSelector)
    if (passwordInput) {
      passwordInput.value = password
    }
  }

  updateThemeIcon (theme) {
    const themeToggle = this.dom.query(CONFIG.UI.themeToggleSelector)
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? CONFIG.ICONS.sun : CONFIG.ICONS.moon
    }
  }

  updateSliderValue (value) {
    const lengthSlider = this.dom.query(CONFIG.UI.lengthSliderSelector)
    const lengthValue = this.dom.query(CONFIG.UI.lengthValueSelector)

    if (lengthSlider) {
      lengthSlider.value = value
    }
    if (lengthValue) {
      lengthValue.textContent = value
    }
  }

  updateLengthDisplay (value) {
    const lengthValue = this.dom.query(CONFIG.UI.lengthValueSelector)
    if (lengthValue) {
      lengthValue.textContent = value
    }
  }

  setCheckbox (key, checked) {
    const checkbox = this.dom.query(CONFIG.UI[`${key}Selector`])
    if (checkbox) {
      checkbox.checked = checked
    }
  }

  applySettings (settings) {
    this.updateSliderValue(settings.length)

    const options = ['uppercase', 'lowercase', 'numbers', 'symbols', 'ambiguous']
    options.forEach(option => {
      this.setCheckbox(option, settings[option])
    })
  }

  showError (message) {
    console.error(message) // eslint-disable-line no-console
    alert(message)
  }

  showCopyFeedback () {
    const copyBtn = this.dom.query(CONFIG.UI.copyBtnSelector)
    if (copyBtn) {
      const originalContent = copyBtn.innerHTML
      copyBtn.innerHTML = CONFIG.ICONS.check

      setTimeout(() => {
        copyBtn.innerHTML = originalContent
      }, 1500)
    }
  }
}
