import { PasswordGenerator } from '@/classes/PasswordGenerator.js'

describe('PasswordGenerator', () => {
  test('sollte ein Passwort mit Standardeinstellungen generieren', () => {
    const generator = new PasswordGenerator()
    const password = generator.generate()
    expect(password).toBeDefined()
    expect(password.length).toBe(16)
  })

  test('sollte Passwortlänge anpassen', () => {
    const generator = new PasswordGenerator({ length: 20 })
    const password = generator.generate()
    expect(password.length).toBe(20)
  })

  test('sollte Fehler werfen bei ungültiger Länge', () => {
    const generator = new PasswordGenerator()
    expect(() => {
      generator.updateOptions({ length: 5 })
    }).toThrow()
  })
})
