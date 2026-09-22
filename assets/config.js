/**
 * ============================================================================
 *  SNJ T-SHIRT IMAGE CONFIGURATION
 * ============================================================================
 *  This is the ONLY place image paths for the T-shirt preview gallery are
 *  defined. Every other file (script.js, index.html) reads from this object
 *  instead of hard-coding image URLs.
 *
 *  HOW TO REPLACE / ADD IMAGES (no coding knowledge required):
 *  1. Add your new image file(s) inside the `assets/` folder
 *     (e.g. assets/tshirt-front.jpg, assets/tshirt-back.jpg).
 *  2. Update the `available` value to `true` for that image below and point
 *     `src` at your file.
 *  3. Save this file, commit, and redeploy on Netlify (or drag-and-drop the
 *     project folder again if using manual deploys). Netlify will serve the
 *     new image immediately to every visitor — no other code changes needed.
 *  4. If you don't yet have a real photo for a view, leave `available` as
 *     `false` and the site will automatically show a "photo will be
 *     uploaded soon" message instead of a broken image.
 *
 *  FUTURE UPGRADE PATH:
 *  When you're ready to use a cloud image host / upload service (e.g.
 *  Cloudinary, Netlify Large Media, an image CDN), simply change the `src`
 *  values below to the hosted URLs returned by that service. Nothing else
 *  in the codebase needs to change because every image reference flows
 *  through this single config object.
 * ============================================================================
 */

window.TSHIRT_IMAGE_CONFIG = {
  // Shown everywhere as a fallback while a real photo isn't available yet.
  placeholder: "assets/tshirt-placeholder.jpg",

  // Each entry becomes one thumbnail + one lightbox slide, in this order.
  images: [
    {
      id: "front",
      label: "Front View",
      src: "assets/tshirt-front-photo.jpg",
      alt: "Front view of the SNJ T-shirt design",
      available: true
    },
    {
      id: "back",
      label: "Back View",
      src: "assets/tshirt-back-photo.jpg",
      alt: "Back view of the SNJ T-shirt design",
      available: true
    },
    {
      id: "closeup",
      label: "Close-up View",
      src: "assets/tshirt-collar-closeup.jpg",
      alt: "Close-up view of the SNJ T-shirt collar and fabric detail",
      available: true
    },
    {
      id: "sleeve",
      label: "Sleeve Cuff Detail",
      src: "assets/tshirt-sleeve-cuff-detail.jpg",
      alt: "Close-up of the SNJ T-shirt sleeve cuff, turquoise with white stripe",
      available: true
    },
    {
      id: "fabric",
      label: "Fabric View",
      src: "assets/tshirt-fabric-view.jpg",
      alt: "Close-up of the SNJ T-shirt pique fabric texture",
      available: true
    }
  ]
};
