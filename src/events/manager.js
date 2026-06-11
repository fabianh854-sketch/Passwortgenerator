/**
 * Event Manager
 * Zentrale Event-Verwaltung via nativem EventTarget
 */
import { CONFIG } from '../config/index.js'

class AppEventBus extends EventTarget {
  emit (eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }))
  }

  on (eventName, callback) {
    this.addEventListener(eventName, callback)
  }

  off (eventName, callback) {
    this.removeEventListener(eventName, callback)
  }

  once (eventName, callback) {
    const wrapper = (event) => {
      this.off(eventName, wrapper)
      callback(event.detail)
    }
    this.on(eventName, wrapper)
  }
}

export const eventManager = new AppEventBus()

const listenerMap = new WeakMap()

function wrap (callback) {
  const wrapper = (e) => callback(e.detail)
  listenerMap.set(callback, wrapper)
  return wrapper
}

function unwrap (callback) {
  return listenerMap.get(callback)
}

export const Events = {
  onPasswordGenerated: (callback) => eventManager.on(CONFIG.EVENTS.passwordGenerated, wrap(callback)),
  offPasswordGenerated: (callback) => eventManager.off(CONFIG.EVENTS.passwordGenerated, unwrap(callback)),
  emitPasswordGenerated: (detail) => eventManager.emit(CONFIG.EVENTS.passwordGenerated, detail),

  onPasswordCopied: (callback) => eventManager.on(CONFIG.EVENTS.passwordCopied, wrap(callback)),
  offPasswordCopied: (callback) => eventManager.off(CONFIG.EVENTS.passwordCopied, unwrap(callback)),
  emitPasswordCopied: (detail) => eventManager.emit(CONFIG.EVENTS.passwordCopied, detail),

  onThemeChanged: (callback) => eventManager.on(CONFIG.EVENTS.themeChanged, wrap(callback)),
  offThemeChanged: (callback) => eventManager.off(CONFIG.EVENTS.themeChanged, unwrap(callback)),
  emitThemeChanged: (detail) => eventManager.emit(CONFIG.EVENTS.themeChanged, detail),

  onSettingsChanged: (callback) => eventManager.on(CONFIG.EVENTS.settingsChanged, wrap(callback)),
  offSettingsChanged: (callback) => eventManager.off(CONFIG.EVENTS.settingsChanged, unwrap(callback)),
  emitSettingsChanged: (detail) => eventManager.emit(CONFIG.EVENTS.settingsChanged, detail)
}
