# AGENTS.md - Passwortgenerator

## Quick Facts
- Plain JavaScript (ES modules), NO TypeScript. No semicolons, single quotes (`prettierrc`)
- Vite root is `src/` (unusual) → paths in config relative to `src/`
- Build output: `../dist/` (project root), NOT inside `src/`
- Entry: `src/index.html` → `startApp()` → `getApp()` (singleton) → `new PasswordGeneratorApp()` → `app.start()`

## Commands
- `npm run dev` - Vite dev server on port 3000
- `npm run build` - Output to `dist/` (hashed assets, empties on each build)
- `npm test` - Jest via `--experimental-vm-modules` (ESM). Run single test: `npx jest test/PasswordGenerator.test.js`
- `npm run lint` - ESLint (`standard` preset) ONLY for `src/**/*.js`

## Imports
- `@/` alias → `src/` (works in Vite AND Jest via `jest.config.cjs` `moduleNameMapper`)
- `PasswordGenerator.js` imports BOTH `{ CONFIG, DEFAULT_SETTINGS }` — both needed, don't drop either

## Key Architecture
- `PasswordGeneratorApp.start()` is the init method (never call `initialize()`)
- `appInstance` singleton in `PasswordGeneratorApp.js` declared OUTSIDE the class
- `src/events/manager.js`: only `Events` helper is exported; `EventManager` class and `eventManager` singleton are internal
- Settings changes trigger auto-password-regeneration: `handleSettingsChange()` calls `generate()` + `displayPassword()`

## Build Quirks
- Expected Vite warning "outDir is not inside project root" — NORMAL (root=`src/`, outDir=`../dist`)
- CSS in `src/styles/` — served from Vite's `src/` root
- PostCSS: autoprefixer + cssnano (removes all comments), no sourcemaps in production
- Terser drops `console` (except reserved name `"console"`) and `debugger`

## Lint & Test
- ESLint: extends `standard`, `no-console: "warn"`, `prefer-const: "error"`, no semicolons
- Jest: `testEnvironment: 'jsdom'`, no transforms, test files `test/**/*.test.js`
- `jest-environment-jsdom` package must be installed

## Gotchas
- `CONFIG.CHARACTERS.*` holds character strings (not `DEFAULT_SETTINGS.*`, which are booleans)
- `CONFIG.THEMES` CSS variables must stay in sync with `:root` / `[data-theme="dark"]` rules in `src/styles/main.css`
- `dist/` gets emptied on each build (`emptyOutDir: true`)
- `validateOptions()` references `CONFIG.PASSWORD.minLength`/`maxLength`, not `DEFAULT_SETTINGS.length`
