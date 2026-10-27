(function () {
  const grid = document.getElementById("field-notes-grid");
  const filters = document.getElementById("field-notes-filters");
  const summary = document.getElementById("field-notes-summary");
  const empty = document.getElementById("field-notes-empty");
  const lightbox = document.getElementById("field-notes-lightbox");
  const lightboxImage = document.getElementById("field-lightbox-image");
  const lightboxCaption = document.getElementById("field-lightbox-caption");
  const closeBtn = lightbox?.querySelector(".field-lightbox-close");
  const prevBtn = lightbox?.querySelector(".field-lightbox-prev");
  const nextBtn = lightbox?.querySelector(".field-lightbox-next");

  if (!grid || !Array.isArray(window.FIELD_NOTES)) return;
  const entries = window.FIELD_NOTES.filter(item => item && typeof item.image === "string");
  const categoryOrder = [
    "Preventive Maintenance", "Repairs & Troubleshooting",
    "Diagnostics & Inspections", "Small Improvements",
    "Builds & Prototypes", "Illustrative References"
  ];
  const present = [...new Set(entries.map(item => item.category || "Other"))];
  const categories = present.sort((a, b) => {
    const ai = categoryOrder.indexOf(a), bi = categoryOrder.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b);
  });

  let visible = entries;
  let category = "All work";
  let currentIndex = 0;
  let lastTrigger = null;

  function openLightbox(index, trigger) {
    if (!lightbox || !lightboxImage || !visible[index]) return;
    currentIndex = index;
    if (trigger) lastTrigger = trigger;
    const item = visible[currentIndex];
    lightboxImage.src = item.image;
    lightboxImage.alt = item.alt || "";
    if (lightboxCaption) {
      const wording = [item.title, item.caption].filter(Boolean).join(" — ");
      lightboxCaption.textContent = wording;
      lightboxCaption.hidden = !wording;
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeBtn?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastTrigger?.isConnected) lastTrigger.focus();
  }

  function move(step) {
    if (!visible.length) return;
    currentIndex = (currentIndex + step + visible.length) % visible.length;
    openLightbox(currentIndex, null);
  }

  function renderGallery() {
    visible = category === "All work" ? entries : entries.filter(item => (item.category || "Other") === category);
    grid.replaceChildren();
    visible.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "field-photo";
      button.setAttribute("aria-label", "Open field note: " + (item.title || item.caption || "Engineering photo"));

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || "";
      img.loading = index < 6 ? "eager" : "lazy";
      img.decoding = "async";
      button.appendChild(img);

      const copy = document.createElement("span");
      copy.className = "field-photo-copy";
      const kind = document.createElement("small");
      kind.textContent = item.category || "Field Note";
      const title = document.createElement("strong");
      title.textContent = item.title || "Field Note";
      const detail = document.createElement("span");
      detail.textContent = item.caption || "";
      copy.append(kind, title, detail);
      button.appendChild(copy);

      button.addEventListener("click", () => openLightbox(index, button));
      grid.appendChild(button);
    });
    if (summary) summary.textContent = visible.length + (visible.length === 1 ? " photo note" : " photo notes") + " · " + category;
    if (empty) empty.hidden = visible.length !== 0;
  }

  function renderFilters() {
    if (!filters) return;
    filters.replaceChildren();
    // Only show populated categories; PM and improvement types appear as photos are added.
    ["All work", ...categories].forEach(value => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "field-notes-filter";
      button.textContent = value;
      button.setAttribute("aria-pressed", value === category ? "true" : "false");
      button.addEventListener("click", () => {
        category = value;
        renderFilters();
        renderGallery();
      });
      filters.appendChild(button);
    });
  }

  renderFilters();
  renderGallery();
  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", () => move(-1));
  nextBtn?.addEventListener("click", () => move(1));

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
})();
