# WALLFID Rhinestone Studio

A public design preview and browser-based rhinestone pattern maker. Choose a square 50/80/100 mm acrylic board, upload a picture, and make a numbered guide using the fixed 40-colour palette.

- Photos are processed locally in the browser. There is no upload service, account or image-generation API on the website.
- Numbered PNG, quantity CSV and actual-size print/PDF exports use the same compartment numbers: five rows, eight columns, left to right.
- Phone-first flow: Set up → Pattern → Colours, with one persistent primary action. Crop/spacing controls and the full 40-compartment box can be expanded when needed. Desktop keeps the full workspace.
- The colour values are estimates from a kit reference image, awaiting physical calibration. Stock quantities have not been entered. Board spacing/corners and print scale require physical checks.
- Generated hero and process images are illustrative concepts. The process illustration's paper grid is not a placement template.
- At the current 3 mm pitch the largest board has 31 stones across. Fine lettering and photographic details simplify substantially.

## Hosting

GitHub Pages publishes this repository's `main` branch from `/`. All site paths are relative and work under a project subdirectory. `.nojekyll` serves static files directly. No build dependencies are required.

Local preview: `python -m http.server 8766`. Sampling regression check: `node sampling-wallfid.test.cjs`.

## Assets

Hero and process images were generated for this project. The colour-locator reference was provided for this project. Bodoni Moda Italic is hosted locally under the SIL Open Font License; see `assets/fonts/OFL.txt`. There are no external font requests. This repository contains only site assets and source, not private product-registration documents or users' functional-test photos.
