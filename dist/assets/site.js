const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".page-progress span");
let ticking = false;

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${amount}%`;
  if (header) header.classList.toggle("is-solid", window.scrollY > 28);
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollUI);
    ticking = true;
  }
}, { passive: true });
updateScrollUI();

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
  });
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  }));
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -28px" });

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-active");
  });
}, { threshold: 0.24 });

document.querySelectorAll(".path-section, .signal-board").forEach((node) => activeObserver.observe(node));

if (finePointer && !prefersReducedMotion) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--rx", `${-relativeY * 2}deg`);
      card.style.setProperty("--ry", `${relativeX * 2}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

const dialog = document.querySelector("[data-dialog]");
document.querySelectorAll("[data-open-dialog]").forEach((button) => button.addEventListener("click", () => {
  if (dialog?.showModal) dialog.showModal();
}));
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => dialog?.close()));
dialog?.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const isBackdrop = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (isBackdrop) dialog.close();
});

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = new FormData(contactForm);
  const brief = [
    "咨询信息",
    `称呼：${values.get("name") || ""}`,
    `品牌 / 公司：${values.get("company") || ""}`,
    `联系方式：${values.get("contact") || ""}`,
    `问题：${values.get("message") || ""}`,
  ].join("\n");
  try {
    await navigator.clipboard.writeText(brief);
    formStatus.textContent = "咨询信息已复制。替换真实邮箱后，可直接粘贴发送。";
  } catch {
    formStatus.textContent = "请手动复制填写内容，并发送到你替换后的真实联系方式。";
  }
});

const canUseWebGL = finePointer && !prefersReducedMotion && !(navigator.connection && navigator.connection.saveData);
if (canUseWebGL) {
  import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js")
    .then((THREE) => initializeHeroScene(THREE))
    .catch(() => document.documentElement.classList.add("no-webgl"));
} else {
  document.documentElement.classList.add("no-webgl");
}

function initializeHeroScene(THREE) {
  const canvas = document.querySelector("#hero-canvas");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch {
    document.documentElement.classList.add("no-webgl");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.8);

  const core = new THREE.Group();
  core.position.set(1.92, 0.05, 0);
  core.rotation.set(-0.2, 0.35, 0.08);
  scene.add(core);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.58, 4),
    new THREE.MeshPhysicalMaterial({
      color: 0x0c0a06,
      emissive: 0x120a03,
      emissiveIntensity: 0.11,
      metalness: 0.9,
      roughness: 0.29,
      clearcoat: 0.24,
      clearcoatRoughness: 0.24,
    })
  );
  core.add(shell);

  const meshLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.61, 3)),
    new THREE.LineBasicMaterial({ color: 0xc9a45d, transparent: true, opacity: 0.36 })
  );
  core.add(meshLines);

  const interior = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.76, 2),
    new THREE.MeshStandardMaterial({ color: 0xc7a35f, metalness: 0.78, roughness: 0.36, transparent: true, opacity: 0.48, wireframe: true })
  );
  core.add(interior);

  const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xb88939, metalness: 0.9, roughness: 0.27, transparent: true, opacity: 0.56 });
  const makeRing = (radius, tube, rotation, position = [0, 0, 0]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 110), ringMaterial);
    ring.rotation.set(...rotation);
    ring.position.set(...position);
    core.add(ring);
    return ring;
  };
  const ringOneBase = [1.31, -0.35, 0.14];
  const ringTwoBase = [0.76, 0.78, -0.88];
  const ringThreeBase = [1.12, 0.15, 0.56];
  const ringOne = makeRing(2.08, 0.012, ringOneBase);
  const ringTwo = makeRing(1.92, 0.008, ringTwoBase);
  const ringThree = makeRing(2.48, 0.006, ringThreeBase);

  const particleGeometry = new THREE.BufferGeometry();
  const points = [];
  const particleCount = 144;
  for (let index = 0; index < particleCount; index += 1) {
    const radius = 2.75 + Math.random() * 1.85;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    points.push(
      Math.sin(phi) * Math.cos(theta) * radius,
      Math.cos(phi) * radius,
      Math.sin(phi) * Math.sin(theta) * radius
    );
  }
  particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    color: 0xaa813a, size: 0.016, transparent: true, opacity: 0.45, depthWrite: false,
  }));
  core.add(particles);

  const ambient = new THREE.HemisphereLight(0x2c2417, 0x020201, 0.45);
  scene.add(ambient);
  const keyLight = new THREE.PointLight(0xffe1aa, 20, 12, 2);
  keyLight.position.set(-2.8, 3.6, 4.7);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xb98632, 16, 11, 2);
  rimLight.position.set(4.4, -1.8, 3.3);
  scene.add(rimLight);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const bounds = hero.getBoundingClientRect();
    target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };
  hero.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerleave", () => {
    target.x = 0;
    target.y = 0;
  }, { passive: true });

  const resize = () => {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 650 ? 8.8 : 7.8;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  let pageVisible = !document.hidden;
  let heroVisible = true;
  let frame = 0;
  const heroObserver = new IntersectionObserver((entries) => {
    heroVisible = entries[0]?.isIntersecting ?? false;
    toggleRender();
  }, { threshold: 0.03 });
  heroObserver.observe(hero);
  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;
    toggleRender();
  });

  const shouldRender = () => pageVisible && heroVisible;
  const loop = (time) => {
    if (!shouldRender()) { frame = 0; return; }
    pointer.x += (target.x - pointer.x) * 0.042;
    pointer.y += (target.y - pointer.y) * 0.042;
    const scrollPhase = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
    core.rotation.y = 0.35 + time * 0.00022 + pointer.x * 0.1;
    core.rotation.x = -0.2 + Math.sin(time * 0.00019) * 0.04 - pointer.y * 0.07;
    core.position.x = 1.92 + pointer.x * 0.16;
    core.position.y = 0.05 - pointer.y * 0.15 - scrollPhase * 0.22;
    ringOne.rotation.z = ringOneBase[2] + time * 0.00012;
    ringTwo.rotation.z = ringTwoBase[2] - time * 0.00017;
    ringThree.rotation.z = ringThreeBase[2] + time * 0.00009;
    interior.rotation.set(-time * 0.00023, time * 0.00031, 0);
    particles.rotation.y = time * 0.000025;
    particles.rotation.x = Math.sin(time * 0.00017) * 0.12;
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(loop);
  };
  const toggleRender = () => {
    if (shouldRender() && !frame) frame = window.requestAnimationFrame(loop);
  };
  toggleRender();
}
