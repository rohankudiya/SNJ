# SNJ — T-shirt Size Collection

A static, production-ready website for collecting T-shirt sizes (yours and up
to 5 family members') and previewing the latest T-shirt design. Built with
plain HTML, CSS and vanilla JavaScript, hosted on Netlify, with submissions
stored directly in a **Google Sheet** via **SheetDB** (a REST API in front
of your Sheet) — no custom backend server, no database, no script to
deploy or maintain.

## Project structure

```
SNJ/
├── index.html                    Page markup (header, hero, preview, form, footer)
├── styles.css                     All styling (navy / white / saffron design system)
├── script.js                       Form logic, validation, Google Sheet submission, gallery + lightbox
├── assets/
│   ├── config.js                   Single source of truth for all preview image paths
│   ├── submission-config.js        Where the form sends data (your SheetDB API URL)
│   ├── jagdamb-logo-header.png     Small logo used in header/footer
│   ├── jagdamb-logo-hero.png       Larger logo used in the hero section
│   ├── tshirt-placeholder.jpg      Default placeholder image
│   ├── tshirt-back.jpg             Back-view gallery image
│   └── README.txt                  Short notes on replacing images
└── README.md                       This file
```

---

## 1. How to run the project locally

No build step is required — it's plain static HTML/CSS/JS.

**Option A — just open it:**
Double-click `index.html`, or right-click → "Open with" your browser.
(Note: actual submission to your Google Sheet only works once
`assets/submission-config.js` has a real SheetDB API URL in it — see
section 5. Locally you can still test all validation, the size chip
selector, family member add/remove, and the image gallery/lightbox.)

**Option B — serve it locally (recommended, closer to production):**
```bash
npx http-server .
# then open the printed local URL, e.g. http://127.0.0.1:8080
```
Once `assets/submission-config.js` has your real SheetDB URL pasted in,
submissions work the same locally as they do once deployed — SheetDB
doesn't require Netlify at all, so local testing is a real test.

---

## 2. How to replace the T-shirt image

All image paths live in **one file**: [`assets/config.js`](assets/config.js).
Nothing else in the codebase hardcodes an image URL.

1. Add your new photo file into the `assets/` folder.
2. In `assets/config.js`, find the relevant entry (`front`, `back`, or
   `closeup`) and update:
   ```js
   src: "assets/your-new-photo.jpg",
   available: true,
   ```
3. Save, commit, and redeploy on Netlify (see section 4). The new image is
   live for all visitors immediately.

If `available` is left `false`, the site automatically shows **"T-shirt
photo will be uploaded soon."** instead of a broken image — so it's always
safe to redeploy even if you only have some of the photos ready. The
**Back View** currently shows your Jagdamb emblem (`assets/tshirt-back.jpg`)
— replace that file with your real back-print photo when it's ready.

---

## 3. How to add front, back and close-up images

`assets/config.js` already defines three gallery entries out of the box:

```js
images: [
  { id: "front",   label: "Front View",     src: "...", alt: "...", available: false },
  { id: "back",    label: "Back View",      src: "assets/tshirt-back.jpg", alt: "...", available: true },
  { id: "closeup", label: "Close-up View",  src: "...", alt: "...", available: false }
]
```

To activate a view: drop the corresponding photo into `assets/`, update
`src` to point at it, and set `available: true`. The thumbnail strip and
lightbox are generated dynamically from this array — you don't need to
touch `index.html` or `script.js` to add, remove, or reorder views.

---

## 4. How to deploy the website on Netlify

**Option A — drag and drop:**
1. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" →
   "Deploy manually".
2. Drag the whole project folder (containing `index.html`) onto the page.
3. Netlify gives you a live URL immediately.

**Option B — connect a Git repository (recommended for ongoing updates):**
1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. In Netlify: "Add new site" → "Import an existing project" → connect the
   repo.
3. Build command: leave blank. Publish directory: `/` (the project root).
4. Deploy. Every future `git push` automatically redeploys the site.

Netlify here is only used for **hosting the static site** — it has nothing
to do with where the form data goes (that's the Google Sheet, see below).

---

## 5. How to connect Google Sheets (one-time setup, ~3 minutes)

No script to write or deploy — [SheetDB](https://sheetdb.io) turns your
Google Sheet directly into an API you can send data to.

1. Create a new Google Sheet (or open one you want to use for this event).
2. In row 1, add this exact header row (column names matter — they must
   match what `script.js` sends):
   ```
   Full Name | T-shirt Size
   ```
3. Go to [sheetdb.io](https://sheetdb.io) and sign up (you can sign in
   with your Google account directly).
4. Click **Create API**, and pick the Google Sheet you just made.
5. SheetDB shows you an API URL that looks like
   `https://sheetdb.io/api/v1/xxxxxxxxxxxxx` — copy it.
6. Copy [`assets/submission-config.example.js`](assets/submission-config.example.js)
   to `assets/submission-config.js` and replace the placeholder with your URL:
   ```js
   window.SUBMISSION_ENDPOINT = "https://sheetdb.io/api/v1/xxxxxxxxxxxxx";
   ```
   `assets/submission-config.js` is gitignored on purpose — it holds your
   real, unauthenticated SheetDB endpoint, and this repo is public, so it
   never gets committed. Redeploying via Netlify's Git integration (option B
   in section 4) will **not** include this file automatically; use
   Netlify's manual drag-and-drop deploy (option A) instead, dragging the
   whole project folder (including your real `assets/submission-config.js`)
   each time you update the site.
7. Save and redeploy the site on Netlify (section 4).

That's it — submissions start writing straight into your Sheet. No
deployment dialogs, no "who has access" settings, no authorization
prompts to click through.

> **Free tier**: SheetDB's free plan covers 500 requests/month. Each
> submission (regardless of how many people are in it) counts as one
> request, so this comfortably covers a typical community event. If you
> expect higher volume, check [sheetdb.io/pricing](https://sheetdb.io/pricing).

---

## 6. Where to view submissions — and why it's one row per person

Just open your Google Sheet — submissions appear directly as new rows,
no dashboard or export step needed.

Every person — you, and each family member you add — lands as their own
**separate row**, with just two columns:

- `Full Name`
- `T-shirt Size` — one size value per person (e.g. `M`, `Kids 3-4Y`)

With one row per person, counting shirts per size is a plain filter, sort,
or pivot table on the `T-shirt Size` column directly in the Sheet — no
manual tallying across family-member columns, and no separate export step.

There is no public page on the website itself that lists submissions — the
Sheet is only visible to people you've shared it with.

---

## 7. How to export or share the data

It's already a Google Sheet, so:
- **CSV/Excel**: File → Download → choose your format.
- **Share with others**: the normal Google Sheets Share button — give
  view or edit access to whoever needs to see the data (e.g. your event
  team), without giving them access to your Netlify account at all.

---

## 8. How to get notified of new submissions

Google Sheets has this built in — no code needed:
**Tools → Notification rules** (or **Notification settings**, depending on
your Sheets version) → choose "Any changes are made" and how often you
want to be emailed.

---

## 9. How to change website text and colors

**Text:** All copy lives directly in [`index.html`](index.html) — headings,
button labels, the hero paragraph, the privacy note, footer text, etc. Edit
the text between the relevant HTML tags and save.

**Colors:** All brand colors are defined once as CSS custom properties at
the top of [`styles.css`](styles.css), inside the `:root { ... }` block:

```css
--navy-900: #0a1533;
--navy-800: #0d1b3e;
--saffron-500: #ff9933;
--orange-warm: #ff7a45;
...
```

Changing a value there updates every place that color is used across the
whole site (buttons, headings, backgrounds, focus states, etc.) — you don't
need to hunt through the file for individual color codes.

**Logo:** The Jagdamb emblem appears in three places — header, footer, and
the hero section — using `assets/jagdamb-logo-header.png` (small, used in
header/footer) and `assets/jagdamb-logo-hero.png` (larger, used in the
hero). Replace either file with a same-named image to update it everywhere
it's used; there's no separate config for these since they're placed
directly in `index.html`.

---

## 10. How T-shirt size selection works

Every person on the form (you, and each family member added) picks their
size from **one unified chip grid** — no separate "exact vs. age" choice.
Sizes are grouped:

- **Kids**: Kids 1-2Y through Kids 13-14Y — labeled by age bracket, since
  that's what parents actually know for growing kids.
- **Adult**: XS through 5XL.

Click a size chip to select it (like Nike/Adidas product pages) — the
previously selected chip in that person's grid deselects automatically.
A **"View size guide"** link opens a modal mapping each adult letter size
to its approximate chest measurement (inches and cm), for anyone unsure
which letter size fits them.

**Behavior enforced by `script.js`:**
- Each person's chip selection writes into a hidden `<input>` with that
  person's `..._tshirt_size` field id — validation and submission just
  read that value, same as a `<select>` would have worked.
- On submit, validation confirms every visible person's name is filled and
  a size chip is selected. Submission is blocked with inline error messages
  until everything required is valid.
- A successful submission shows: *"Thank you! Your T-shirt details have
  been submitted successfully."*, confirms every name that was recorded
  (yours plus each family member added), and clears the form back down to
  one empty family member block. A failed submission shows a retry-friendly
  error message instead.

---

## 11. Adding multiple family members

"Your Details" is required and always a single person. Family members are
**entirely optional** — you can submit with just your own details, or add
**up to 5 family members** per submission using the **"+ Add Another Family
Member"** button below the family section:

- Family Member 1 is visible by default but not required — leave its name
  and size blank and it's simply not included in the submission.
- If you start filling in a family member block (a name, or a size), that
  block must then be completed properly before submitting — partial entries
  are blocked with an inline error, same as any other required field.
- Clicking "Add Another Family Member" reveals the next family member block
  (2 through 5), each with its own independent name and size chip grid.
- Each added block (2–5) has its own **Remove** button that hides it again
  and clears whatever was entered, freeing that slot back up.
- Once 5 family members are visible, the "Add Another Family Member" button
  hides automatically — that's the maximum per submission.
- If someone genuinely needs to add more than 5 family members (6+ people
  total including themselves), they can simply open the site again in a
  new browser tab and submit a second entry — each submission is
  independent, so this works fine without any extra setup.

This cap of 5 exists just to keep the form UI predictable — it's not a
technical limitation of the Google Sheet approach, so this number could be
raised later if you ever need it.

---

## How submission actually works (technical summary)

1. You fill in the visible form (your details + any family members).
2. On submit, `script.js` collects everyone into one array and sends a
   **single** `fetch` POST (JSON) to your SheetDB API URL, in the format
   SheetDB expects: `{ "data": [ {column: value, ...}, ... ] }`, one
   object per person.
3. SheetDB appends **one row per person** directly to the Google Sheet.
4. If the request fails (network hiccup), it's retried automatically up to
   3 times before showing an error to the user.

Sending everyone in a single request (rather than one request per person)
avoids the reliability issues that come with firing many near-simultaneous
requests — either the whole group is saved, or the site shows a retry
error and nothing partial gets saved silently.

---

## Notes on the tech choices

- **No backend server, no traditional database**: the website itself is
  fully static (HTML/CSS/JS) and hosted on Netlify. Data storage is your
  own Google Sheet; SheetDB is a third-party service that exposes it as a
  REST API so a static page can write to it directly — this is what lets
  an anonymous public form save data into your Sheet without exposing any
  credentials in the page's source code. Worth knowing: this makes SheetDB
  a small external dependency (free tier, but not something you host or
  control), unlike the fully self-contained Netlify Forms option that was
  used earlier in this project's history.
- **Spam protection**: a hidden honeypot field (`bot-field`) is checked
  client-side before any submission is sent — real users never see or fill
  it, so any submission that has it filled in is silently dropped before
  it ever reaches your Sheet.
- **Accessibility**: semantic landmarks (`header`, `main`, `footer`),
  labeled form fields, visible focus outlines, keyboard-operable lightbox
  (Esc / ←/→), and descriptive `alt` text throughout.
