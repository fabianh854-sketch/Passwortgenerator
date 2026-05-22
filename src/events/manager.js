/**
 * Event Manager Klasse
 * Zentrale Event-Verwaltung für lose Kopplung zwischen Komponenten
 */
import { CONFIG } from '../config/index.js'

class EventManager {
  constructor () {
    this.events = {}
    this.maxListeners = 100 // Prevent memory leaks
  }

  /**
     * Registriert einen Event Listener
     * @param {string} event - Event Name
     * @param {Function} callback - Callback Funktion
     * @param {Object} context - Context für die Callback-Funktion
     */
  on (event, callback, context = null) {
    if (typeof callback !== 'function') {
      throw new Error('Callback muss eine Funktion sein')
    }

    if (!this.events[event]) {
      this.events[event] = []
    }

    // Überprüfe auf zu viele Listener für ein Event
    if (this.events[event].length >= this.maxListeners) {
      return
    }

    this.events[event].push({
      callback,
      context
    })
  }

  /**
     * Registriert einen einmaligen Event Listener
     * @param {string} event - Event Name
     * @param {Function} callback - Callback Funktion
     * @param {Object} context - Context für die Callback-Funktion
     */
  once (event, callback, context = null) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper)
      callback.apply(context, args)
    }

    this.on(event, onceWrapper, context)
  }

  /**
     * Entfernt Event Listener
     * @param {string} event - Event Name
     * @param {Function} callback - Callback Funktion
     */
  off (event, callback) {
    if (!this.events[event]) {
      return
    }

    this.events[event] = this.events[event].filter(
      listener => listener.callback !== callback
    )

    // Wenn keine Listener mehr übrig, Event entfernen
    if (this.events[event].length === 0) {
      delete this.events[event]
    }
  }

  /**
     * Löst ein Event aus
     * @param {string} event - Event Name
     * @param {*} data - Event Daten
     */
  emit (event, data = null) {
    if (!this.events[event]) {
      return
    }

    // Erstelle eine Kopie der Listener um Änderungen während der Ausführung zu vermeiden
    const listeners = [...this.events[event]]

    listeners.forEach(listener => {
      try {
        listener.callback.call(listener.context, data)
      } catch (error) {
      }
    })
  }

  /**
     * Entfernt alle Listener für ein Event
     * @param {string} event - Event Name
     */
  removeAllListeners (event) {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }

  /**
     * Gibt die Anzahl der Listener für ein Event zurück
     * @param {string} event - Event Name
     * @returns {number} Anzahl der Listener
     */
  listenerCount (event) {
    return this.events[event] ? this.events[event].length : 0
  }

  /**
     * Gibt alle registrierten Events zurück
     * @returns {Array} Array von Event Namen
     */
  eventNames () {
    return Object.keys(this.events)
  }
}

/**
 * Globale Instanz des Event Managers
 */
const eventManager = new EventManager()

/**
 * Hilfsfunktionen für häufig verwendete Events
 */
export const Events = {
  // Password Events
  onPasswordGenerated: (callback, context) => {
    eventManager.on(CONFIG.EVENTS.passwordGenerated, callback, context)
  },
  offPasswordGenerated: (callback) => {
    eventManager.off(CONFIG.EVENTS.passwordGenerated, callback)
  },
  emitPasswordGenerated: (data) => {
    eventManager.emit(CONFIG.EVENTS.passwordGenerated, data)
  },

  // Copy Events
  onPasswordCopied: (callback, context) => {
    eventManager.on(CONFIG.EVENTS.passwordCopied, callback, context)
  },
  offPasswordCopied: (callback) => {
    eventManager.off(CONFIG.EVENTS.passwordCopied, callback)
  },
  emitPasswordCopied: (data) => {
    eventManager.emit(CONFIG.EVENTS.passwordCopied, data)
  },

  // Theme Events
  onThemeChanged: (callback, context) => {
    eventManager.on(CONFIG.EVENTS.themeChanged, callback, context)
  },
  offThemeChanged: (callback) => {
    eventManager.off(CONFIG.EVENTS.themeChanged, callback)
  },
  emitThemeChanged: (data) => {
    eventManager.emit(CONFIG.EVENTS.themeChanged, data)
  },

  // Settings Events
  onSettingsChanged: (callback, context) => {
    eventManager.on(CONFIG.EVENTS.settingsChanged, callback, context)
  },
  offSettingsChanged: (callback) => {
    eventManager.off(CONFIG.EVENTS.settingsChanged, callback)
  },
  emitSettingsChanged: (data) => {
    eventManager.emit(CONFIG.EVENTS.settingsChanged, data)
  }
}
