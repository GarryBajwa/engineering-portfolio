(function () {
  const grid = document.getElementById("field-notes-grid");
  const lightbox = document.getElementById("field-notes-lightbox");
  const imageEl = document.getElementById("field-lightbox-image");
  const closeBtn = lightbox?.querySelector(".field-lightbox-close");
  const prevBtn = lightbox?.querySelector(".field-lightbox-prev");
  const nextBtn = lightbox?.querySelector(".field-lightbox-next");

  if (!grid) return;

  // The portfolio is on GitHub Pages, so discover uploaded image filenames
  // through the public repository API. No additional metadata or captions required.
  const galleryFolder = "assets/maintenance-field-notes/";
  const folderApiUrl = "https://api.github.com/repos/GarryBajwa/engineering-portfolio/contents/assets/maintenance-field-notes?ref=main";
  const fallback = Array.isArray(window.FIELD_NOTES)
    ? window.FIELD_NOTES.filter(item => item && typeof item.image === "string")
    : [];

  let photos = fallback;
  let currentIndex = 0;
  let lastTrigger = null;

  function openLightbox(index, trigger) {
    if (!lightbox || !imageEl || !photos[index]) return;
    currentIndex = index;
    if (trigger) lastTrigger = trigger;
    const item = photos[index];
    imageEl.src = item.image;
    imageEl.alt = item.alt || "Maintenance and engineering photo";
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
    if (!photos.length) return;
    currentIndex = (currentIndex + step + photos.length) % photos.length;
    openLightbox(currentIndex, null);
  }

  function renderGallery() {
    grid.replaceChildren();
    photos.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "field-photo";
      button.setAttribute("aria-label", "Open maintenance photo " + (index + 1));

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || "Hands-on maintenance and engineering work";
      img.loading = index < 6 ? "eager" : "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => button.remove());
      button.appendChild(img);

      button.addEventListener("click", () => openLightbox(index, button));
      grid.appendChild(button);
    });
  }

  async function loadFolderPhotos() {
    try {
      const response = await fetch(folderApiUrl, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!response.ok) return;
      const contents = await response.json();
      if (!Array.isArray(contents)) return;
      const found = contents
        .filter(file => file.type === "file" && /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map(file => ({
          image: galleryFolder + encodeURIComponent(file.name),
          alt: "Maintenance and engineering work photograph"
        }));
      if (!found.length) return;
      photos = found;
      renderGallery();
    } catch (_) {
      // Use the existing gallery photos when GitHub discovery is unavailable.
    }
  }

  renderGallery();
  loadFolderPhotos();

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
