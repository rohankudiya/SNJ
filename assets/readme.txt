ASSETS FOLDER — SNJ T-shirt Preview
====================================

WHAT'S IN HERE
--------------
- tshirt-placeholder.jpg  → default placeholder shown until a real photo is added
- config.js               → the ONLY file that defines which image is used for
                             each gallery view (front / back / close-up).
                             Do not hardcode image paths anywhere else.

HOW TO ADD THE REAL T-SHIRT PHOTOS
-----------------------------------
1. Export your photos as .jpg or .webp, ideally square or portrait, and keep
   each file under ~500 KB so the page loads fast (see "Optimizing images"
   below).
2. Drop the files into this `assets/` folder, e.g.:
     assets/tshirt-front.jpg
     assets/tshirt-back.jpg
     assets/tshirt-closeup.jpg
3. Open `assets/config.js` and, for each view, set:
     src: "assets/tshirt-front.jpg"   (point to your new file)
     available: true                  (so it replaces the placeholder)
4. Save, commit, and redeploy the site on Netlify. The new photos go live
   for every visitor immediately — no other file needs to change.

If you only have one photo (e.g. front view) that's fine — leave `back` and
`closeup` as `available: false` and the site will automatically show
"T-shirt photo will be uploaded soon." for those views.

OPTIMIZING IMAGES
------------------
- Resize to a max of ~1200px on the longest side — that's larger than the
  preview ever displays it, so it still looks sharp while staying small.
- Use JPEG quality 75–85%, or convert to .webp for an even smaller file.
- Free tools: Squoosh.app (browser-based, no install), or any image editor's
  "Export/Save for Web" option.

FUTURE: CLOUD IMAGE HOSTING
-----------------------------
When you're ready to use an image CDN or upload service instead of storing
files in this repo, just change the `src` values in `config.js` to the
hosted URLs. Nothing else in the codebase needs to change — every image
reference in the site flows through that one config file.
