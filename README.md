# theater-stage

A 3D theater stage for AI actors, built with Three.js. A performance space that an agent can be given stage directions in — blocking positions, lighting cues, props, and scenery that move.

## What's here

The application lives under `projects/scratch/` (see its own README for the full feature list):

- A 20x15 unit stage with nine standard blocking markers (USL through DSR).
- Curtains, four elevating platforms, a rotating center stage, trap doors, and sliding scenery panels.
- A lighting system with presets and per-instrument control.
- Save/load of stage state, undo/redo, and collision detection.
- A Jest suite covering geometry, lighting, physics, props and actors.

`docs/` holds the API documentation, a user guide, a curriculum guide, and a modularization plan.

## Status

Working prototype. The `projects/scratch/` path is a leftover from how the project started, not a statement about the code's quality — the tests and docs there are real.
