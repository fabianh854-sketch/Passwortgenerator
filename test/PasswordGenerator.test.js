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

  test('sollte Passwort mit nur Großbuchstaben generieren', () => {
    const generator = new PasswordGenerator({
      length: 16,
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false
    })
    const password = generator.generate()
    expect(password).toMatch(/^[A-Z]+$/)
    expect(password.length).toBe(16)
  })

  test('sollte Passwort mit nur Kleinbuchstaben generieren', () => {
    const generator = new PasswordGenerator({
      length: 16,
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false
    })
    const password = generator.generate()
    expect(password).toMatch(/^[a-z]+$/)
    expect(password.length).toBe(16)
  })

  test('sollte Passwort mit nur Zahlen generieren', () => {
    const generator = new PasswordGenerator({
      length: 16,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false
    })
    const password = generator.generate()
    expect(password).toMatch(/^[0-9]+$/)
    expect(password.length).toBe(16)
  })

  test('sollte Passwort mit nur Symbolen generieren', () => {
    const generator = new PasswordGenerator({
      length: 16,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: true
    })
    const password = generator.generate()
    expect(password).toMatch(/^[\!@#\$%\^&\*\(\)_\+~`|\}\{\[\]:;\?><,\.\/\-=]+$/)
    expect(password.length).toBe(16)
  })

  test('sollte Fehler werfen wenn keine Zeichenart ausgewählt', () => {
    const generator = new PasswordGenerator({
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false
    })
    expect(() => {
      generator.generate()
    }).toThrow('Mindestens eine Zeichenart muss ausgewählt sein')
  })

  test('sollte garantieren dass jede Zeichenart mindestens einmal vorkommt', () => {
    const generator = new PasswordGenerator({
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    })

    for (let i = 0; i < 20; i++) {
      const password = generator.generate()
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
      expect(password).toMatch(/[\!@#\$%\^&\*\(\)_\+~`|\}\{\[\]:;\?><,\.\/\-=]/)
    }
  })

  test('sollte korrekte Länge bei ambiguous: true behalten', () => {
    const generator = new PasswordGenerator({
      length: 20,
      ambiguous: true
    })
    const password = generator.generate()
    expect(password.length).toBe(20)
  })

  test('sollte ambiguous Zeichen nicht im Passwort enthalten', () => {
    const generator = new PasswordGenerator({
      length: 32,
      uppercase: true,
      lowercase: true,
      numbers: true,
      ambiguous: true
    })

    const password = generator.generate()
    expect(password).not.toMatch(/[Il1|O0o]/)
  })

  test('sollte korrekte Entropie berechnen', () => {
    const generator = new PasswordGenerator({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      ambiguous: false
    })

    // Pool: 26 + 26 + 10 + 30 = 92 Zeichen
    // Entropie: 16 * log2(92) ≈ 104.2
    const entropy = generator.calculateEntropy()
    expect(entropy).toBeCloseTo(104.2, 0)
  })

  test('sollte Entropie mit ambiguous Filter berechnen', () => {
    const generator = new PasswordGenerator({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      ambiguous: true
    })

    const entropy = generator.calculateEntropy()
    expect(entropy).toBeGreaterThan(0)
  })

  test('sollte keine Modulo-Bias haben (statistischer Test)', () => {
    const generator = new PasswordGenerator({
      length: 12,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false
    })

    const counts = {}
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      const password = generator.generate()
      const char = password[0] // Nur erstes Zeichen testen
      counts[char] = (counts[char] || 0) + 1
    }

    // Jede Ziffer sollte etwa gleich oft vorkommen (±20% Toleranz)
    const expectedCount = iterations / 10
    for (let digit = 0; digit <= 9; digit++) {
      const count = counts[digit.toString()] || 0
      expect(count).toBeGreaterThan(expectedCount * 0.8)
      expect(count).toBeLessThan(expectedCount * 1.2)
    }
  })

  test('sollte Optionen aktualisieren können', () => {
    const generator = new PasswordGenerator({ length: 16 })
    generator.updateOptions({ length: 24 })

    const options = generator.getOptions()
    expect(options.length).toBe(24)
  })

  test('sollte Optionen auf Standard zurücksetzen', () => {
    const generator = new PasswordGenerator({ length: 24 })
    generator.resetOptions()

    const options = generator.getOptions()
    expect(options.length).toBe(16)
    expect(options.uppercase).toBe(true)
  })

  test('sollte getCharacterSet korrekt aufbauen', () => {
    const generator = new PasswordGenerator({
      uppercase: true,
      lowercase: false,
      numbers: true,
      symbols: false
    })

    const charSet = generator.getCharacterSet()
    expect(charSet).toMatch(/[A-Z]/)
    expect(charSet).toMatch(/[0-9]/)
    expect(charSet).not.toMatch(/[a-z]/)
  })
})
