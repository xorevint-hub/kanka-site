// Gürültü engelleme önizlemesi: konuşma dalgası + gürültü, anahtarla gürültü silinir.
(() => {
  const tuval = document.getElementById("dalga");
  const durum = document.getElementById("dalga-durum");
  const dugmeler = document.querySelectorAll(".anahtar button");
  if (!tuval) return;
  const c = tuval.getContext("2d");
  const az = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let acik = true, gurultu = 0, t = 0;

  dugmeler.forEach((d) => d.addEventListener("click", () => {
    acik = d.dataset.mod === "acik";
    dugmeler.forEach((x) => x.setAttribute("aria-pressed", String(x === d)));
    durum.textContent = acik ? "Gürültü siliniyor" : "Gürültü olduğu gibi gidiyor";
    durum.style.color = acik ? "var(--yesil)" : "var(--kirmizi)";
    if (az) ciz();
  }));

  function ciz() {
    const W = tuval.width, H = tuval.height, orta = H / 2;
    gurultu += ((acik ? 0.04 : 1) - gurultu) * 0.08;
    c.clearRect(0, 0, W, H);
    const cubuk = 4, ara = 3, n = Math.floor(W / (cubuk + ara));
    for (let i = 0; i < n; i++) {
      const x = i * (cubuk + ara);
      const k = (i / n) * 6 + t * 0.6;
      // konuşma: hece hece kabaran zarf
      const zarf = Math.max(0, Math.sin(k * 1.3) * 0.6 + Math.sin(k * 0.45 + 1) * 0.5);
      const konusma = zarf * (0.55 + 0.45 * Math.abs(Math.sin(i * 0.9 + t * 3))) * orta * 0.85;
      const g = (0.25 + 0.75 * Math.abs(Math.sin(i * 12.9898 + t * 7.3) * 43758.5453 % 1)) * orta * 0.35 * gurultu;
      c.fillStyle = "rgba(240,82,82,.75)";
      c.fillRect(x, orta - g, cubuk, g * 2 || 1);
      c.fillStyle = "#ff9a4d";
      c.fillRect(x, orta - konusma / 2 - 1, cubuk, konusma + 2);
    }
    t += 0.016;
    if (!az) requestAnimationFrame(ciz);
  }
  ciz();
})();

// Kaydırınca bölümler belirsin
(() => {
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((girisler) => girisler.forEach((g) => {
    if (g.isIntersecting) { g.target.classList.add("gorundu"); io.unobserve(g.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".bolum .kap > *").forEach((el) => { el.classList.add("belir"); io.observe(el); });
})();

// İmleç ışığı: masaüstünde fareyi yumuşakça izler, dokunmatikte yalnız dokunulan yerde kısa yanar
(() => {
  const zemin = document.querySelector(".zemin");
  if (!zemin) return;
  const az = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fare = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let hx = 0, hy = 0, x = 0, y = 0, kosuyor = false, sondur;
  const yaz = () => { zemin.style.setProperty("--x", x + "px"); zemin.style.setProperty("--y", y + "px"); };
  function adim() {
    x += (hx - x) * 0.18; y += (hy - y) * 0.18; yaz();
    if (Math.abs(hx - x) + Math.abs(hy - y) > 0.5) requestAnimationFrame(adim); else { x = hx; y = hy; yaz(); kosuyor = false; }
  }
  function git(e, ani) {
    hx = e.clientX; hy = e.clientY;
    if (az || ani) { x = hx; y = hy; yaz(); return; }
    if (!kosuyor) { kosuyor = true; requestAnimationFrame(adim); }
  }
  if (fare) {
    let ilk = true;
    addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; git(e, ilk); ilk = false; zemin.style.setProperty("--isik", 1); }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { zemin.style.setProperty("--isik", 0); ilk = true; });
  } else {
    addEventListener("pointerdown", (e) => {
      git(e, true); zemin.style.setProperty("--isik", 0.8);
      clearTimeout(sondur); sondur = setTimeout(() => zemin.style.setProperty("--isik", 0), 650);
    }, { passive: true });
  }
})();
