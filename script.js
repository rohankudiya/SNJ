/**
 * SNJ — T-shirt Size Collection
 * Vanilla JS: mobile nav, dynamic form fields, validation,
 * Google Sheet submission (via the SheetDB REST API), and the preview
 * gallery / lightbox.
 * Image URLs come exclusively from assets/config.js (window.TSHIRT_IMAGE_CONFIG).
 * Submission endpoint comes exclusively from assets/submission-config.js
 * (window.SUBMISSION_ENDPOINT).
 */
(function () {
  "use strict";

  /* ============================================================
     Mobile navigation
     ============================================================ */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    primaryNav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     Footer year
     ============================================================ */
  var footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ============================================================
     Dynamic sizing-method fields (per person)
     "user" plus up to FAMILY_MAX family members (family_member_1 .. _5)
     ============================================================ */
  var FAMILY_MAX = 5;
  var PERSON_PREFIXES = ["user"];
  for (var fp = 1; fp <= FAMILY_MAX; fp++) {
    PERSON_PREFIXES.push("family_member_" + fp);
  }

  /* ============================================================
     Size chip selector (Nike-style) — replaces the plain <select>
     for exact T-shirt size. Rendered once per person from
     SIZE_GROUPS; writes the chosen value into the paired hidden
     <input id="..._tshirt_size"> so existing validation/payload
     code (which just reads element.value) needs no other changes.
     ============================================================ */
  var SIZE_GROUPS = [
    {
      label: "Kids",
      sizes: ["Kids 1-2Y", "Kids 2-3Y", "Kids 3-4Y", "Kids 4-5Y", "Kids 5-6Y", "Kids 7-8Y", "Kids 9-10Y", "Kids 11-12Y", "Kids 13-14Y"]
    },
    {
      label: "Adult",
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
    }
  ];

  // Approximate chest measurement per adult letter size, shown on the chip
  // itself (same numbers as the Size Guide modal) so most people never
  // need to open the guide just to tell M from L.
  var CHEST_SIZE_INCHES = {
    "XS": 36, "S": 38, "M": 40, "L": 42, "XL": 44,
    "XXL": 46, "3XL": 48, "4XL": 50, "5XL": 52
  };

  function renderSizeChips(container) {
    var targetId = container.getAttribute("data-size-target");
    if (!document.getElementById(targetId)) return;

    container.innerHTML = "";

    SIZE_GROUPS.forEach(function (group) {
      var groupEl = document.createElement("div");
      groupEl.className = "size-chip-group";

      var labelEl = document.createElement("span");
      labelEl.className = "size-chip-group-label";
      labelEl.textContent = group.label;
      groupEl.appendChild(labelEl);

      var gridEl = document.createElement("div");
      gridEl.className = "size-chip-grid";

      group.sizes.forEach(function (size) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "size-chip";
        chip.setAttribute("data-size-value", size);
        chip.setAttribute("aria-pressed", "false");

        var labelSpan = document.createElement("span");
        labelSpan.className = "size-chip-label";
        labelSpan.textContent = size;
        chip.appendChild(labelSpan);

        var chest = CHEST_SIZE_INCHES[size];
        if (chest) {
          var chestSpan = document.createElement("span");
          chestSpan.className = "size-chip-chest";
          chestSpan.textContent = chest + " in";
          chip.appendChild(chestSpan);
        }

        chip.addEventListener("click", function () {
          selectSizeChip(targetId, size);
        });
        gridEl.appendChild(chip);
      });

      groupEl.appendChild(gridEl);
      container.appendChild(groupEl);
    });
  }

  function selectSizeChip(targetId, value) {
    var hiddenInput = document.getElementById(targetId);
    var container = document.getElementById(targetId + "_chips");
    if (!hiddenInput || !container) return;

    hiddenInput.value = value;

    container.querySelectorAll(".size-chip").forEach(function (chip) {
      var isMatch = chip.getAttribute("data-size-value") === value;
      chip.classList.toggle("is-selected", isMatch);
      chip.setAttribute("aria-pressed", isMatch ? "true" : "false");
    });

    clearFieldError(targetId);
  }

  function clearSizeChipSelection(targetId) {
    var hiddenInput = document.getElementById(targetId);
    var container = document.getElementById(targetId + "_chips");
    if (hiddenInput) hiddenInput.value = "";
    if (container) {
      container.querySelectorAll(".size-chip.is-selected").forEach(function (chip) {
        chip.classList.remove("is-selected");
        chip.setAttribute("aria-pressed", "false");
      });
    }
  }

  document.querySelectorAll(".size-chip-field[data-size-target]").forEach(renderSizeChips);

  /* ============================================================
     Size guide modal
     ============================================================ */
  var sizeGuideModal = document.getElementById("sizeGuideModal");
  var sizeGuideClose = document.getElementById("sizeGuideClose");

  document.querySelectorAll("[data-open-size-guide]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (sizeGuideModal) sizeGuideModal.hidden = false;
    });
  });
  if (sizeGuideClose) {
    sizeGuideClose.addEventListener("click", function () {
      sizeGuideModal.hidden = true;
    });
  }
  if (sizeGuideModal) {
    sizeGuideModal.addEventListener("click", function (event) {
      if (event.target === sizeGuideModal) sizeGuideModal.hidden = true;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !sizeGuideModal.hidden) {
        sizeGuideModal.hidden = true;
      }
    });
  }

  /* ============================================================
     Add / remove family member blocks (up to FAMILY_MAX total)
     ============================================================ */
  var addMemberBtn = document.getElementById("addMemberBtn");
  var visibleFamilyIndices = [1]; // Family Member 1 is always present.

  function familyBlockEl(i) {
    return document.getElementById("family-block-" + i);
  }

  function updateAddButtonVisibility() {
    if (addMemberBtn) {
      addMemberBtn.hidden = visibleFamilyIndices.length >= FAMILY_MAX;
    }
  }

  function clearFamilyBlockValues(i) {
    var prefix = "family_member_" + i;
    var nameInput = document.getElementById(prefix + "_name");
    if (nameInput) nameInput.value = "";

    clearSizeChipSelection(prefix + "_tshirt_size");

    clearFieldError(prefix + "_name");
    clearFieldError(prefix + "_tshirt_size");
  }

  function resetFamilyMemberBlocks() {
    for (var i = 2; i <= FAMILY_MAX; i++) {
      var block = familyBlockEl(i);
      if (block) block.hidden = true;
      clearFamilyBlockValues(i);
    }
    visibleFamilyIndices = [1];
    updateAddButtonVisibility();
  }

  if (addMemberBtn) {
    addMemberBtn.addEventListener("click", function () {
      for (var i = 1; i <= FAMILY_MAX; i++) {
        if (visibleFamilyIndices.indexOf(i) === -1) {
          visibleFamilyIndices.push(i);
          var block = familyBlockEl(i);
          if (block) {
            block.hidden = false;
            block.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          updateAddButtonVisibility();
          var nameInput = document.getElementById("family_member_" + i + "_name");
          if (nameInput) nameInput.focus();
          break;
        }
      }
    });
  }

  document.querySelectorAll(".remove-member-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = parseInt(btn.getAttribute("data-remove-index"), 10);
      var block = familyBlockEl(i);
      if (block) block.hidden = true;
      visibleFamilyIndices = visibleFamilyIndices.filter(function (v) {
        return v !== i;
      });
      clearFamilyBlockValues(i);
      updateAddButtonVisibility();
      if (addMemberBtn) addMemberBtn.focus();
    });
  });

  /* ============================================================
     Validation
     ============================================================ */
  var form = document.getElementById("tshirtForm");
  var submitBtn = document.getElementById("submitBtn");
  var formStatus = document.getElementById("formStatus");
  var isSubmitting = false;

  function showFieldError(fieldId, message) {
    var errorEl = document.getElementById("err-" + fieldId);
    var inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add("has-error");
  }

  function clearFieldError(fieldId) {
    var errorEl = document.getElementById("err-" + fieldId);
    var inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = "";
    if (inputEl) inputEl.classList.remove("has-error");
  }

  function clearAllErrors() {
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.textContent = "";
    });
    form.querySelectorAll(".has-error").forEach(function (el) {
      el.classList.remove("has-error");
    });
  }

  function validateName(fieldId, label) {
    var input = document.getElementById(fieldId);
    var value = input.value.trim();
    if (!value) {
      showFieldError(fieldId, label + " is required.");
      return false;
    }
    if (value.length < 2) {
      showFieldError(fieldId, "Please enter a valid name.");
      return false;
    }
    return true;
  }

  function validateConditionalSelect(fieldId, message) {
    var select = document.getElementById(fieldId);
    if (!select.value) {
      showFieldError(fieldId, message);
      return false;
    }
    return true;
  }

  function isFamilyBlockEmpty(prefix) {
    var nameInput = document.getElementById(prefix + "_name");
    var nameEmpty = !nameInput || !nameInput.value.trim();
    var sizeInput = document.getElementById(prefix + "_tshirt_size");
    var sizeEmpty = !sizeInput || !sizeInput.value;
    return nameEmpty && sizeEmpty;
  }

  function validatePerson(person) {
    var valid = true;

    if (!validateName(person.prefix + "_name", person.nameLabel)) {
      valid = false;
    }

    if (!validateConditionalSelect(person.sizeSelect, "Please select " + person.possessive + " T-shirt size.")) {
      valid = false;
    }

    return valid;
  }

  function validateForm() {
    clearAllErrors();
    var userValid = validatePerson({
      prefix: "user",
      sizeSelect: "user_tshirt_size",
      nameLabel: "Your full name",
      possessive: "your"
    });

    var allFamilyValid = true;
    visibleFamilyIndices
      .slice()
      .sort(function (a, b) { return a - b; })
      .forEach(function (i) {
        var prefix = "family_member_" + i;

        // A family member is optional: skip validation entirely if the
        // whole block was left untouched. If they started filling it in
        // (a name or a size), it must be completed properly.
        if (isFamilyBlockEmpty(prefix)) return;

        var valid = validatePerson({
          prefix: prefix,
          sizeSelect: prefix + "_tshirt_size",
          nameLabel: "Family Member " + i + "'s full name",
          possessive: "family member " + i + "'s"
        });
        if (!valid) allFamilyValid = false;
      });

    return userValid && allFamilyValid;
  }

  function joinNames(names) {
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }

  /* ============================================================
     Status messaging
     ============================================================ */
  function showStatus(type, message) {
    formStatus.hidden = false;
    formStatus.className = "form-status is-" + type;
    formStatus.textContent = message;
    formStatus.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideStatus() {
    formStatus.hidden = true;
    formStatus.textContent = "";
    formStatus.className = "form-status";
  }

  /* ============================================================
     Submission (SheetDB REST API via fetch, so we can show custom
     success/error UI and clear the form without a page reload)

     Everyone (you + every filled-in family member) is collected into one
     array and sent in a single request; SheetDB appends one row per
     person (Full Name, T-shirt Size) to the Google Sheet. This makes the
     Sheet one row per person instead of one wide row per family, so
     counting shirts per size is a plain filter/pivot instead of manual
     tallying across many columns.
     ============================================================ */
  function collectPeoplePayload() {
    var people = [];

    people.push({
      full_name: document.getElementById("user_name").value.trim(),
      tshirt_size: document.getElementById("user_tshirt_size").value
    });

    visibleFamilyIndices
      .slice()
      .sort(function (a, b) { return a - b; })
      .forEach(function (i) {
        var prefix = "family_member_" + i;
        if (isFamilyBlockEmpty(prefix)) return;

        people.push({
          full_name: document.getElementById(prefix + "_name").value.trim(),
          tshirt_size: document.getElementById(prefix + "_tshirt_size").value
        });
      });

    return people;
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // Adult letter sizes are stored as their numeric chest measurement
  // (e.g. "M" -> "38") since that's what's actually useful for placing a
  // bulk order — the chip UI still shows the letter for people filling
  // the form in. Kids sizes have no numeric equivalent, so those are
  // stored as-is (e.g. "Kids 1-2Y").
  function toStoredSize(size) {
    var chest = CHEST_SIZE_INCHES[size];
    return chest ? String(chest) : size;
  }

  // Sends everyone (you + any family members) in ONE request to SheetDB,
  // which appends one row per person directly to the connected Google
  // Sheet. A single request means there's no concurrency race to worry
  // about — either the whole group lands, or none of it does.
  //
  // SheetDB expects: POST { "data": [ {column: value, ...}, ... ] }
  // where each object's keys must match your Sheet's header row exactly
  // (see README.md "How to connect Google Sheets").
  function submitToSheet(people) {
    var endpoint = window.SUBMISSION_ENDPOINT;
    if (!endpoint || endpoint.indexOf("PASTE_YOUR_") === 0) {
      return Promise.reject(new Error("Submission endpoint is not configured yet."));
    }

    var rows = people.map(function (person) {
      return {
        "Full Name": person.full_name,
        "T-shirt Size": toStoredSize(person.tshirt_size)
      };
    });

    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: rows })
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok (" + response.status + ")");
      }
    });
  }

  // Retries the whole-group submission a couple of times before giving up
  // — covers a transient network hiccup rather than losing everyone.
  function submitToSheetWithRetry(people, attemptsLeft) {
    attemptsLeft = attemptsLeft === undefined ? 3 : attemptsLeft;
    return submitToSheet(people).catch(function (err) {
      if (attemptsLeft <= 1) throw err;
      return delay(500).then(function () {
        return submitToSheetWithRetry(people, attemptsLeft - 1);
      });
    });
  }

  function resetAllSizeChips() {
    PERSON_PREFIXES.forEach(function (prefix) {
      clearSizeChipSelection(prefix + "_tshirt_size");
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (isSubmitting) return;

      // Honeypot check — if filled, silently drop (bot).
      var honeypot = form.querySelector('input[name="bot-field"]');
      if (honeypot && honeypot.value) {
        return;
      }

      hideStatus();

      if (!validateForm()) {
        showStatus("error", "Please fix the highlighted fields before submitting.");
        var firstError = form.querySelector(".has-error, .field-error:not(:empty)");
        if (firstError) {
          var target = firstError.closest(".form-row") || firstError;
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      showStatus("loading", "Submitting your details, please wait…");

      var people = collectPeoplePayload();

      submitToSheetWithRetry(people)
        .then(function () {
          var allNames = people.map(function (p) { return p.full_name; });

          form.reset();
          resetAllSizeChips();
          resetFamilyMemberBlocks();
          clearAllErrors();

          showStatus(
            "success",
            "Thank you! Your T-shirt details have been submitted successfully. " +
              "We've recorded sizes for " + joinNames(allNames) + "."
          );
        })
        .catch(function () {
          showStatus(
            "error",
            "Sorry, something went wrong while submitting your details. Please check your connection and try again."
          );
        })
        .finally(function () {
          isSubmitting = false;
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
        });
    });

    // Clear individual field errors as the user fixes them.
    form.querySelectorAll('input[type="text"], select').forEach(function (el) {
      el.addEventListener("input", function () {
        clearFieldError(el.id);
      });
      el.addEventListener("change", function () {
        clearFieldError(el.id);
      });
    });
  }

  /* ============================================================
     T-shirt preview gallery + lightbox
     Reads exclusively from window.TSHIRT_IMAGE_CONFIG (assets/config.js)
     ============================================================ */
  var galleryConfig = window.TSHIRT_IMAGE_CONFIG || { placeholder: "", images: [] };
  var mainImageEl = document.getElementById("galleryMainImage");
  var thumbsWrap = document.getElementById("galleryThumbs");
  var unavailableMsg = document.getElementById("galleryUnavailable");
  var mainBtn = document.getElementById("galleryMainBtn");

  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightboxImage");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");

  var activeIndex = 0;
  var images = galleryConfig.images || [];
  var lastFocusedEl = null;

  function resolveImage(img) {
    return {
      id: img.id,
      label: img.label,
      alt: img.alt,
      src: img.available ? img.src : galleryConfig.placeholder,
      isAvailable: !!img.available
    };
  }

  function renderThumbs() {
    if (!thumbsWrap) return;
    thumbsWrap.innerHTML = "";

    images.forEach(function (img, index) {
      var resolved = resolveImage(img);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-thumb" + (index === activeIndex ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
      btn.setAttribute("aria-label", "Show " + resolved.label);

      var thumbImg = document.createElement("img");
      thumbImg.src = resolved.src;
      thumbImg.alt = "";
      thumbImg.loading = "lazy";
      thumbImg.decoding = "async";

      var label = document.createElement("span");
      label.className = "gallery-thumb-label";
      label.textContent = resolved.label;

      btn.appendChild(thumbImg);
      btn.appendChild(label);
      btn.addEventListener("click", function () {
        setActiveIndex(index);
      });

      thumbsWrap.appendChild(btn);
    });
  }

  function setActiveIndex(index) {
    if (!images.length) return;
    activeIndex = (index + images.length) % images.length;
    var resolved = resolveImage(images[activeIndex]);

    if (mainImageEl) {
      mainImageEl.src = resolved.src;
      mainImageEl.alt = resolved.alt;
    }
    if (unavailableMsg) {
      unavailableMsg.hidden = resolved.isAvailable;
    }

    thumbsWrap && thumbsWrap.querySelectorAll(".gallery-thumb").forEach(function (thumb, i) {
      thumb.classList.toggle("is-active", i === index);
      thumb.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    if (!lightbox.hidden) {
      updateLightboxImage();
    }
  }

  function updateLightboxImage() {
    var resolved = resolveImage(images[activeIndex]);
    lightboxImage.src = resolved.src;
    lightboxImage.alt = resolved.alt;
    lightboxCaption.textContent = resolved.isAvailable
      ? resolved.label
      : resolved.label + " — T-shirt photo will be uploaded soon.";
  }

  function openLightbox() {
    if (!images.length) return;
    lastFocusedEl = document.activeElement;
    updateLightboxImage();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
    document.addEventListener("keydown", handleLightboxKeydown);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleLightboxKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function handleLightboxKeydown(event) {
    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowRight") {
      setActiveIndex(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      setActiveIndex(activeIndex - 1);
    }
  }

  if (mainBtn) mainBtn.addEventListener("click", openLightbox);
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", function () { setActiveIndex(activeIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener("click", function () { setActiveIndex(activeIndex + 1); });
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  // Basic swipe support for the lightbox on touch devices.
  (function enableSwipe() {
    if (!lightbox) return;
    var touchStartX = null;
    lightbox.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        setActiveIndex(activeIndex + (deltaX < 0 ? 1 : -1));
      }
      touchStartX = null;
    }, { passive: true });
  })();

  /* ============================================================
     Admin: live photo upload (passcode-gated)
     Lets the site owner replace T-shirt preview photos from the live
     site itself, with the change visible to every visitor immediately.
     Uploads go to ImgBB (free image host); the returned URL is saved
     into an "ImageConfig" tab of the same Google Sheet used for
     submissions (via SheetDB), which every visitor's browser reads on
     page load. See assets/admin-config.example.js for setup and an
     important security note about the passcode.
     ============================================================ */
  var adminTriggerBtn = document.getElementById("adminTriggerBtn");
  var adminPanel = document.getElementById("adminPanel");
  var adminCloseBtn = document.getElementById("adminCloseBtn");
  var adminUnlocked = false;

  function fetchImageOverrides() {
    var endpoint = window.SUBMISSION_ENDPOINT;
    if (!endpoint) return;

    fetch(endpoint + "?sheet=ImageConfig")
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        var byId = {};
        rows.forEach(function (row) {
          if (row.id && row.url) byId[row.id] = row.url;
        });
        var changed = false;
        images.forEach(function (img) {
          if (byId[img.id]) {
            img.src = byId[img.id];
            img.available = true;
            changed = true;
          }
        });
        if (changed) {
          renderThumbs();
          setActiveIndex(activeIndex);
        }
      })
      .catch(function () {
        // ImageConfig sheet/tab not set up yet, or request failed — keep
        // showing the defaults from assets/config.js.
      });
  }

  // Downscales + compresses the picked file client-side before upload, so
  // a phone photo doesn't become a multi-MB request.
  function resizeImageFile(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var w = Math.round(img.width * scale);
        var h = Math.round(img.height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error("Could not process that image."));
        }, "image/jpeg", quality);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that file."));
      };
      img.src = url;
    });
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        // ImgBB wants the raw base64 payload, without the "data:...;base64," prefix.
        resolve(String(reader.result).split(",")[1]);
      };
      reader.onerror = function () { reject(new Error("Could not read that file.")); };
      reader.readAsDataURL(blob);
    });
  }

  function uploadToImgbb(blob) {
    var apiKey = window.IMGBB_API_KEY;
    if (!apiKey || apiKey.indexOf("your-imgbb") === 0) {
      return Promise.reject(new Error("ImgBB API key isn't configured yet (assets/admin-config.js)."));
    }
    return blobToBase64(blob).then(function (base64) {
      var body = new URLSearchParams();
      body.set("key", apiKey);
      body.set("image", base64);
      return fetch("https://api.imgbb.com/1/upload", { method: "POST", body: body });
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (!json || !json.data || !json.data.url) {
        throw new Error("ImgBB upload failed.");
      }
      return json.data.url;
    });
  }

  function saveImageUrl(id, url) {
    var endpoint = window.SUBMISSION_ENDPOINT;
    if (!endpoint) return Promise.reject(new Error("Submission endpoint isn't configured yet."));

    return fetch(endpoint + "/id/" + id + "?sheet=ImageConfig", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { url: url } })
    }).then(function (res) {
      if (!res.ok) throw new Error("Could not save the new photo (" + res.status + ").");
    });
  }

  function handleAdminFileChange(event) {
    var input = event.target;
    var id = input.getAttribute("data-admin-id");
    var statusEl = document.querySelector('[data-admin-status="' + id + '"]');
    var file = input.files && input.files[0];
    if (!file) return;

    if (statusEl) statusEl.textContent = "Uploading…";

    resizeImageFile(file, 1200, 0.82)
      .then(uploadToImgbb)
      .then(function (url) {
        return saveImageUrl(id, url).then(function () { return url; });
      })
      .then(function (url) {
        images.forEach(function (img) {
          if (img.id === id) {
            img.src = url;
            img.available = true;
          }
        });
        renderThumbs();
        setActiveIndex(activeIndex);
        if (statusEl) statusEl.textContent = "Updated — live for everyone now.";
      })
      .catch(function (err) {
        if (statusEl) statusEl.textContent = "Failed: " + err.message;
      })
      .finally(function () {
        input.value = "";
      });
  }

  if (adminTriggerBtn && adminPanel) {
    adminTriggerBtn.addEventListener("click", function () {
      if (!adminUnlocked) {
        var entered = window.prompt("Admin passcode:");
        if (entered === null) return;
        if (!window.ADMIN_PASSCODE || entered !== window.ADMIN_PASSCODE) {
          window.alert("Incorrect passcode.");
          return;
        }
        adminUnlocked = true;
      }
      adminPanel.hidden = false;
      adminPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  if (adminCloseBtn && adminPanel) {
    adminCloseBtn.addEventListener("click", function () {
      adminPanel.hidden = true;
    });
  }
  document.querySelectorAll(".admin-file-input").forEach(function (input) {
    input.addEventListener("change", handleAdminFileChange);
  });

  renderThumbs();
  setActiveIndex(0);
  fetchImageOverrides();
})();
