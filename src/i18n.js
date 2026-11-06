// ── Bilingual toggle (EN/ES) ────────────────────────────────────
// Dish names stay in Spanish (their real names); everything else
// (headlines, nav, buttons, descriptions) switches with the toggle.
const translations = {
  es: {
    navHome: "Inicio",
    navContact: "Contacto",
    homeSeason: "Feliz Día de Acción de Gracias",
    homeMenu: "Menú de Catering",
    homeMenuAria: "Ver el menú de catering",
    homeFacebookAria: "Visítanos en Facebook",
    homeTiktokAria: "Síguenos en TikTok",
    homeWhatsappAria: "Contáctanos por WhatsApp",
    homeMapsAria: "Ver nuestra ubicación en Google Maps",
    homeCallAria: "Llamar a Buffet Lucia's Fiesta Mexicana",
    navLocation: "Ubicación",
    navCall: "Llamar",
    navQuote: "Cotización",
    heroTitle: "Menú de Banquetes",
    heroSubhead: "Auténtica comida mexicana para fiestas de cumpleaños, bautizos, baby showers, y eventos de oficina. Entregas en Bronx, NY y zonas cercanas. Pedido mínimo: 20 personas.",
    traySizes: "Charola: Media o Entera",
    tapHint: "Toca un platillo con ícono de cámara para ver la foto",
    groupMeats: "Carnes y Mariscos",
    groupSides: "Guarniciones",
    groupExtras: "Antojitos y Especialidades",
    categorySubtitle: "(Charola: Media o Entera)",
    modalClose: "Cerrar foto",
    modalUnavailable: "Imagen no disponible",
    quoteModalTitle: "¿Cómo prefieres pedir tu cotización?",
    quoteText: "Texto",
    quoteWhatsapp: "WhatsApp",
    quoteCall: "Llamar",
    quoteEmail: "Correo",
    footerBrandSub: "Hacemos comida para eventos",
    footerTagline: "Barbacoa · Carnitas · Catering para toda ocasión",
    quoteForm: "Formulario de cotización",
    footerRights: "Todos los derechos reservados",
    navMenu: "Menú",
    quotePageTitle: "Solicita tu Cotización",
    quotePageSubhead: "Cuéntanos sobre tu evento y te responderemos con una cotización personalizada.",
    formName: "Nombre Completo",
    formPhone: "Teléfono",
    formEmailLabel: "Correo Electrónico",
    formDate: "Fecha del Evento",
    formGuests: "Número de Invitados",
    formEventType: "Tipo de Evento",
    eventBirthday: "Cumpleaños",
    eventBaptism: "Bautizo",
    eventBabyShower: "Baby Shower",
    eventOffice: "Evento de Oficina",
    eventOther: "Otro",
    formDishes: "Platillos de Interés (opcional)",
    formDishesHint: "Toca los platillos que te interesan. Puedes seleccionar varios.",
    formDishesNone: "Ningún platillo seleccionado",
    formDishesSelected: "{count} platillo(s) seleccionado(s)",
    dishModalAdd: "Agregar",
    dishModalRemove: "Quitar",
    dishModalCancel: "Cancelar",
    formDetails: "Detalles Adicionales",
    formDetailsPlaceholder: "Cuéntanos más sobre tu evento, platillos que te interesan, etc.",
    formSubmit: "Enviar Solicitud",
    formSubmitting: "Enviando...",
    formSuccessBody: "¡Gracias! Hemos recibido tu solicitud y te contactaremos pronto con tu cotización.",
    formErrorBody: "Hubo un problema al enviar tu solicitud. Por favor intenta de nuevo o llámanos directamente.",
    backToMenu: "Volver al Menú",
    galleryTitle: "Galería de Eventos",
    gallerySubtitle: "Así lucen nuestras charolas en eventos reales",
    galleryMorePhotos: "Ver más fotos y videos en Facebook",
    galleryMoreGoogle: "Ver fotos en Google",
    galleryPrev: "Foto anterior",
    galleryNext: "Foto siguiente",
  },
  en: {
    navHome: "Home",
    navContact: "Contact",
    homeSeason: "Happy Thanksgiving",
    homeMenu: "Catering Menu",
    homeMenuAria: "View the catering menu",
    homeFacebookAria: "Visit us on Facebook",
    homeTiktokAria: "Follow us on TikTok",
    homeWhatsappAria: "Contact us on WhatsApp",
    homeMapsAria: "See our location on Google Maps",
    homeCallAria: "Call Buffet Lucia's Fiesta Mexicana",
    navLocation: "Location",
    navCall: "Call",
    navQuote: "Quote",
    heroTitle: "Catering Menu",
    heroSubhead: "Authentic Mexican food for birthday parties, baptisms, baby showers, and office events. We deliver to Bronx, NY and nearby areas. Minimum order: 20 guests.",
    traySizes: "Trays: Half or Whole",
    tapHint: "Tap a dish with a camera icon to see a photo",
    groupMeats: "Meats & Seafood",
    groupSides: "Sides",
    groupExtras: "Appetizers & Specialties",
    categorySubtitle: "(Half or Whole Tray)",
    modalClose: "Close photo",
    modalUnavailable: "Image unavailable",
    quoteModalTitle: "How would you like to request your quote?",
    quoteText: "Text",
    quoteWhatsapp: "WhatsApp",
    quoteCall: "Call",
    quoteEmail: "Email",
    footerBrandSub: "Catering for all your events",
    footerTagline: "Barbacoa · Carnitas · Catering for every occasion",
    quoteForm: "Quote form",
    footerRights: "All rights reserved",
    navMenu: "Menu",
    quotePageTitle: "Request Your Quote",
    quotePageSubhead: "Tell us about your event and we'll get back to you with a personalized quote.",
    formName: "Full Name",
    formPhone: "Phone Number",
    formEmailLabel: "Email Address",
    formDate: "Event Date",
    formGuests: "Number of Guests",
    formEventType: "Type of Event",
    eventBirthday: "Birthday",
    eventBaptism: "Baptism",
    eventBabyShower: "Baby Shower",
    eventOffice: "Office Event",
    eventOther: "Other",
    formDishes: "Dishes You're Interested In (optional)",
    formDishesHint: "Tap the dishes you're interested in. You can select more than one.",
    formDishesNone: "No dishes selected",
    formDishesSelected: "{count} dish(es) selected",
    dishModalAdd: "Add",
    dishModalRemove: "Remove",
    dishModalCancel: "Cancel",
    formDetails: "Additional Details",
    formDetailsPlaceholder: "Tell us more about your event, dishes you're interested in, etc.",
    formSubmit: "Send Request",
    formSubmitting: "Sending...",
    formSuccessBody: "Thank you! We've received your request and will contact you soon with your quote.",
    formErrorBody: "There was a problem sending your request. Please try again or call us directly.",
    backToMenu: "Back to Menu",
    galleryTitle: "Event Gallery",
    gallerySubtitle: "See how our trays look at real events",
    galleryMorePhotos: "See more photos & videos on Facebook",
    galleryMoreGoogle: "See photos on Google",
    galleryPrev: "Previous photo",
    galleryNext: "Next photo",
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

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
  });

  try { localStorage.setItem("blfm-lang", lang); } catch { /* storage blocked: choice just won't persist */ }
}

document.addEventListener("DOMContentLoaded", () => {
  let saved = "es";
  try { saved = localStorage.getItem("blfm-lang") === "en" ? "en" : "es"; } catch { /* storage blocked */ }
  applyLanguage(saved);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });
});
