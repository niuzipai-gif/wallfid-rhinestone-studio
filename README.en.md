# WALLFID Rhinestone Studio

[简体中文](README.md) · **English** · [日本語](README.ja.md)

Turn a picture into a numbered rhinestone pattern, then make the piece by hand.
WALLFID Rhinestone Studio is a static, browser-based tool for a fixed 40-colour kit and 3 mm round rhinestones. Choose a kit board or set your own dimensions, compare the result with your original image, and save a guide for making.

**Open the studio:** [Brand website](https://wallfid.pages.dev/) · [GitHub Pages](https://niuzipai-gif.github.io/wallfid-rhinestone-studio/) · [Source repository](https://github.com/niuzipai-gif/wallfid-rhinestone-studio)

![The WALLFID workspace with board settings, rhinestone preview and colour quantities](docs/images/workspace.jpg)

## From picture to pattern

1. **Choose your surface.** Select a 50, 80 or 100 mm acrylic square, or enter a custom width and height.
2. **Add your picture.** Choose a JPG, PNG or WebP file up to 10 MB and 24 megapixels when decoded. Keep the whole image or adjust the crop, scale and position.
3. **Check the result.** Compare it with the original, switch between full colour and outline, and review each colour's quantity.
4. **Save and make.** Export a numbered PNG, download the quantities as CSV, or print a guide at actual size.

Choosing a file reads it in your browser; the application does not send the selected image to an upload or image-generation service.

![Original image and the current rhinestone pattern shown side by side](docs/images/original-comparison.jpg)

The comparison uses the unmodified source image and the current applied pattern. Opening it does not change the pattern, quantities, colour selection or preview zoom.

## What the studio provides

- **One physical colour order:** preview, numbered guides, quantities and box locations share the same 40 compartment IDs.
- **Flexible framing:** original proportions are kept by default. Uncovered areas stay empty; fill-board cropping is optional.
- **Custom patterns:** width and height from 12 to 600 mm, with image silhouettes, rectangles, circles/ovals or hearts.
- **Two pattern styles:** full colour, or an outline that retains strong edges and leaves other cells empty.
- **Colour and outline sampling:** simple illustrations retain dominant colour groups and continuous outlines before matching to the fixed palette.
- **Optional dark-photo enhancement:** helps retain light details during sampling; it can be switched off.
- **Practical exports:** numbered PNG, colour-quantity CSV and actual-size printing, including A4 tiles for larger designs.
- **Mobile and desktop layouts:** a Set up → Pattern → Colours flow on phones, with a full workspace on larger screens.

## Board sizes and the physical grid

The kit boards are clear acrylic squares with square corners. At the default **3 mm centre-to-centre spacing**, the checked grids are:

| Board | Grid | Maximum positions |
| --- | --- | ---: |
| 50 × 50 mm | 15 × 15 | 225 |
| 80 × 80 mm | 25 × 25 | 625 |
| 100 × 100 mm | 32 × 32 | 1,024 |

These are grid capacities, not a promise that every design uses every position. Transparent areas, background removal and outline mode can leave cells empty. Increasing the spacing reduces the available grid.

For printing, choose **100% / Actual size**, disable headers and footers, and measure the printed **50 mm scale line** before using the guide. A browser's “Fit to page” option changes the physical size.

## The 40-colour reference

![Physical 40-compartment rhinestone sample used for the palette and compartment order](assets/spark/physical-kit-sample-v2.jpg)

Numbers run from the **top-left compartment across each row**: 1–8, 9–16, 17–24, 25–32 and 33–40. Keep the physical colours in that order. The colour guide uses crops from the physical-sample photograph.

Palette version: `physical-sample-2026-10-13-row-major-40-v2`.
RGB values are photographic estimates of the stones' front/body colours, with glare and bright backs excluded where possible. They have not been instrument-calibrated; reflective and iridescent stones also change with the lighting. Match the **compartment number**, then check the actual stone.

## Make your first piece

Clean and dry the surface. For acrylic, remove the protective film and secure the checked, actual-size pattern beneath the board. The website's six-step tutorial uses real making photographs; tap a photograph there for a closer view.

<table>
  <tr>
    <td width="33%"><img src="assets/tutorial/step-01.webp" alt="Applying a little glue to an acrylic board" width="260"><br><strong>1. Apply a little glue</strong><br>Work on a small area at a time.</td>
    <td width="33%"><img src="assets/tutorial/step-02.webp" alt="Close-up of the pen's fine round metal tip" width="260"><br><strong>2. Find the fine round tip</strong><br>Use the narrow metal end shown in the photograph.</td>
    <td width="33%"><img src="assets/tutorial/step-03.webp" alt="Loading the pen tip with silicone putty" width="260"><br><strong>3. Load the putty</strong><br>Press the tip into the silicone putty and turn it once.</td>
  </tr>
  <tr>
    <td><img src="assets/tutorial/step-04.webp" alt="The prepared tip carrying a small amount of silicone putty" width="260"><br><strong>4. Check the prepared tip</strong><br>A little putty should cover the rounded end.</td>
    <td><img src="assets/tutorial/step-05.webp" alt="Lifting a gold rhinestone by its faceted top" width="260"><br><strong>5. Pick up one stone</strong><br>Touch the faceted top; keep the flat back facing the glue.</td>
    <td><img src="assets/tutorial/step-06.webp" alt="Placing a gold rhinestone onto the acrylic board" width="260"><br><strong>6. Place, press and lift</strong><br>Keep the whole flat back on the board, press gently and lift the pen.</td>
  </tr>
</table>

Silicone putty helps the pen **pick up** stones; glue **fixes** them to the surface. Follow the adhesive label for application and curing time.

Download the two-sided **A5 hands-on guide**: [English PDF](assets/tutorial/WALLFID-hands-on-EN.pdf) · [Chinese PDF](assets/tutorial/WALLFID-hands-on-ZH.pdf).

## Languages

The interface offers **28 languages**: the EU's 24 official languages, Simplified and Traditional Chinese, Japanese and Korean. These are initial translations awaiting native-speaker review.

Switching language keeps the current image, board and pattern. The selected language is stored locally in the browser. Bundled dictionaries handle translation; no translation service receives the selected image.

The detailed photographic tutorial has **English, Simplified Chinese and Traditional Chinese** text. Other interface languages currently show that tutorial in English. The A5 PDFs are available in English and Chinese.

## Run locally

The site is served directly from the repository root. There is no framework build or runtime package installation.

```sh
git clone https://github.com/niuzipai-gif/wallfid-rhinestone-studio.git
cd wallfid-rhinestone-studio
python -m http.server 8766
```

Open [http://localhost:8766/](http://localhost:8766/) in a modern browser. Python 3 is used only as a local static server; the website itself runs in the browser.

## Checks

Use **Node.js 20 or later** and npm. No `npm install` is needed:

```sh
npm test
```

This runs the six regression suites, JavaScript syntax checks and local-reference checks for the website and all three READMEs. The regression files can also be run individually with `node <filename>`:

| Test | Area |
| --- | --- |
| `sampling-wallfid.test.cjs` | Fine lines, white backgrounds and transparent-area sampling |
| `image-flow.test.cjs` | Image framing, transparent padding, sampling and grid counts |
| `custom-pattern.test.cjs` | Custom dimensions, shape boundaries and print tiling |
| `languages.test.cjs` | 28-language dictionaries, placeholders and static integration |
| `colour-contour.test.cjs` | Continuous contours, colour families and fixed IDs |
| `small-pattern.test.cjs` | Small-pattern lines, dominant colours and isolated noise |

After intentional release changes, review the changes, update the file inventory and verify it:

```sh
npm run manifest
npm run verify
```

`npm run verify` repeats the checks and validates the release file hashes. GitHub Actions runs this verification on pushes and pull requests. Automated checks complement browser review: also try image selection, all three boards, original comparison, mobile navigation, downloads and an actual-size print preview before release.

## Source map

| File or directory | Responsibility |
| --- | --- |
| `index.html` | Page structure and the active script/style entry points |
| `app-localized.js` | Image workflow, preview, controls, comparison and exports |
| `pattern-core-spark.js` | Physical palette, grid geometry, shape bounds, colour matching, counts and print tiling |
| `image-sampling-wallfid.js` | Image framing, sampling and outline preservation |
| `languages-data.js`, `languages.js` | Bundled translations and language selection |
| `mobile-flow.js`, `mobile-flow.css` | Mobile setup, pattern and colour navigation |
| `tutorial-data.js`, `real-tutorial.js`, `real-tutorial.css` | Tutorial text, photograph viewer and guide links |
| `assets/` | Site illustrations, physical reference, tutorial photographs, PDFs and fonts |
| `docs/images/` | UI screenshots used by these READMEs |
| `scripts/` | Portable checks and release-manifest maintenance |
| `release-manifest.json` | File hashes for checking a release's contents |

The scripts loaded by `index.html` define the active application. Older files such as `app-wallfid.js` are not a second entry point to load alongside it.

## Publishing and release checks

Serve the repository as static files. For GitHub Pages, use the `main` branch and `/ (root)` source. Relative asset paths support the project URL; `.nojekyll` allows direct static-file serving.

When releasing changes, run the checks, refresh the release manifest and any affected cache-version references, then review the deployed page. Confirm that the tutorial photos, both A5 PDFs and export flow load from the deployed site, not only from a local preview.

GitHub synchronisation and deployment of the separate Cloudflare brand site are independent operations. Pushing to GitHub does not by itself mean that the same version has been deployed to the brand site.

## Processing and limits

- Selected images are decoded, sampled and rendered in the browser. The application has no account system or image-upload backend.
- Loading the website, its fonts, images and PDFs still makes normal requests to the hosting service. Local image processing does not mean that visiting the site is network-free.
- The 40-colour palette and 3 mm grid simplify photographs, small lettering and fine details. A larger pattern can preserve more structure; it cannot guarantee an exact likeness or colour reproduction.
- Quantities describe the pattern's needs. Per-colour kit stock has not been entered, so the studio cannot guarantee that a particular design is covered by the stones on hand.
- Custom dimensions describe a flat placement guide. Measure the intended surface and check physical fit before gluing.
- Screenshots and digital stone previews explain the tool; the printed, scale-checked numbered guide is the placement reference.

## Images and fonts

The palette photograph and six tutorial photographs show physical materials. Hero artwork and earlier process illustrations are generated concepts; the paper grid in a process illustration is not a usable placement template.

Bodoni Moda Italic is bundled locally under the [SIL Open Font License](assets/fonts/OFL.txt). The site makes no external font requests. This repository contains the public website and its assets; selected visitor images are not added to it.
