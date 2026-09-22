/**
 * ============================================================================
 *  ADMIN PANEL CONFIGURATION — EXAMPLE
 * ============================================================================
 *  Powers the passcode-gated "Admin" button in the site footer, which opens
 *  a small photo-upload panel (Front / Back / Close-up). Uploading a photo
 *  there sends it to ImgBB (a free image host) and saves the returned URL
 *  into an "ImageConfig" tab of your Google Sheet via SheetDB — every
 *  visitor's browser picks it up on next page load. No redeploy needed.
 *
 *  IMPORTANT SECURITY NOTE:
 *  This is a plain static site with no server. The passcode below ships to
 *  every visitor as plain JavaScript and can be read via "View Source" or
 *  browser DevTools by anyone who looks for it — it is NOT real security,
 *  just a casual deterrent so random visitors don't stumble onto the Admin
 *  button. Never reuse a real password of yours here, and don't rely on
 *  this to keep the upload truly private.
 *
 *  SETUP (about 5 minutes):
 *  1. Copy this file to assets/admin-config.js (that file is gitignored,
 *     so your real passcode and API key never reach the public repo).
 *  2. Pick any passcode and put it below.
 *  3. Sign up free at https://api.imgbb.com/ and copy your API key.
 *  4. In the SAME Google Sheet SheetDB is already connected to (see
 *     README.md section 5), add a new tab named exactly "ImageConfig"
 *     with this header row:
 *       id | url
 *     ...and three rows under it, in the id column: front, back, closeup
 *     (leave the url column blank — the Admin panel fills it in the first
 *     time you upload a photo for that view).
 *  5. Save this file, then redeploy manually (drag-and-drop) since this
 *     file — like assets/submission-config.js — is gitignored and won't
 *     come along with a Git-based deploy.
 * ============================================================================
 */

window.ADMIN_PASSCODE = "changeme";
window.IMGBB_API_KEY = "your-imgbb-api-key-here";
