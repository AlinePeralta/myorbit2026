"use strict";

const filter = document.querySelector("[data-filter]");
if (filter)
  filter.addEventListener("input", () => {
    const term = filter.value.trim().toLocaleLowerCase();
    let count = 0;
    document.querySelectorAll("[data-search-item]").forEach((item) => {
      item.hidden = !item.textContent.toLocaleLowerCase().includes(term);
      if (!item.hidden) count++;
    });
    document.querySelector("[data-filter-list]").hidden = count === 0;
    const empty = document.querySelector("[data-filter-empty]");
    if (empty) empty.hidden = count !== 0;
    document.querySelector("[data-filter-status]").textContent =
      `${count} results`;
  });
function selectPhoto(index) {
  const thumbs = [...document.querySelectorAll("[data-gallery-index]")];
  if (!thumbs.length) return;
  const current = (index + thumbs.length) % thumbs.length;
  const img = document.querySelector(".gallery-main");
  img.src = thumbs[current].dataset.src;
  img.alt = `${document.body.dataset.selectedChildName || "Emilia"} — activity photo ${current + 1}`;
  document.querySelector(".gallery-count").textContent =
    `${current + 1} / ${thumbs.length}`;
  thumbs.forEach((t, i) =>
    t.setAttribute("aria-pressed", String(i === current)),
  );
}
document.addEventListener("click", (event) => {
  const thumb = event.target.closest("[data-gallery-index]");
  if (thumb) selectPhoto(Number(thumb.dataset.galleryIndex));
  const step = event.target.closest("[data-gallery-step]");
  if (step) {
    const thumbs = [...document.querySelectorAll("[data-gallery-index]")];
    const current = thumbs.findIndex(
      (t) => t.getAttribute("aria-pressed") === "true",
    );
    selectPhoto(current + Number(step.dataset.galleryStep));
  }
});
