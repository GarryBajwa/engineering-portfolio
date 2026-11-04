/*
 * Portfolio case-study section ordering.
 *
 * Each project page can define order directly in its section opening tags:
 *   <section class="section" data-section-order="2">
 *   <section class="section" data-section-order="1">
 *
 * Smaller numbers appear earlier. Ties retain their original document order.
 * The hero and project overview remain fixed. Navigation stays at the bottom.
 */
(function () {
  const main = document.querySelector("main");
  if (!main) return;

  const sections = [...main.children].filter(node =>
    node.matches && node.matches("section[data-section-order]")
  );
  if (sections.length < 2) return;

  const orderValue = section => {
    const value = Number(section.getAttribute("data-section-order"));
    return Number.isFinite(value) && value >= 0 ? value : Number.MAX_SAFE_INTEGER;
  };

  const sorted = sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => orderValue(a.section) - orderValue(b.section) || a.index - b.index)
    .map(item => item.section);

  // Keep existing Previous/Next links at the bottom even if their original
  // surrounding section moves to an earlier position.
  const nav = main.querySelector(".project-nav");
  if (nav && nav.closest("section[data-section-order]")) {
    const navWrap = document.createElement("div");
    navWrap.className = "container project-nav-footer";
    navWrap.appendChild(nav);
    main.appendChild(navWrap);
  }

  // Preserve each non-section block (hero, project overview and other content)
  // while placing sections into their requested positions.
  const slots = sections.map(section => {
    const marker = document.createComment("project-section-position");
    section.replaceWith(marker);
    return marker;
  });
  slots.forEach((slot, index) => slot.replaceWith(sorted[index]));

  // Keep visible case numbers in sequence when sections are rearranged.
  let caseNumber = 0;
  let numberedSection = 0;
  sorted.forEach(section => {
    const label = section.querySelector(".container > .eyebrow");
    if (!label) return;
    if (/^Case\s+\d+/i.test(label.textContent.trim())) {
      caseNumber += 1;
      label.textContent = label.textContent.replace(
        /^Case\s+\d+/i, "Case " + String(caseNumber).padStart(2, "0")
      );
    } else if (/^\d{2}\s*[·—–-]/.test(label.textContent.trim())) {
      numberedSection += 1;
      label.textContent = label.textContent.replace(
        /^\d{2}/, String(numberedSection).padStart(2, "0")
      );
    }
  });
})();
