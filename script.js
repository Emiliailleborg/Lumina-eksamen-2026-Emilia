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
