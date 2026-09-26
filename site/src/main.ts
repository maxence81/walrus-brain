import "./style.css";

/* Slush philosophy: the page reads as a printed collage, not a kinetic
   experience. Motion is restricted to the marquee strips (CSS) and
   tiny hover wiggles on stickers. */

document.querySelectorAll<HTMLElement>(".sticker").forEach((el) => {
  const base = getComputedStyle(el).transform === "none" ? "rotate(0deg)" : getComputedStyle(el).transform;
  const baseRot = el.className.match(/rot-l2|rot-r2/) ? (el.className.includes("l2") ? -11 : 12)
    : el.className.match(/rot-l\b|rot-r\b/) ? (el.className.includes("rot-l") ? -6 : 7) : 0;
  void base;
  el.style.transition = "transform 0.25s cubic-bezier(0.2,0.8,0.2,1)";
  el.style.pointerEvents = "auto";
  el.addEventListener("pointerenter", () => {
    el.style.transform = `rotate(${baseRot - 6}deg) scale(1.08)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = `rotate(${baseRot * 1}deg)`;
  });
});
