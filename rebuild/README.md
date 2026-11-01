# ∞ WORKS — 数字の果て (Rebuild)

A clean rebuild of the original incremental game. The original `main` branch is preserved; this first implementation lives in `rebuild-v3` under `/rebuild`.

## Development

- No runtime dependencies.
- JavaScript ES modules.
- Tests use Node.js built-in test runner.

```sh
npm test
```

## Architecture

- `src/core/decimal.js`: normalized mantissa/exponent arithmetic for very large values.
- `src/core/economy.js`: prices and production formulas.
- `src/core/state.js`: versioned game-state schema.
- `src/core/engine.js`: pure progression operations.
- `src/core/storage.js`: local save, backup recovery, import/export helpers.
- `src/ui.js`: DOM rendering and navigation.
- `src/main.js`: application composition and real-time loop.

## Current milestone: v0.1.0

Implemented: Aether currency, manual collection, first auto-clicker, real-time production, 8-hour offline cap, local autosave, modular foundation, and initial regression tests.

Planned: upgrade tiers, research, automation, reincarnation, transcendence realm, skill networks, achievements, missions, events, statistics and charts.

The current build is a foundation milestone, not the full game specification.
