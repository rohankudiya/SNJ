/**
 * ============================================================================
 *  SNJ SUBMISSION ENDPOINT CONFIGURATION — EXAMPLE
 * ============================================================================
 *  This is the ONLY place the form-submission destination is defined.
 *  script.js sends every submission here — a SheetDB API endpoint
 *  connected to your Google Sheet. See the "How to connect Google Sheets"
 *  section in README.md for full setup (no Apps Script needed).
 *
 *  HOW TO CONNECT YOUR OWN GOOGLE SHEET (about 3 minutes):
 *  1. Create a Google Sheet with this exact header row in row 1:
 *       Full Name | T-shirt Size
 *  2. Go to https://sheetdb.io and sign up (Google sign-in works).
 *  3. Click "Create API", pick that Google Sheet.
 *  4. Copy the API URL shown (looks like https://sheetdb.io/api/v1/xxxxxxxx).
 *  5. Copy this file to `assets/submission-config.js` (which is gitignored,
 *     since it holds your real endpoint) and paste your URL below as
 *     SUBMISSION_ENDPOINT, replacing the placeholder text.
 *  6. Save, redeploy the site. No other file needs to change.
 *
 *  Free tier covers 500 requests/month — plenty for a typical event; each
 *  submission counts as 1 request regardless of how many people are in it.
 * ============================================================================
 */

window.SUBMISSION_ENDPOINT = "https://sheetdb.io/api/v1/your-api-id-here";
