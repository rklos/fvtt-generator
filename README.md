# generator-fvtt

Yeoman generator for scaffolding and maintaining Foundry VTT projects. Supports three project types:

- **module** — standalone Foundry VTT modules (e.g., dice manipulation, token utilities)
- **system** — complete game systems with data models, sheets, and compendium packs
- **warhammer-translation** — Polish translation modules for Warhammer 40k systems on Foundry VTT

## Installation

No global install required. The generator is added as a dev dependency to each project:

```bash
npm install --save-dev yo generator-fvtt
```

Or from GitHub directly:

```bash
npm install --save-dev yo github:rklos/fvtt-generator
```

The generator automatically adds both `yo` and `generator-fvtt` to your project's devDependencies and creates an `npm run scaffold` script.

## Quick Start

### Create a new project

```bash
mkdir my-fvtt-module && cd my-fvtt-module
npm init -y
npm install --save-dev yo generator-fvtt
npx yo fvtt
```

`npx yo fvtt` asks which project type you want and delegates to the appropriate sub-generator. You can also call sub-generators directly:

```bash
npx yo fvtt:module
npx yo fvtt:system
npx yo fvtt:warhammer-translation
```

### Update an existing project

After the first run, just use the generated npm script:

```bash
npm run scaffold
```

Or equivalently:

```bash
npx yo fvtt
```

The generator detects the project type from `.yo-rc.json` and re-applies the scaffolding. Your source code in `src/` is never overwritten — only config, tooling, and workflow files are updated.

## Project Types

### Module (`yo fvtt:module`)

Scaffolds a Foundry VTT module with:

| File | Re-run behavior |
|------|----------------|
| `package.json` | Merged (your deps preserved) |
| `.npmrc`, `.gitignore`, `vite-env.d.ts` | Overwritten |
| `eslint.config.js`, `tsconfig.json` | Overwritten |
| `vite.config.js` | Overwritten |
| `tools/bump-version.ts` | Overwritten |
| `.github/workflows/release.yml` | Overwritten |
| `src/main.ts`, `src/constants.ts`, `src/settings.ts`, `src/types.d.ts` | First run only |
| `src/module.json` | First run only |
| `src/lang/*.json` | First run only |

**Prompts:**

| Prompt | Example |
|--------|---------|
| Module ID | `fumble-switch` |
| Title | `Fumble Switch (Cheated Rolls)` |
| Description | `GM tool for dice manipulation` |
| Author name | `Radoslaw Klos` |
| Author email | `radoslaw@klos.dev` |
| License | `MIT` or `GPL-3.0` |
| Output filename | `fumble-switch` |
| Languages | `en`, `pl` |
| Optional dependencies | `dice-so-nice` (comma-separated) |

### System (`yo fvtt:system`)

Scaffolds a Foundry VTT game system. Includes everything from `module` plus:

| File | Re-run behavior |
|------|----------------|
| `vitest.config.ts` | Overwritten |
| `tools/build-packs.ts` | Overwritten |
| `tools/release.ts` | Overwritten |
| `src/static/system.json` | First run only |
| `src/static/lang/*.json` | First run only |
| `src/scss/` | First run only |
| `src/__tests__/setup.ts` | First run only |

**Additional prompts:**

| Prompt | Example |
|--------|---------|
| Actor types | `character, npc, enemy` |
| Item types | `weapon, armor, equipment` |
| Include vitest | `true` |
| Packs | `weapons:Weapons:Item, armor:Armor:Item` |

### Warhammer Translation (`yo fvtt:warhammer-translation`)

Scaffolds a Warhammer 40k translation module with patch management, automated reporting, and sync tooling. Includes everything from `module` plus:

| File | Re-run behavior |
|------|----------------|
| `tools.config.ts` | Overwritten |
| `.vite/load-patches.ts` | Overwritten |
| `tools/auto-import-styles.ts`, `tools/bundle-jsons.ts` | Overwritten |
| `tools/commands/patch/**` | Overwritten |
| `tools/commands/report/**` | Overwritten |
| `tools/commands/sync/**` | Overwritten |
| `tools/utils/**` | Overwritten |
| `docs/**` | Overwritten |
| `.github/workflows/report.yml`, `sync.yml` | Overwritten |
| `src/main.ts`, `src/utils/`, `src/packages/` | First run only |
| `src/module.json` | First run only |

**Additional prompts:**

| Prompt | Example |
|--------|---------|
| Package names | `custom, impmal, warhammer-library` |
| Required system ID | `impmal` |
| Required system min version | `3.1.0` |
| Patch config | `impmal=scripts,static/templates;warhammer-library=static/templates` |
| Log prefix | `IMPMAL-PL` |
| Log color | `#007a72` |

## How It Works

### Architecture

```
generator-fvtt/generators/
  app/index.js                 <- yo fvtt (chooser)
  _base/index.js               <- shared config/tooling (composed)
  module/index.js              <- yo fvtt:module
  system/index.js              <- yo fvtt:system
  warhammer-translation/       <- yo fvtt:warhammer-translation
```

Each sub-generator composes `_base`, which handles shared files (eslint, tsconfig, vite, bump-version, release workflow, package.json merge). The sub-generator adds type-specific files on top.

### Re-run Behavior

The generator tracks its configuration in `.yo-rc.json` at the project root. On re-run:

1. **Saved answers are used as defaults** — press Enter to keep, or type a new value
2. **Config/tooling files are overwritten** — you get the latest templates
3. **`package.json` is merged** — base scripts and deps are updated, your project-specific deps are preserved
4. **`src/` is skipped** — your source code is never touched after the first run

### Conflict Resolution

When updating files, Yeoman shows a conflict prompt:

```
conflict eslint.config.js
? Overwrite eslint.config.js? (ynadxH)
  y - yes, overwrite
  n - no, skip
  a - overwrite this and all remaining
  d - show diff
  x - abort
```

Use `d` to view changes before deciding. Use `a` to accept all updates at once.

### Non-interactive Mode

Pass all answers as JSON to skip prompts (useful for CI or scripting):

```bash
npx yo fvtt:module --answers '{"id":"my-module","title":"My Module",...}' --force --skip-install
```

- `--answers` — JSON string with all prompt values
- `--force` — skip conflict prompts, overwrite all
- `--skip-install` — don't run `npm install` after generation

## Integrating with an Existing Project

If you have an existing Foundry VTT project and want to adopt this generator:

1. **Add the generator as a dev dependency:**
   ```bash
   cd your-existing-project
   npm install --save-dev yo generator-fvtt
   ```

2. **Run it:**
   ```bash
   npx yo fvtt:module  # or npx yo fvtt:system, npx yo fvtt:warhammer-translation
   ```

3. **Answer the prompts** with your project's details.

4. **Review the changes** — Yeoman will show conflict prompts for each file that differs from the template. Use `d` to view diffs. Accept files you want updated, skip files you've customized.

5. **Your `src/` is safe** — the generator detects that `src/main.ts` already exists and skips all source file generation.

6. **Check the generated files:**
   - `.yo-rc.json` — stores your answers for future re-runs
   - `package.json` — now includes `"scaffold": "npx yo fvtt:<type>"` script, plus `yo` and `generator-fvtt` as devDependencies

7. **Run `npm install`** to install the new devDependencies.

From now on, when the generator templates are updated, just run `npm run scaffold` to pull in the latest scaffolding.

## Generator Development

To work on the generator itself:

```bash
git clone https://github.com/rklos/fvtt-generator.git
cd fvtt-generator
npm install
npm link
```

`npm link` makes the generator available globally for testing. Edit templates under `generators/*/templates/`, then re-run `yo fvtt:*` in a test project to verify changes.

### Directory Structure

```
generators/
  _base/
    index.js                    <- shared generator logic
    templates/
      .npmrc                    <- static copy
      gitignore                 <- copied as .gitignore
      vite-env.d.ts             <- static copy
      eslint.config.js          <- EJS template (type-conditional rules)
      tsconfig.json             <- EJS template (type-conditional includes)
      vite.config.js            <- EJS template (type-conditional plugins)
      tools/bump-version.ts     <- EJS template (manifest file path)
      .github/workflows/
        release.yml             <- EJS template (manifest file path)
  module/
    index.js                    <- module generator logic
    templates/src/              <- first-run skeleton files
  system/
    index.js                    <- system generator logic
    templates/
      src/                      <- first-run skeleton files
      tools/                    <- always-overwrite tools
  warhammer-translation/
    index.js                    <- translation generator logic
    templates/
      src/                      <- first-run skeleton files
      tools/                    <- always-overwrite tools
      docs/                     <- always-overwrite docs
      .vite/                    <- always-overwrite build plugin
      .github/workflows/        <- always-overwrite workflows
```

### Template Syntax

Templates use [EJS](https://ejs.co/) syntax:

- `<%= variable %>` — output a value
- `<% if (condition) { %>` ... `<% } %>` — conditional blocks
- `<%_ array.forEach(function(item) { -%>` ... `<%_ }) -%>` — loops (whitespace-trimmed)
