/* ==========================================================================
   Catering menu: renders the menu, search/filter, photo viewer and the
   "party list" that customers send to us on WhatsApp.

   - Add a dish: add an entry to MENU. `img` is a slug from
     scripts/make_catering_images.py (thumb: imgs/catering/thumbs/<img>.jpg,
     viewer: imgs/catering/full/<img>.jpg). Dishes without `img` show
     "Photo coming soon". Optional: `video: 'file.mp4'`, `popular: true`.
   - New season (Navidad, Día de Muertos...): edit SEASON_EMOJI and the
     strings marked "seasonal" below, the colors in src/catering.css (:root)
     and the decorations inside .sky in index.html.
   ========================================================================== */

const WHATSAPP_NUMBER = '13476862462';
const STORAGE_KEY = 'blfm-party-list';
const VIEW_KEY = 'blfm-menu-view'; // 'grid' (photo cards) or 'list' (names only)
const LANG_KEY = 'blfm-lang'; // shared with the rest of the site (src/i18n.js)
const SEASON_EMOJI = '🎃';

const CATEGORIES = [
    { id: 'chivo', name: 'Chivo', en: 'Goat' },
    { id: 'puerco', name: 'Puerco', en: 'Pork' },
    { id: 'pollo', name: 'Pollo', en: 'Chicken' },
    { id: 'res', name: 'Res', en: 'Beef' },
    { id: 'mariscos', name: 'Mariscos', en: 'Seafood' },
    { id: 'ensaladas', name: 'Ensaladas', en: 'Salads' },
    { id: 'arroz', name: 'Arroz, Frijoles y Tortillas', en: 'Rice, Beans & Tortillas' },
    { id: 'pastas', name: 'Pastas', en: 'Pasta' },
    { id: 'antojitos', name: 'Antojitos y Vegetarianos', en: 'Appetizers & Vegetarian' },
    { id: 'ninos', name: 'Para los Niños', en: "Kids' Favorites" },
    { id: 'casa', name: 'Especialidades de la Casa', en: 'House Specialties' },
];

const MENU = [
    { name: 'Chivo', cat: 'chivo' },
    { name: 'Chivo Entero', cat: 'chivo', img: 'chivo-entero', popular: true },
    { name: 'Chivo Media Charola', cat: 'chivo', img: 'chivo-media-charola' },

    { name: 'Carnitas', cat: 'puerco', img: 'carnitas', popular: true },
    { name: 'Pernil', cat: 'puerco' },
    { name: 'Costillas Fritas', cat: 'puerco', img: 'costillas-fritas' },
    { name: 'Costillas en Salsa Verde', cat: 'puerco' },
    { name: 'Costillas de Puerco en Salsa Verde', cat: 'puerco', img: 'costillas-puerco-salsa-verde' },
    { name: 'Costillas en BBQ', cat: 'puerco', img: 'costillas-bbq' },
    { name: 'Costillas en Salsa Roja', cat: 'puerco' },
    { name: 'Adobo de Puerco', cat: 'puerco', img: 'adobo-puerco' },
    { name: 'Guisado de Puerco', cat: 'puerco' },

    { name: 'Pollo Enchilado', cat: 'pollo', img: 'pollo-enchilado' },
    { name: 'Pollo Rostizado', cat: 'pollo', img: 'pollo-rostizado' },
    { name: 'Mixiotes de Pollo', cat: 'pollo' },
    { name: 'Mixiotes de Pollo con Nopales', cat: 'pollo', img: 'mixiotes-pollo-nopales' },
    { name: 'Mole Poblano de Pollo', cat: 'pollo', img: 'mole-poblano-pollo', popular: true },
    { name: 'Adobo de Pollo', cat: 'pollo', img: 'adobo-pollo' },
    { name: 'Guisado de Pollo', cat: 'pollo' },
    { name: 'Tinga de Pollo', cat: 'pollo' },
    { name: 'Alas en BBQ', cat: 'pollo', img: 'alas-bbq' },
    { name: 'Pechuga Empanizada', cat: 'pollo' },
    { name: 'Piernas de Pollo Empanizadas', cat: 'pollo', img: 'piernas-pollo-empanizadas' },
    { name: 'Pollo a la Francesa', cat: 'pollo', img: 'pollo-francesa' },

    { name: 'Mixiotes de Res', cat: 'res' },
    { name: 'Bistec a la Mexicana', cat: 'res', img: 'bistec-mexicana' },
    { name: 'Bistec Encebollado', cat: 'res' },
    { name: 'Adobo de Res', cat: 'res' },

    { name: 'Camarones a la Diabla', cat: 'mariscos', img: 'camarones-diabla' },
    { name: 'Camarones Fritos', cat: 'mariscos', img: 'camarones-fritos' },

    { name: 'Ensalada de Nopales', cat: 'ensaladas', img: 'ensalada-nopales' },
    { name: 'Ensalada Mixta', cat: 'ensaladas', img: 'ensalada-mixta' },
    { name: 'Ensalada de Frutas', cat: 'ensaladas' },
    { name: 'Ensalada de Papas', cat: 'ensaladas', img: 'ensalada-papas' },

    { name: 'Arroz Mexicano', cat: 'arroz', img: 'arroz-mexicano' },
    { name: 'Arroz Blanco', cat: 'arroz', img: 'arroz-blanco' },
    { name: 'Arroz Blanco con Frijoles', cat: 'arroz' },
    { name: 'Arroz con Gandules', cat: 'arroz', img: 'arroz-gandules' },
    { name: 'Arroz con Vegetales', cat: 'arroz', img: 'arroz-vegetales' },
    { name: 'Frijoles', cat: 'arroz', img: 'frijoles' },
    { name: 'Tortillas Hechas a Mano', cat: 'arroz', img: 'tortillas' },

    { name: 'Espagueti a la Mexicana', cat: 'pastas', img: 'espagueti-mexicana' },
    { name: 'Espagueti Estilo Marisol', cat: 'pastas' },
    { name: 'Espagueti con Crema y Queso', cat: 'pastas', img: 'espagueti-crema-queso' },
    { name: 'Macaroni and Cheese', cat: 'pastas', img: 'macaroni-cheese' },
    { name: 'Pasta Penne Vodka', cat: 'pastas', img: 'penne-vodka' },
    { name: 'Lasagna', cat: 'pastas', img: 'lasagna' },

    { name: 'Chiles Rellenos', cat: 'antojitos', img: 'chiles-rellenos' },
    { name: 'Chilaquiles', cat: 'antojitos', img: 'chilaquiles' },
    { name: 'Flautas (Queso, Pollo o Papas)', cat: 'antojitos', img: 'flautas' },

    { name: 'Hot Dogs', cat: 'ninos', img: 'hot-dogs' },
    { name: 'Chicken Tenders', cat: 'ninos', img: 'chicken-tenders' },

    { name: 'Mole Estilo Mi Rancho', cat: 'casa', img: 'mole-mi-rancho' },
    { name: 'Albóndigas al Gusto', cat: 'casa' },
].map((dish, i) => ({ ...dish, id: `d${i}` }));

// Photos from real events (viewer only, not orderable)
const EVENTS = [
    { img: 'evento-mesa', es: 'Mesa de catering', en: 'Catering table' },
    { img: 'evento-costillas', es: 'Costillas en salsa', en: 'Ribs in sauce' },
    { img: 'evento-mesa-completa', es: 'Mesa completa de catering', en: 'Full catering spread' },
    { img: 'evento-mariscos', es: 'Mariscos y guarniciones', en: 'Seafood and sides' },
    { img: 'evento-pollo-rostizado', es: 'Pollo rostizado en charola', en: 'Roast chicken trays' },
    { img: 'evento-pollo-ejotes', es: 'Pollo en salsa con ejotes', en: 'Chicken in sauce with green beans' },
    { img: 'evento-pastas', es: 'Mesa de pastas y carnes', en: 'Pasta and meats' },
    { img: 'evento-bistec', es: 'Bistec a la mexicana', en: 'Mexican-style steak' },
    { img: 'evento-pernil', es: 'Pernil enchilado', en: 'Spicy roast pork' },
    { img: 'evento-pollo-frito', es: 'Pollo frito', en: 'Fried chicken' },
    { img: 'evento-mole', es: 'Mole poblano', en: 'Mole poblano' },
    { img: 'evento-adobo', es: 'Adobo de puerco', en: 'Pork adobo' },
].map((ev, i) => ({ ...ev, id: `e${i}` }));

const TRAY_SIZES = ['chica', 'mediana', 'grande'];

const STRINGS = {
    es: {
        skip: 'Saltar al menú',
        navHome: 'Inicio',
        navContact: 'Contacto',
        navLocation: 'Ubicación',
        // seasonal
        eyebrow: 'Fiestas de Halloween · Fiestas · Toda celebración',
        heroTitle: 'Menú de <span>Catering</span>',
        lede: 'Comida mexicana de miedo… ¡de lo rica! para tu próxima fiesta. Elige tus platillos favoritos, agrégalos a tu lista y envíanosla por WhatsApp para tu cotización.',
        emptyText: term => `Ningún platillo coincide con <strong>"${term}"</strong>. ¡Los fantasmas se los comieron!`,
        // end seasonal
        factDelivery: 'Entregas en el Bronx y zonas cercanas',
        factMinimum: 'Pedido mínimo: 20 personas',
        factTrays: 'Charolas: chica, mediana o grande',
        browse: 'Ver el menú',
        stepsTitle: 'Cómo funciona',
        step1: 'Explora',
        step1Text: 'Toca cualquier foto para verla de cerca.',
        step2: 'Agrega platillos',
        step2Text: 'Arma tu lista de fiesta con el botón +.',
        step3: 'Envíala',
        step3Text: 'Compártenos tu lista por WhatsApp.',
        eventsTitle: 'Eventos reales',
        eventsSubtitle: 'Así lucen nuestras charolas en eventos reales',
        moreFacebook: 'Más fotos y videos en Facebook',
        moreGoogle: 'Fotos en Google',
        realEvent: 'Evento real · Real event',
        searchLabel: 'Buscar platillos',
        searchPlaceholder: 'Buscar platillos… (ej. pollo, arroz)',
        filterLabel: 'Filtrar por categoría',
        viewLabel: 'Ver el menú como',
        viewGrid: 'Fotos',
        viewList: 'Lista',
        all: 'Todos',
        showing: n => `Mostrando ${n} ${n === 1 ? 'platillo' : 'platillos'}`,
        clearSearch: 'Borrar búsqueda',
        add: 'Agregar',
        added: 'Agregado',
        addAria: name => `Agregar ${name} a la lista de fiesta`,
        removeAria: name => `Quitar ${name} de la lista de fiesta`,
        viewPhoto: name => `Ver foto de ${name}`,
        photoSoon: 'Foto próximamente',
        favorite: 'Favorito',
        video: 'Video',
        lbAdd: 'Agregar a la lista',
        lbAdded: 'En tu lista',
        prev: 'Anterior',
        next: 'Siguiente',
        close: 'Cerrar',
        partyList: 'Lista de fiesta',
        fabAria: n => `Abrir lista de fiesta, ${n} ${n === 1 ? 'platillo' : 'platillos'}`,
        drawerTitle: 'Tu lista de fiesta',
        drawerEmpty: 'Tu lista está vacía. Toca <strong>+ Agregar</strong> en cualquier platillo para armar tu menú de fiesta.',
        traySize: 'Tamaño de charola',
        sizeAny: 'Tamaño…',
        sizes: { chica: 'Chica', mediana: 'Mediana', grande: 'Grande' },
        guests: 'Número de invitados',
        eventDate: 'Fecha del evento',
        notes: 'Notas',
        optional: '(opcional)',
        notesPlaceholder: 'Recoger o entrega, alergias, cualquier otra cosa…',
        sendWhatsapp: 'Enviar lista por WhatsApp',
        copyList: 'Copiar lista',
        clearAll: 'Borrar todo',
        quoteForm: 'Formulario de cotización',
        tagline: 'Barbacoa · Carnitas · Catering para toda ocasión',
        rights: 'Todos los derechos reservados',
        toastAdded: name => `${SEASON_EMOJI} Agregaste ${name}`,
        toastRemoved: name => `Quitaste ${name}`,
        toastCopied: 'Lista copiada',
        toastCopyFail: 'No se pudo copiar. Usa WhatsApp.',
        toastCleared: 'Lista borrada',
        toastAddFirst: `Agrega un platillo primero ${SEASON_EMOJI}`,
        msgIntro: `¡Hola! Me gustaría una cotización de catering de Buffet Lucia's Fiesta Mexicana ${SEASON_EMOJI}`,
        msgDishes: 'Platillos:',
        msgGuests: 'Invitados',
        msgDate: 'Fecha del evento',
        msgNotes: 'Notas',
        msgTray: size => `charola ${size.toLowerCase()}`,
        locale: 'es-US',
    },
    en: {
        skip: 'Skip to menu',
        navHome: 'Home',
        navContact: 'Contact',
        navLocation: 'Location',
        // seasonal
        eyebrow: 'Halloween parties · Fiestas · Every celebration',
        heroTitle: 'Catering <span>Menu</span>',
        lede: 'Spooky-good Mexican food for your next party. Pick your favorite dishes, add them to your party list, and send it to us on WhatsApp for a quote.',
        emptyText: term => `No dishes match <strong>"${term}"</strong>. The ghosts must have eaten them!`,
        // end seasonal
        factDelivery: 'Delivery in the Bronx & nearby',
        factMinimum: 'Minimum order: 20 guests',
        factTrays: 'Trays: small, medium or large',
        browse: 'Browse the menu',
        stepsTitle: 'How it works',
        step1: 'Browse',
        step1Text: 'Tap any photo to see it up close.',
        step2: 'Add dishes',
        step2Text: 'Build your party list with the + button.',
        step3: 'Send it',
        step3Text: 'Share your list with us on WhatsApp.',
        eventsTitle: 'Real events',
        eventsSubtitle: 'This is how our trays look at real parties',
        moreFacebook: 'More photos & videos on Facebook',
        moreGoogle: 'Photos on Google',
        realEvent: 'Evento real · Real event',
        searchLabel: 'Search dishes',
        searchPlaceholder: 'Search dishes… (e.g. pollo, arroz)',
        filterLabel: 'Filter by category',
        viewLabel: 'Show the menu as',
        viewGrid: 'Photos',
        viewList: 'List',
        all: 'All',
        showing: n => `Showing ${n} ${n === 1 ? 'dish' : 'dishes'}`,
        clearSearch: 'Clear search',
        add: 'Add',
        added: 'Added',
        addAria: name => `Add ${name} to party list`,
        removeAria: name => `Remove ${name} from party list`,
        viewPhoto: name => `View photo of ${name}`,
        photoSoon: 'Photo coming soon',
        favorite: 'Favorite',
        video: 'Video',
        lbAdd: 'Add to party list',
        lbAdded: 'In your list',
        prev: 'Previous',
        next: 'Next',
        close: 'Close',
        partyList: 'Party list',
        fabAria: n => `Open party list, ${n} ${n === 1 ? 'dish' : 'dishes'}`,
        drawerTitle: 'Your party list',
        drawerEmpty: 'Your list is empty. Tap <strong>+ Add</strong> on any dish to start building your party menu.',
        traySize: 'Tray size',
        sizeAny: 'Size…',
        sizes: { chica: 'Small', mediana: 'Medium', grande: 'Large' },
        guests: 'Number of guests',
        eventDate: 'Event date',
        notes: 'Notes',
        optional: '(optional)',
        notesPlaceholder: 'Pickup or delivery, allergies, anything else…',
        sendWhatsapp: 'Send list on WhatsApp',
        copyList: 'Copy list',
        clearAll: 'Clear all',
        quoteForm: 'Quote form',
        tagline: 'Barbacoa · Carnitas · Catering for every occasion',
        rights: 'All rights reserved',
        toastAdded: name => `${SEASON_EMOJI} Added ${name}`,
        toastRemoved: name => `Removed ${name}`,
        toastCopied: 'List copied',
        toastCopyFail: 'Could not copy. Please use WhatsApp instead.',
        toastCleared: 'Party list cleared',
        toastAddFirst: `Add a dish first ${SEASON_EMOJI}`,
        msgIntro: `Hola! I'd like a catering quote from Buffet Lucia's Fiesta Mexicana ${SEASON_EMOJI}`,
        msgDishes: 'Dishes:',
        msgGuests: 'Guests',
        msgDate: 'Event date',
        msgNotes: 'Notes',
        msgTray: size => `${size.toLowerCase()} tray`,
        locale: 'en-US',
    },
};

const byId = new Map([...MENU, ...EVENTS].map(d => [d.id, d]));
const catById = new Map(CATEGORIES.map(c => [c.id, c]));

/* ---------- helpers ---------- */
const $ = sel => document.querySelector(sel);
const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const escapeHtml = s => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const thumb = img => `imgs/catering/thumbs/${img}.jpg`;
const fullPhoto = img => `imgs/catering/full/${img}.jpg`;

function storageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable: just won't persist */ }
}

// Saved as [{ name, size }] so saved lists survive menu reordering
function loadList() {
    try {
        const saved = JSON.parse(storageGet(STORAGE_KEY)) || [];
        return new Map(saved
            .filter(item => item && MENU.some(d => d.name === item.name))
            .map(item => [item.name, TRAY_SIZES.includes(item.size) ? item.size : '']));
    } catch {
        return new Map();
    }
}

function saveList() {
    storageSet(STORAGE_KEY, JSON.stringify([...partyList].map(([name, size]) => ({ name, size }))));
}

let toastTimer;
function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- state ---------- */
const partyList = loadList(); // dish name -> tray size ('' = not chosen)
const state = {
    query: '',
    category: 'all',
    lang: storageGet(LANG_KEY) === 'en' ? 'en' : 'es',
    view: storageGet(VIEW_KEY) === 'list' ? 'list' : 'grid',
};
const t = key => STRINGS[state.lang][key];

/* ---------- language ---------- */
function applyStaticText() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-t-html]').forEach(el => { el.innerHTML = t(el.dataset.tHtml); });
    document.querySelectorAll('[data-t-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.tAria)));
    document.querySelectorAll('.lang-btn').forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.lang === state.lang));
    $('#search').placeholder = t('searchPlaceholder');
    $('#notes').placeholder = t('notesPlaceholder');
    $('#chips').setAttribute('aria-label', t('filterLabel'));
}

function setLanguage(lang) {
    state.lang = lang;
    storageSet(LANG_KEY, lang);
    applyStaticText();
    renderChips();
    renderEvents();
    renderMenu();
    applyFilters();
    refreshListUi();
    if ($('#lightbox').open) showLightboxItem();
}

/* ---------- render menu ---------- */
function addButtonState(dish) {
    const added = partyList.has(dish.name);
    return {
        added,
        className: `add-btn${added ? ' is-added' : ''}`,
        label: added ? t('removeAria')(dish.name) : t('addAria')(dish.name),
        inner: `<svg class="icon" aria-hidden="true"><use href="#i-${added ? 'check' : 'plus'}"/></svg>${added ? t('added') : t('add')}`,
    };
}

function addButtonHtml(dish) {
    const s = addButtonState(dish);
    return `<button class="${s.className}" type="button" data-add="${dish.id}" aria-pressed="${s.added}" aria-label="${escapeHtml(s.label)}">${s.inner}</button>`;
}

// Update in place (not re-render) so keyboard focus stays on the button
function updateAddButton(btn) {
    const s = addButtonState(byId.get(btn.dataset.add));
    if (btn.getAttribute('aria-pressed') === String(s.added) && btn.getAttribute('aria-label') === s.label) return;
    btn.className = s.className;
    btn.setAttribute('aria-pressed', s.added);
    btn.setAttribute('aria-label', s.label);
    btn.innerHTML = s.inner;
}

function dishHtml(dish) {
    const popular = dish.popular ? `<span class="badge badge-popular">${t('favorite')}</span>` : '';
    const media = dish.img
        ? `<button class="dish-media" type="button" data-open="${dish.id}" aria-label="${escapeHtml(t('viewPhoto')(dish.name))}">
                <img src="${thumb(dish.img)}" alt="" loading="lazy" decoding="async" width="540" height="720">
                ${dish.video ? `<span class="badge badge-video"><svg class="icon" aria-hidden="true"><use href="#i-play"/></svg>${t('video')}</span>` : ''}
                ${popular}
           </button>`
        : `<div class="dish-media is-empty">
                <svg class="placeholder-art" aria-hidden="true"><use href="#i-pumpkin"/></svg>
                <span>${t('photoSoon')}</span>
                ${popular}
           </div>`;

    return `<article class="dish" data-id="${dish.id}">
        ${media}
        <div class="dish-body">
            <h3>${escapeHtml(dish.name)}${dish.popular ? ` <span class="badge-inline">${t('favorite')}</span>` : ''}</h3>
            ${addButtonHtml(dish)}
        </div>
    </article>`;
}

function renderMenu() {
    $('#menu-sections').innerHTML = CATEGORIES.map(cat => `
        <section class="menu-section" data-cat="${cat.id}" aria-labelledby="h-${cat.id}">
            <div class="section-head">
                <h2 id="h-${cat.id}">${cat.name}</h2>
                <p>${cat.en}</p>
            </div>
            <div class="grid">
                ${MENU.filter(d => d.cat === cat.id).map(dishHtml).join('')}
            </div>
        </section>`).join('');
}

function renderChips() {
    const chips = [{ id: 'all', name: t('all') }, ...CATEGORIES];
    $('#chips').innerHTML = chips.map(c => `
        <button class="chip" type="button" data-cat="${c.id}" aria-pressed="${state.category === c.id}">${c.name}</button>`).join('');
}

function renderEvents() {
    $('#events-strip').innerHTML = EVENTS.map(ev => `
        <button class="event-card" type="button" data-open="${ev.id}" aria-label="${escapeHtml(t('viewPhoto')(ev[state.lang]))}">
            <img src="${thumb(ev.img)}" alt="" loading="lazy" decoding="async" width="540" height="720">
        </button>`).join('');
}

/* ---------- grid / list view ---------- */
function setView(view) {
    state.view = view;
    storageSet(VIEW_KEY, view);
    $('#menu-sections').classList.toggle('is-list', view === 'list');
    document.querySelectorAll('.view-btn').forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.view === view));
}

/* ---------- search + filter ---------- */
function visibleDishes() {
    const q = normalize(state.query.trim());
    return MENU.filter(d => {
        if (state.category !== 'all' && d.cat !== state.category) return false;
        if (!q) return true;
        const cat = catById.get(d.cat);
        return [d.name, cat.name, cat.en].some(text => normalize(text).includes(q));
    });
}

function applyFilters() {
    const visible = new Set(visibleDishes().map(d => d.id));

    document.querySelectorAll('.dish').forEach(el => {
        el.hidden = !visible.has(el.dataset.id);
    });
    document.querySelectorAll('.menu-section').forEach(sec => {
        sec.hidden = !sec.querySelector('.dish:not([hidden])');
    });
    document.querySelectorAll('.chip').forEach(chip => {
        chip.setAttribute('aria-pressed', chip.dataset.cat === state.category);
    });

    const count = visible.size;
    $('#result-count').textContent = t('showing')(count);
    $('#empty').hidden = count > 0;
    $('#empty-text').innerHTML = t('emptyText')(escapeHtml(state.query.trim()));
}

/* ---------- party list ---------- */
function toggleDish(id) {
    const dish = byId.get(id);
    if (partyList.has(dish.name)) {
        partyList.delete(dish.name);
        toast(t('toastRemoved')(dish.name));
    } else {
        partyList.set(dish.name, '');
        toast(t('toastAdded')(dish.name));
        bumpFab();
    }
    saveList();
    refreshListUi();
}

function bumpFab() {
    const fab = $('#fab');
    fab.classList.remove('bump');
    void fab.offsetWidth; // restart the animation
    fab.classList.add('bump');
}

function pickedDishes() {
    return MENU.filter(d => partyList.has(d.name));
}

function pickedItemHtml(d) {
    const size = partyList.get(d.name);
    const options = [`<option value="">${t('sizeAny')}</option>`,
        ...TRAY_SIZES.map(s => `<option value="${s}"${s === size ? ' selected' : ''}>${t('sizes')[s]}</option>`)].join('');
    return `<li data-id="${d.id}">
        ${d.img ? `<img src="${thumb(d.img)}" alt="" loading="lazy">` : '<svg class="picked-art" aria-hidden="true"><use href="#i-pumpkin"/></svg>'}
        <span class="picked-name">${escapeHtml(d.name)}<small>${catById.get(d.cat).en}</small></span>
        <select class="size-select" data-size="${d.id}" aria-label="${escapeHtml(`${t('traySize')}: ${d.name}`)}">${options}</select>
        <button class="icon-btn" type="button" data-remove="${d.id}" aria-label="${escapeHtml(t('removeAria')(d.name))}">
            <svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>
        </button>
    </li>`;
}

// Re-render only the rows that changed, so focus in the list is kept
function renderPicked() {
    const list = $('#picked');
    const wanted = pickedDishes();
    const wantedIds = new Set(wanted.map(d => d.id));
    list.querySelectorAll('li').forEach(li => {
        if (!wantedIds.has(li.dataset.id) || li.dataset.lang !== state.lang) li.remove();
    });
    let prev = null;
    wanted.forEach(d => {
        let li = list.querySelector(`li[data-id="${d.id}"]`);
        if (!li) {
            const tpl = document.createElement('template');
            tpl.innerHTML = pickedItemHtml(d).trim();
            li = tpl.content.firstChild;
            li.dataset.lang = state.lang;
        }
        const anchor = prev ? prev.nextElementSibling : list.firstElementChild;
        if (li !== anchor) list.insertBefore(li, anchor);
        prev = li;
    });
}

function refreshListUi() {
    document.querySelectorAll('.dish [data-add]').forEach(updateAddButton);
    syncLightboxAdd();

    const count = partyList.size;
    $('#fab-count').textContent = count;
    $('#fab').classList.toggle('has-items', count > 0);
    $('#fab').setAttribute('aria-label', t('fabAria')(count));

    renderPicked();

    const empty = count === 0;
    $('#drawer-empty').hidden = !empty;
    $('#event-form').hidden = empty;
    $('#drawer').classList.toggle('is-empty', empty);
    updateWhatsappLink();
}

function buildMessage() {
    const dishes = pickedDishes().map(d => {
        const size = partyList.get(d.name);
        return `• ${d.name}${size ? ` (${t('msgTray')(t('sizes')[size])})` : ''}`;
    });
    const guests = $('#guests').value.trim();
    const date = $('#event-date').value;
    const notes = $('#notes').value.trim();

    const lines = [t('msgIntro'), '', t('msgDishes'), ...dishes];
    if (guests || date) lines.push('');
    if (guests) lines.push(`${t('msgGuests')}: ${guests}`);
    if (date) {
        const pretty = new Date(`${date}T12:00:00`).toLocaleDateString(t('locale'), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        lines.push(`${t('msgDate')}: ${pretty}`);
    }
    if (notes) lines.push('', `${t('msgNotes')}: ${notes}`);
    return lines.join('\n');
}

function updateWhatsappLink() {
    const link = $('#send-whatsapp');
    const hasItems = partyList.size > 0;
    link.href = `https://wa.me/${WHATSAPP_NUMBER}${hasItems ? `?text=${encodeURIComponent(buildMessage())}` : ''}`;
    link.setAttribute('aria-disabled', !hasItems);
}

async function copyList() {
    try {
        await navigator.clipboard.writeText(buildMessage());
        toast(t('toastCopied'));
    } catch {
        toast(t('toastCopyFail'));
    }
}

/* ---------- photo / video viewer ---------- */
let lbItems = [];
let lbIndex = -1;

function openLightbox(id) {
    const item = byId.get(id);
    lbItems = item.cat ? visibleDishes().filter(d => d.img) : EVENTS;
    lbIndex = lbItems.findIndex(d => d.id === id);
    showLightboxItem();
    if (!$('#lightbox').open) $('#lightbox').showModal();
}

function showLightboxItem() {
    const item = lbItems[lbIndex];
    const isDish = Boolean(item.cat);
    const title = isDish ? item.name : item[state.lang];
    const media = $('#lb-media');

    media.innerHTML = item.video
        ? `<video src="${item.video}" poster="${thumb(item.img)}" controls playsinline preload="metadata"></video>`
        : `<img src="${thumb(item.img)}" alt="${escapeHtml(title)}">`;

    // Start with the thumbnail, swap in the large photo once it has loaded
    if (!item.video) {
        const full = new Image();
        full.onload = () => {
            const img = media.querySelector('img');
            if (img && lbItems[lbIndex] === item) img.src = full.src;
        };
        full.src = fullPhoto(item.img);
    }

    const cat = isDish && catById.get(item.cat);
    $('#lb-title').textContent = title;
    $('#lb-cat').textContent = isDish ? `${cat.name} · ${cat.en}` : t('realEvent');
    $('#lb-add').hidden = !isDish;
    $('#lb-prev').hidden = $('#lb-next').hidden = lbItems.length < 2;
    syncLightboxAdd();
}

function syncLightboxAdd() {
    const item = lbItems[lbIndex];
    if (!item || !item.cat) return;
    const added = partyList.has(item.name);
    const btn = $('#lb-add');
    btn.classList.toggle('is-added', added);
    btn.setAttribute('aria-pressed', added);
    btn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${added ? 'check' : 'plus'}"/></svg>${added ? t('lbAdded') : t('lbAdd')}`;
}

function stepLightbox(dir) {
    if (lbItems.length < 2) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    showLightboxItem();
}

/* ---------- events ---------- */
function bindEvents() {
    $('#search').addEventListener('input', e => {
        state.query = e.target.value;
        applyFilters();
    });

    $('#clear-search').addEventListener('click', () => {
        state.query = '';
        state.category = 'all';
        $('#search').value = '';
        applyFilters();
        $('#search').focus();
    });

    $('#chips').addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        state.category = chip.dataset.cat;
        applyFilters();
        chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    document.addEventListener('click', e => {
        const add = e.target.closest('[data-add]');
        if (add) return toggleDish(add.dataset.add);

        const open = e.target.closest('[data-open]');
        if (open) return openLightbox(open.dataset.open);

        const remove = e.target.closest('[data-remove]');
        if (remove) {
            // Keep focus inside the drawer when the row disappears
            const li = remove.closest('li');
            const nextFocus = li.nextElementSibling || li.previousElementSibling;
            toggleDish(remove.dataset.remove);
            (nextFocus ? nextFocus.querySelector('[data-remove]') : $('#drawer [data-close]')).focus();
            return;
        }

        const close = e.target.closest('[data-close]');
        if (close) close.closest('dialog').close();
    });

    $('#picked').addEventListener('change', e => {
        const select = e.target.closest('[data-size]');
        if (!select) return;
        partyList.set(byId.get(select.dataset.size).name, select.value);
        saveList();
        updateWhatsappLink();
    });

    // Close dialogs when clicking the backdrop
    document.querySelectorAll('dialog').forEach(dialog => {
        dialog.addEventListener('click', e => {
            if (e.target === dialog) dialog.close();
        });
    });

    $('#lightbox').addEventListener('close', () => {
        $('#lb-media').innerHTML = ''; // stops any playing video
    });

    $('#lb-add').addEventListener('click', () => toggleDish(lbItems[lbIndex].id));
    $('#lb-prev').addEventListener('click', () => stepLightbox(-1));
    $('#lb-next').addEventListener('click', () => stepLightbox(1));
    $('#lightbox').addEventListener('keydown', e => {
        if (e.target.closest('video')) return; // let arrow keys seek the video
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
    });

    // Swipe left/right in the viewer on touch screens
    let touchX = null;
    $('#lightbox').addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    $('#lightbox').addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
        touchX = null;
    });

    $('#fab').addEventListener('click', () => $('#drawer').showModal());
    $('#event-form').addEventListener('input', updateWhatsappLink);
    $('#event-form').addEventListener('submit', e => e.preventDefault());
    $('#copy-list').addEventListener('click', copyList);
    $('#send-whatsapp').addEventListener('click', e => {
        if (partyList.size === 0) {
            e.preventDefault();
            toast(t('toastAddFirst'));
        }
    });
    $('#clear-list').addEventListener('click', () => {
        if (partyList.size === 0) return;
        partyList.clear();
        saveList();
        refreshListUi();
        toast(t('toastCleared'));
        $('#drawer [data-close]').focus();
    });
}

/* ---------- init ---------- */
const today = new Date();
$('#event-date').min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
$('#year').textContent = today.getFullYear();

applyStaticText();
renderChips();
renderEvents();
renderMenu();
setView(state.view);
applyFilters();
refreshListUi();
bindEvents();
