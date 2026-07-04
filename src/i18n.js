// ── Bilingual toggle (EN/ES) ────────────────────────────────────
// Dish names stay in Spanish (their real names); everything else
// (headlines, nav, buttons, descriptions) switches with the toggle.
const translations = {
  es: {
    navHome: "Inicio",
    navLocation: "Ubicación",
    navCall: "Llamar",
    navQuote: "Cotización",
    heroTitle: "Menú de Banquetes",
    heroSubhead: "Auténtica comida mexicana para fiestas de cumpleaños, bautizos, baby showers, y eventos de oficina. Entregas en Bronx, NY y zonas cercanas. Pedido mínimo: 20 personas.",
    traySizes: "Charola: Chica, Mediana o Grande",
    tapHint: "Toca un platillo con ícono de cámara para ver la foto",
    groupMeats: "Carnes y Mariscos",
    groupSides: "Guarniciones",
    groupExtras: "Antojitos y Especialidades",
    categorySubtitle: "(Charola: Chica, Mediana o Grande)",
    modalClose: "Cerrar foto",
    modalUnavailable: "Imagen no disponible",
    footerBrandSub: "Hacemos comida para eventos",
    footerRights: "Todos los derechos reservados",
  },
  en: {
    navHome: "Home",
    navLocation: "Location",
    navCall: "Call",
    navQuote: "Quote",
    heroTitle: "Catering Menu",
    heroSubhead: "Authentic Mexican food for birthday parties, baptisms, baby showers, and office events. We deliver to Bronx, NY and nearby areas. Minimum order: 20 guests.",
    traySizes: "Trays: Small, Medium, or Full",
    tapHint: "Tap a dish with a camera icon to see a photo",
    groupMeats: "Meats & Seafood",
    groupSides: "Sides",
    groupExtras: "Appetizers & Specialties",
    categorySubtitle: "(Small, Medium, or Full Tray)",
    modalClose: "Close photo",
    modalUnavailable: "Image unavailable",
    footerBrandSub: "Catering for all your events",
    footerRights: "All rights reserved",
  },
};

function applyLanguage(lang) {
  const dict = translations[lang] || translations.es;

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria;
    if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
  });

  localStorage.setItem("blfm-lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("blfm-lang") || "es";
  applyLanguage(saved);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });
});
