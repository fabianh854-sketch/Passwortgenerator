/**
 * Theme Manager Service
 * Verwaltung von Dark/Light Themes
 * Kein DOM-Zugriff – reiner State-Service
 */
import { CONFIG } from '../config/index.js'
import { Events } from '../events/manager.js'
import { createStorageProxy } from '../interfaces.js'

export class ThemeManager {
  /**
   * @param {Object} deps
   * @param {Object} deps.storageProxy - Storage-Abstraktion (optional)
   * @param {Object} deps.mediaQuery - window.matchMedia Abstraktion (optional)
   */
  constructor (deps = {}) {
    this.storage = deps.storageProxy || createStorageProxy(typeof localStorage !== 'undefined' ? localStorage : null)
    this.mediaQuery = deps.mediaQuery || null
    this.currentTheme = null
    this.loadSavedTheme()
  }

  getSystemPreference () {
    if (this.mediaQuery) {
      return this.mediaQuery.matches ? 'dark' : 'light'
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  loadSavedTheme () {
    const savedTheme = this.storage.get(CONFIG.STORAGE.theme)
    if (savedTheme) {
      this.currentTheme = savedTheme
    } else {
      this.currentTheme = this.getSystemPreference()
    }
  }

  toggleTheme () {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.saveTheme()
    Events.emitThemeChanged({ theme: this.currentTheme })
  }

  saveTheme () {
    this.storage.set(CONFIG.STORAGE.theme, this.currentTheme)
  }

  getCurrentTheme () {
    return this.currentTheme
  }

  setTheme (theme) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('Theme muss "light" oder "dark" sein')
    }

    this.currentTheme = theme
    this.saveTheme()
    Events.emitThemeChanged({ theme: this.currentTheme })
  }

  setupSystemThemeListener (onSystemThemeChange) {
    let mq = this.mediaQuery
    if (!mq && typeof window !== 'undefined' && window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
    }

    if (!mq) return function noop () {}

    const handler = (e) => {
      const userSavedTheme = this.storage.get(CONFIG.STORAGE.theme)
      if (!userSavedTheme) {
        const theme = e.matches ? 'dark' : 'light'
        onSystemThemeChange(theme)
      }
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }
}
