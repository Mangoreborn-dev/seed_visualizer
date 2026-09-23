# Pixel Perfect Seed Visualizer

An open-source, community-driven tool created by **MANGOISME** to support the **OBSIDIAN CHALLENGE — FREE THE TURTLE** organized by **Precioso**.

This tool provides a pixel-perfect HTML5 Canvas environment that matches Discord's exact text rendering algorithm (using the `gg sans` font, kerning, and sub-pixel anti-aliasing) to help visually brute-force the BIP39 seed phrase puzzle.

## Features
- **Pixel-Perfect Rendering**: Uses exact `gg sans` typography, `16px` font size, and `400` weight to match Discord's message layout down to the pixel.
- **Map Overlay Mode**: Visually compare your seed phrase combinations against a semi-transparent overlay of the original challenge image.
- **Constraints Auto-Fill**:
  - Word 3 explicitly requires `smoke`.
  - Word 8 automatically hints ending with `e`.
  - Words 9, 10, 11 are prefilled with `artist`, `nature`, `piano`.
- **Image Export**: Download your canvas creations instantly as `.png` files (563x32 resolution) for external verification or sharing.
- **Completely Offline**: Zero server dependencies. Runs 100% in your browser.

## How to Deploy / Use
Because everything (including the base64-encoded `gg sans` font and the background map image) is bundled directly into the `index.html` file by the build script, deploying is incredibly easy!

1. Fork or clone this repository.
2. Enable **GitHub Pages** targeting the `main` branch.
3. Done! The tool is now accessible via your GitHub Pages URL.

If you just want to run it locally, simply double-click `index.html` in your browser.

## How to Modify & Build
If you want to update the layout, change the background image, or add new constraints, you can edit the builder script.

1. Install [Node.js](https://nodejs.org/).
2. Run `node build_visualizer.cjs`.
3. It will read the assets in the `/assets` folder and generate a fresh `index.html`.

## Disclaimer
This tool is an independent community project. It is not affiliated with, endorsed, or sponsored by Discord or the challenge organizers. All puzzle hints and constraints are sourced from Precioso or verified community decodings. It operates entirely locally and does NOT store, transmit, or send your 12-word seed phrases anywhere.
