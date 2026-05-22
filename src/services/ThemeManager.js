/**
 * Theme Manager Service
 * Verwaltung von Dark/Light Themes mit lokaler Speicherung
 */
import { CONFIG } from '../config/index.js'
import { Events } from '../events/manager.js'

export class ThemeManager {
  constructor () {
    this.currentTheme = null
    this.initialize()
  }

  /**
   * Initialisiert den Theme Manager
   */
  initialize () {
    this.loadSavedTheme()
    this.setupSystemThemeListener()
    this.applyTheme()
  }

  /**
   * Lädt den gespeicherten Theme aus localStorage
   */
  loadSavedTheme () {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE.theme)
    if (savedTheme) {
      this.currentTheme = savedTheme
    } else {
      // Nutze Systemeinstellung als Fallback
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.currentTheme = prefersDark ? 'dark' : 'light'
    }
  }

  /**
   * Setzt einen Listener für System-Theme-Änderungen
   */
  setupSystemThemeListener () {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', e => {
      if (!localStorage.getItem(CONFIG.STORAGE.theme)) {
        this.currentTheme = e.matches ? 'dark' : 'light'
        this.applyTheme()
        Events.emitThemeChanged({ theme: this.currentTheme })
      }
    })
  }

  /**
   * Schaltet zwischen Themes um
   */
  toggleTheme () {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme()
    this.saveTheme()
    Events.emitThemeChanged({ theme: this.currentTheme })
  }

  /**
   * Wendet den aktuellen Theme an
   */
  applyTheme () {
    const htmlElement = document.documentElement
    htmlElement.setAttribute('data-theme', this.currentTheme)

    // Update Theme Button Icon
    const themeToggle = document.querySelector(CONFIG.UI.themeToggleSelector)
    if (themeToggle) {
      themeToggle.innerHTML = this.currentTheme === 'dark' ? CONFIG.ICONS.sun : CONFIG.ICONS.moon
    }
  }

  /**
   * Speichert den Theme in localStorage
   */
  saveTheme () {
    localStorage.setItem(CONFIG.STORAGE.theme, this.currentTheme)
  }

  /**
   * Gibt den aktuellen Theme zurück
   * @returns {string} Aktuell verwendeter Theme
   */
  getCurrentTheme () {
    return this.currentTheme
  }

  /**
   * Setzt einen bestimmten Theme
   * @param {string} theme - 'light' oder 'dark'
   */
  setTheme (theme) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('Theme muss "light" oder "dark" sein')
    }

    this.currentTheme = theme
    this.applyTheme()
    this.saveTheme()
    Events.emitThemeChanged({ theme: this.currentTheme })
  }
}
