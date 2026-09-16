
(function () {
  'use strict';

  var STYLE_ID = 'nievo-footer-styles';

  /* ------------------------------------------------------------
     LINK PAGINE LEGALI
     ------------------------------------------------------------ */
  var LINKS = {
    privacy: 'privacy-policy.html',
    cookie:  'cookie-policy.html',
    termini: 'termini-condizioni.html'
  };

  /* ------------------------------------------------------------
     ⚠️ PLACEHOLDER — SOSTITUIRE CON I LINK REALI
     ------------------------------------------------------------ */
  var SOCIAL = {
    instagram: 'https://www.instagram.com/nievocup',
    tiktok:    'https://www.tiktok.com/@nievo.cup'
  };

  /* ------------------------------------------------------------
     ⚠️ PLACEHOLDER — DATI FISCALI
     ------------------------------------------------------------ */
  var FISCAL = {
    cf:   '[C.F. DA INSERIRE]',
    piva: '[P.IVA DA INSERIRE]'
  };

  /* ------------------------------------------------------------
     ICONE SVG
     ------------------------------------------------------------ */
  var ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>' +
      '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>' +
      '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>' +
      '</svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 ' +
      '2.6 2.6 0 0 1-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 ' +
      '0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3' +
      's-1.88.09-3.24-1.48z"></path>' +
      '</svg>'
  };

  /* ------------------------------------------------------------
     STILI (iniettati una sola volta)
     ------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.nievo-footer{position:relative;z-index:5;margin-top:4rem;' +
      'background:linear-gradient(180deg,rgba(8,12,22,.72) 0%,rgba(8,12,22,.97) 100%);' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'border-top:1px solid rgba(254,218,0,.25);' +
      'font-family:"Rajdhani","Rubik",Arial,sans-serif;color:#cbd5e1;}' +

      '.nievo-footer .nf-inner{max-width:1400px;margin:0 auto;padding:2.6rem 1.5rem 1.4rem;' +
      'display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:2rem 2.5rem;align-items:start;}' +

      /* brand */
      '.nievo-footer .nf-brand-name{font-family:"Bebas Neue",sans-serif;font-size:2rem;' +
      'letter-spacing:.08em;color:#fff;line-height:1;margin-bottom:.35rem;}' +
      '.nievo-footer .nf-brand-name span{color:#feda00;}' +
      '.nievo-footer .nf-tag{font-size:.8rem;font-weight:600;letter-spacing:.18em;' +
      'text-transform:uppercase;color:#feda00;margin:0 0 1rem;}' +
      '.nievo-footer .nf-fiscal{font-size:.82rem;line-height:1.9;color:#94a3b8;margin:0;}' +
      '.nievo-footer .nf-fiscal b{color:#e2e8f0;font-weight:700;letter-spacing:.05em;margin-right:.4rem;}' +
      '.nievo-footer .nf-fiscal span{color:#64748b;}' +

      /* titoli colonne */
      '.nievo-footer .nf-title{font-size:.7rem;font-weight:700;letter-spacing:.24em;' +
      'text-transform:uppercase;color:#feda00;margin-bottom:.9rem;}' +

      /* link legali */
      '.nievo-footer .nf-links{display:flex;flex-direction:column;gap:.55rem;}' +
      '.nievo-footer .nf-links a{color:#cbd5e1;text-decoration:none;font-size:.88rem;' +
      'font-weight:500;letter-spacing:.03em;transition:color .2s ease,transform .2s ease;' +
      'width:fit-content;}' +
      '.nievo-footer .nf-links a:hover{color:#feda00;transform:translateX(3px);}' +

      /* social */
      '.nievo-footer .nf-social-row{display:flex;gap:.7rem;flex-wrap:wrap;}' +
      '.nievo-footer .nf-social-btn{width:42px;height:42px;display:flex;align-items:center;' +
      'justify-content:center;border-radius:50%;border:1px solid rgba(226,232,240,.25);' +
      'background:rgba(255,255,255,.04);color:#e2e8f0;transition:all .22s ease;}' +
      '.nievo-footer .nf-social-btn svg{width:20px;height:20px;display:block;}' +
      '.nievo-footer .nf-social-btn:hover{border-color:#feda00;color:#feda00;' +
      'background:rgba(254,218,0,.1);transform:translateY(-3px);}' +

      /* bottom bar */
      '.nievo-footer .nf-bottom{max-width:1400px;margin:0 auto;padding:1rem 1.5rem 1.6rem;' +
      'border-top:1px solid rgba(255,255,255,.06);display:flex;flex-wrap:wrap;gap:.6rem 1.2rem;' +
      'align-items:center;justify-content:space-between;' +
      'font-size:.75rem;letter-spacing:.08em;color:#64748b;}' +
      '.nievo-footer .nf-cookie-btn{background:none;border:none;cursor:pointer;padding:0;' +
      'font-family:inherit;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;' +
      'font-weight:700;color:#94a3b8;text-decoration:underline;text-underline-offset:3px;' +
      'transition:color .2s ease;}' +
      '.nievo-footer .nf-cookie-btn:hover{color:#feda00;}' +

      /* responsive */
      '@media (max-width:900px){' +
      '.nievo-footer .nf-inner{grid-template-columns:1fr 1fr;gap:2rem;}}' +
      '@media (max-width:600px){' +
      '.nievo-footer{margin-top:3rem;}' +
      '.nievo-footer .nf-inner{grid-template-columns:1fr;gap:1.8rem;padding:2rem 1.2rem 1rem;}' +
      '.nievo-footer .nf-bottom{padding:1rem 1.2rem 1.4rem;justify-content:center;text-align:center;}' +
      '.nievo-footer .nf-brand-name{font-size:1.7rem;}}';

    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------
     TEMPLATE
     ------------------------------------------------------------ */
  function buildHTML() {
    return '' +
      '<div class="nf-inner">' +

        // /* colonna 1 — brand + dati fiscali */
        // '<div class="nf-col nf-brand">' +
        //   '<div class="nf-brand-name">NIEVO <span>CUP</span></div>' +
        //   '<p class="nf-tag">Verona Gioca Qui.</p>' +
        //   '<p class="nf-fiscal">' +
        //     '<b>C.F.</b><span>' + FISCAL.cf + '</span><br>' +
        //     '<b>P.IVA</b><span>' + FISCAL.piva + '</span>' +
        //   '</p>' +
        // '</div>' +

        /* colonna 2 — link legali */
        '<div class="nf-col">' +
          '<div class="nf-title">Informazioni</div>' +
          '<nav class="nf-links">' +
            '<a href="' + LINKS.privacy + '">Privacy Policy</a>' +
            '<a href="' + LINKS.cookie + '">Cookie Policy</a>' +
            '<a href="' + LINKS.termini + '">Termini e Condizioni</a>' +
          '</nav>' +
        '</div>' +

        /* colonna 3 — social */
        '<div class="nf-col">' +
          '<div class="nf-title">Seguici</div>' +
          '<div class="nf-social-row">' +
            '<a class="nf-social-btn" href="' + SOCIAL.instagram + '" ' +
              'target="_blank" rel="noopener noreferrer" aria-label="Instagram" ' +
              'title="Instagram">' + ICONS.instagram + '</a>' +
            '<a class="nf-social-btn" href="' + SOCIAL.tiktok + '" ' +
              'target="_blank" rel="noopener noreferrer" aria-label="TikTok" ' +
              'title="TikTok">' + ICONS.tiktok + '</a>' +
          '</div>' +
        '</div>' +

      '</div>' +

      /* bottom bar */
      '<div class="nf-bottom">' +
        '<span>© <span class="nf-year"></span> Nievo Cup · Tutti i diritti riservati</span>' +
        '<button type="button" class="nf-cookie-btn">Preferenze cookie</button>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     WEB COMPONENT
     ------------------------------------------------------------ */
  class FooterComponent extends HTMLElement {
  connectedCallback() {
    injectStyles();
    this.classList.add('nievo-footer');   // 👈 AGGIUNGI QUESTA RIGA
    this.innerHTML = buildHTML();

    /* anno dinamico */
    var yearEl = this.querySelector('.nf-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* riapre il pannello cookie */
    var btn = this.querySelector('.nf-cookie-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        if (typeof window.openCookieSettings === 'function') {
          window.openCookieSettings();
        }
      });
    }
  }
}

  if (!customElements.get('custom-footer')) {
    customElements.define('custom-footer', FooterComponent);
  }
})();