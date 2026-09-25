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
  });
});
