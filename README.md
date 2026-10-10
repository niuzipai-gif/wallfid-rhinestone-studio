# WALLFID Rhinestone Studio

A public design preview and browser-based rhinestone pattern maker. Choose a sharp-corner square 50/80/100 mm acrylic board, or enter a custom width/height from 12 to 600 mm for your own surface. Round rhinestones have a fixed 3 mm diameter; patterns use the fixed 40-colour palette.

- Photos are processed locally in the browser. There is no upload service, account or image-generation API on the website.
- Numbered PNG, quantity CSV and actual-size print/PDF exports use the same compartment numbers: five rows, eight columns, left to right.
- Phone-first flow: Set up → Pattern → Colours, with one persistent primary action. Crop/spacing controls and the full 40-compartment box can be expanded when needed. Desktop keeps the full workspace.
- The larger mobile artwork introduces the kit. Uploads show real decode/framing/colour-matching stages, then automatically open the result. Invalid files clear the loading state and preserve the previous valid picture.
- New images keep their original proportions by default, with transparent uncovered edges that do not consume stones. Fill-board cropping, scale and positioning are optional. Dark-photo enhancement preserves small light colours during cell sampling and can be turned off; bright illustrations retain their natural colours.
- A header language button offers the EU's 24 official languages, Simplified/Traditional Chinese, Japanese and Korean (28 total). The selected language is saved locally; changing it preserves the active picture, board and pattern. Static initial translations cover interface copy, dynamic quantities, guides and PNG/print text. They are initial translations awaiting native-speaker proofreading, not certified localisation.
- Language switching uses bundled dictionaries; it does not contact a translation service or transmit visitor images. The hero pen's two blue protrusions have been removed from the illustrative product image.
- The colour values are estimates from a kit reference image, awaiting physical calibration. Stock quantities have not been entered. The supplied board corners are square. Centre spacing defaults to 3 mm and can be increased; kit boards reserve 3 mm at each edge. Check print scale before making.
- Generated hero and process images are illustrative concepts. The process illustration's paper grid is not a placement template.
- Custom patterns support image silhouettes, rectangles, ovals and hearts. Edge-connected white background removal preserves enclosed white subject details. Subject trimming and optional fine-outline emphasis improve clarity. A4 print tiles cover every grid cell exactly once; the legend includes the complete quantities. Width/height in CSV and PNG are the same physical dimensions as the preview.
- At the current 3 mm pitch the largest board has 31 stones across. Fine lettering and photographic details simplify substantially.
- Board and custom-size changes immediately regenerate the pattern and quantities. The board preview also scales relative to 100 mm. Small-pattern optimisation preserves continuous ink and dominant colour clusters before matching the same fixed palette. Optional Outline style keeps strong colour boundaries and silhouette edges, leaving other cells empty; it preserves compartment IDs and shows the full-colour quantity for comparison. Fine lettering is still limited by the physical 3 mm grid.

## Hosting

GitHub Pages publishes this repository's `main` branch from `/`. All site paths are relative and work under a project subdirectory. `.nojekyll` serves static files directly. No build dependencies are required.

Local preview: `python -m http.server 8766`. Checks: `node sampling-wallfid.test.cjs`, `node image-flow.test.cjs`, `node custom-pattern.test.cjs` and `node languages.test.cjs`.

## Assets

Hero and process images were generated for this project. The colour-locator reference was provided for this project. Bodoni Moda Italic is hosted locally under the SIL Open Font License; see `assets/fonts/OFL.txt`. There are no external font requests. This repository contains only site assets and source, not private product-registration documents or users' functional-test photos.
