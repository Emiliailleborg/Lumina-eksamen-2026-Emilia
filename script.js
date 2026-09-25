/* Back-knap: fører tilbage til index.html */
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    // Bruger location.href så der bliver loadet index.html
    window.location.href = 'index.html';
  });
}

// Vis toast når et "Køb nu" trykkes
function showCartToast(message = 'Produktet er tilføjet til indkøbskurven') {
  // Hvis allerede en toast, fjern den først (så vi kan re-animate)
  const existing = document.querySelector('.cart-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger ind/ud animation via CSS (tilføj class for synlig)
  requestAnimationFrame(() => toast.classList.add('visible'));

  // Fjern efter 3 sekunder
  setTimeout(() => {
    toast.classList.remove('visible');
    // fjern fra DOM efter overgang
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

// Bind handler til alle buy-knapper (incl. dem med varianter)
function initBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-button');
  buyButtons.forEach(btn => {
    // Ignorer hvis allerede bundet
    if (btn.dataset.buyHandlerBound) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showCartToast();
     
    });
    btn.dataset.buyHandlerBound = '1';
  });
}

// Init ved load + re-init hvis DOM senere ændres
document.addEventListener('DOMContentLoaded', initBuyButtons);
// Hvis du dynamisk indsætter produkter kan du køre initBuyButtons() igen efter indsættelse

// SØGEFUNKTION

const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchCount = document.getElementById('search-count');
const searchClose = document.getElementById('search-close');

let searchHits = [];  // alle markerede fund på siden
let currentHit = -1;  // det fund der er valgt lige nu

// Fjern markeringer fra sidste søgning
function clearSearch() {
  document.querySelectorAll('mark.search-hit').forEach(mark => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
  document.body.normalize(); // samler tekststykkerne igen
  searchHits = [];
  currentHit = -1;
  searchCount.textContent = '';
}

// Find alle steder på siden hvor ordet står, og marker dem
function highlightMatches(term) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      // Søg ikke i scripts, styles eller selve søgefeltet
      if (!parent || parent.closest('script, style, .search-bar')) return NodeFilter.FILTER_REJECT;
      return node.textContent.toLowerCase().includes(term) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const text = node.textContent;
    const lower = text.toLowerCase();
    const fragment = document.createDocumentFragment();
    let start = 0;
    let index = lower.indexOf(term);

    while (index !== -1) {
      fragment.append(text.slice(start, index));
      const mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = text.slice(index, index + term.length);
      fragment.append(mark);
      searchHits.push(mark);
      start = index + term.length;
      index = lower.indexOf(term, start);
    }

    fragment.append(text.slice(start));
    node.replaceWith(fragment);
  });
}

// Scroll hen til et fund og vis "2 af 5"
function goToHit(index) {
  if (searchHits.length === 0) return;
  if (currentHit !== -1) searchHits[currentHit].classList.remove('current');

  // Start forfra når man når det sidste fund
  currentHit = (index + searchHits.length) % searchHits.length;
  const hit = searchHits[currentHit];
  hit.classList.add('current');
  hit.scrollIntoView({ behavior: 'smooth', block: 'center' });
  searchCount.textContent = `${currentHit + 1} af ${searchHits.length}`;
}

function runSearch() {
  clearSearch();
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) return; // vent til der er skrevet mindst 2 tegn

  highlightMatches(term);
  if (searchHits.length === 0) {
    searchCount.textContent = 'Ingen resultater';
    return;
  }
  goToHit(0);
}

function openSearch() {
  searchBar.hidden = false;
  searchInput.focus();
}

function closeSearch() {
  clearSearch();
  searchInput.value = '';
  searchBar.hidden = true;
}

// Søgefeltet findes kun på forsiden
if (searchToggle && searchBar) {
  searchToggle.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  });

  searchInput.addEventListener('input', runSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter = næste fund, Shift + Enter = forrige fund
      goToHit(e.shiftKey ? currentHit - 1 : currentHit + 1);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  searchClose.addEventListener('click', closeSearch);
}

// FARVEVÆLGER

const productImage = document.getElementById('product-image');
const productColor = document.getElementById('product-color');
const colorSwatches = document.querySelectorAll('.color-swatch');

colorSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    // Kun den valgte cirkel ser trykket ind
    colorSwatches.forEach(s => s.setAttribute('aria-pressed', 'false'));
    swatch.setAttribute('aria-pressed', 'true');

    // Skift farvenavn og billede
    productColor.textContent = `Farve- ${swatch.dataset.color}`;
    productImage.src = swatch.dataset.image;
    productImage.alt = swatch.dataset.alt;
    // Skalering så alle højttalere ser lige store ud
    productImage.style.setProperty('--speaker-scale', swatch.dataset.scale || 1);
  });
});

// PRODUKTINFORMATION: FOLD UD

// Giv boksen plads til den udfoldede tekst fra start,
// så sektionen ikke bliver højere når man folder ud
const infoBox = document.querySelector('.info-content');
const infoMore = document.querySelector('.info-more');

function reserveInfoSpace() {
  if (!infoBox || !infoMore) return;

  const wasOpen = infoMore.open;
  infoBox.style.minHeight = '';  // nulstil så vi måler den rigtige højde
  infoMore.open = true;          // fold ud et øjeblik og mål
  const openHeight = infoBox.offsetHeight;
  infoMore.open = wasOpen;       // tilbage som før

  infoBox.style.minHeight = `${openHeight}px`;
}

// Mål igen når billeder og skrifttyper er indlæst, og når vinduet ændrer størrelse
window.addEventListener('load', reserveInfoSpace);
window.addEventListener('resize', reserveInfoSpace);
reserveInfoSpace();

// KURV

const CART_KEY = 'lumina-cart';  // navnet kurven gemmes under i browseren
const PRICE = 1995;              // pris pr. højttaler i DKK

const cartToggle = document.getElementById('cart-toggle');
const cartPopup = document.getElementById('cart-popup');
const productBuyButton = document.querySelector('.product-buy');

// Hent kurven fra browseren, så den huskes når man skifter side
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Hvis browseren ikke må gemme, virker kurven stadig indtil siden genindlæses
  }
}

let cart = loadCart();

// Læg den valgte farve i kurven (samme farve igen = antal +1)
function addToCart() {
  const selected = document.querySelector('.color-swatch[aria-pressed="true"]');
  if (!selected) return;

  const color = selected.dataset.color;
  const existing = cart.find(item => item.color === color);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ color, image: selected.dataset.image, quantity: 1 });
  }

  saveCart();
  updateCartCount();
  renderCart();
}

function removeFromCart(color) {
  cart = cart.filter(item => item.color !== color);
  saveCart();
  updateCartCount();
  renderCart();
}

// Vis antal i menuen, fx "Kurv (2)"
function updateCartCount() {
  if (!cartToggle) return;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartToggle.textContent = count > 0 ? `Kurv (${count})` : 'Kurv';
}

// Byg indholdet i kurv-kortet
function renderCart() {
  if (!cartPopup) return;

  if (cart.length === 0) {
    cartPopup.innerHTML = '<p class="cart-empty">Din kurv er tom</p>';
    return;
  }

  const items = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="Lumina Bloom i ${item.color}">
      <div class="cart-item-info">
        <p class="cart-item-title">Lumina Bloom</p>
        <p>Farve: ${item.color}</p>
        <p>Antal: ${item.quantity}</p>
      </div>
      <div class="cart-item-side">
        <p class="cart-item-price">${PRICE * item.quantity} DKK</p>
        <button type="button" class="cart-remove" data-color="${item.color}">Fjern</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + PRICE * item.quantity, 0);

  cartPopup.innerHTML = `
    ${items}
    <div class="cart-total">
      <span>I alt</span>
      <span>${total} DKK</span>
    </div>
  `;
}

function setCartOpen(open) {
  cartPopup.hidden = !open;
  cartToggle.setAttribute('aria-expanded', open);
  if (open) renderCart();
}

// Køb nu lægger højttaleren i kurven (beskeden vises af initBuyButtons)
if (productBuyButton) {
  productBuyButton.addEventListener('click', addToCart);
}

if (cartToggle && cartPopup) {
  updateCartCount();

  cartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCartOpen(cartPopup.hidden);
  });

  // Klik inde i kortet lukker det ikke - kun "Fjern" gør noget
  cartPopup.addEventListener('click', (e) => {
    e.stopPropagation();
    const removeButton = e.target.closest('.cart-remove');
    if (removeButton) removeFromCart(removeButton.dataset.color);
  });

  // Luk kortet ved klik udenfor eller Esc
  document.addEventListener('click', () => setCartOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setCartOpen(false);
  });
}
