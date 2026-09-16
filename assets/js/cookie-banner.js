/*!
 * Nievo Cup — Cookie Banner + Google Consent Mode v2
 * File: assets/js/cookie-banner.js
 * Zero dipendenze, vanilla JS. Inietta HTML/CSS a runtime.
 * -------------------------------------------------------------
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'nievo_cookie_consent';
  var GA_ID = 'G-LNX14N1XMB';

  var COLORS = {
    bg: '#0b0f17',
    bgCard: 'rgba(8, 12, 22, 0.97)',
    border: 'rgba(254, 218, 0, 0.25)',
    text: '#e2e8f0',
    textDim: '#94a3b8',
    accent: '#feda00'
  };

  /* ============================================================
   * 1. GOOGLE CONSENT MODE V2 — bootstrap
   * ========================================================== */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Imposta i default "denied" il prima possibile (rete di sicurezza:
  // idealmente questo blocco va duplicato anche direttamente nell'<head>,
  // vedi istruzioni in fondo al file).
  if (!window.__nievoConsentDefaultSet) {
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    window.__nievoConsentDefaultSet = true;
  }

  var gaLoaded = false;
  function loadGA4() {
    if (gaLoaded) return;
    gaLoaded = true;
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
    }
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function applyConsent(consent) {
    gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (consent.analytics) loadGA4();
  }

  /* ============================================================
   * 2. PERSISTENZA
   * ========================================================== */
  function getSavedConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      var payload = {
        analytics: !!consent.analytics,
        necessary: true,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
      return payload;
    } catch (e) {
      return consent;
    }
  }

  /* ============================================================
   * 3. STILI (iniettati dinamicamente)
   * ========================================================== */
  function injectStyles() {
    if (document.getElementById('nievo-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'nievo-cookie-styles';
    style.textContent =
      '#nievo-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:99999;' +
      'font-family:"Rajdhani","Rubik",Arial,sans-serif;background:' + COLORS.bgCard + ';' +
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      'border-top:1px solid ' + COLORS.border + ';box-shadow:0 -8px 30px rgba(0,0,0,.5);' +
      'transform:translateY(110%);transition:transform .45s ease;padding:1.1rem 1.25rem;}' +
      '#nievo-cookie-banner.nievo-visible{transform:translateY(0);}' +
      '#nievo-cookie-banner .nievo-inner{max-width:1100px;margin:0 auto;display:flex;' +
      'flex-wrap:wrap;align-items:center;gap:1rem 1.5rem;}' +
      '#nievo-cookie-banner .nievo-text{flex:1 1 320px;color:' + COLORS.text + ';' +
      'font-size:.98rem;line-height:1.45;font-weight:500;}' +
      '#nievo-cookie-banner .nievo-text strong{color:' + COLORS.accent + ';font-weight:700;}' +
      '#nievo-cookie-banner .nievo-text a{color:' + COLORS.accent + ';text-decoration:underline;' +
      'text-underline-offset:2px;}' +
      '#nievo-cookie-banner .nievo-actions{display:flex;flex-wrap:wrap;gap:.6rem;' +
      'flex:0 0 auto;align-items:center;}' +
      '#nievo-cookie-banner button{font-family:inherit;font-size:.85rem;font-weight:700;' +
      'letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:999px;' +
      'padding:.65rem 1.4rem;transition:all .2s ease;white-space:nowrap;}' +
      '#nievo-cookie-banner .nievo-btn-accept{background:' + COLORS.accent + ';color:' + COLORS.bg + ';border:2px solid ' + COLORS.accent + ';}' +
      '#nievo-cookie-banner .nievo-btn-accept:hover{filter:brightness(1.08);transform:translateY(-2px);}' +
      '#nievo-cookie-banner .nievo-btn-necessary{background:transparent;color:' + COLORS.text + ';border:2px solid rgba(226,232,240,.35);}' +
      '#nievo-cookie-banner .nievo-btn-necessary:hover{border-color:' + COLORS.accent + ';color:' + COLORS.accent + ';}' +
      '#nievo-cookie-banner .nievo-btn-customize{background:transparent;color:' + COLORS.accent + ';border:2px solid transparent;' +
      'text-decoration:underline;text-underline-offset:3px;padding:.65rem .4rem;}' +
      '#nievo-cookie-banner .nievo-btn-customize:hover{color:#fff;}' +
      '#nievo-cookie-panel{max-width:1100px;margin:1rem auto 0 auto;display:none;' +
      'border-top:1px solid ' + COLORS.border + ';padding-top:1rem;}' +
      '#nievo-cookie-panel.nievo-open{display:block;}' +
      '#nievo-cookie-panel .nievo-row{display:flex;align-items:flex-start;justify-content:space-between;' +
      'gap:1rem;padding:.7rem 0;border-bottom:1px solid rgba(255,255,255,.06);}' +
      '#nievo-cookie-panel .nievo-row-title{color:' + COLORS.text + ';font-weight:700;font-size:.92rem;' +
      'text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem;}' +
      '#nievo-cookie-panel .nievo-row-desc{color:' + COLORS.textDim + ';font-size:.85rem;line-height:1.4;max-width:640px;}' +
      '#nievo-cookie-panel .nievo-switch{position:relative;width:46px;height:26px;flex:0 0 auto;margin-top:.2rem;}' +
      '#nievo-cookie-panel .nievo-switch input{opacity:0;width:0;height:0;}' +
      '#nievo-cookie-panel .nievo-slider{position:absolute;inset:0;background:rgba(255,255,255,.15);' +
      'border-radius:999px;cursor:pointer;transition:.2s;}' +
      '#nievo-cookie-panel .nievo-slider:before{content:"";position:absolute;height:20px;width:20px;left:3px;top:3px;' +
      'background:#fff;border-radius:50%;transition:.2s;}' +
      '#nievo-cookie-panel input:checked + .nievo-slider{background:' + COLORS.accent + ';}' +
      '#nievo-cookie-panel input:checked + .nievo-slider:before{transform:translateX(20px);}' +
      '#nievo-cookie-panel input:disabled + .nievo-slider{opacity:.45;cursor:not-allowed;}' +
      '#nievo-cookie-panel .nievo-save-row{display:flex;justify-content:flex-end;margin-top:.9rem;}' +
      '#nievo-cookie-panel .nievo-btn-save{background:' + COLORS.accent + ';color:' + COLORS.bg + ';' +
      'border:2px solid ' + COLORS.accent + ';font-family:inherit;font-weight:700;font-size:.85rem;' +
      'letter-spacing:.06em;text-transform:uppercase;padding:.6rem 1.4rem;border-radius:999px;cursor:pointer;}' +
      '@media (max-width:700px){#nievo-cookie-banner .nievo-inner{flex-direction:column;align-items:stretch;}' +
      '#nievo-cookie-banner .nievo-actions{flex-direction:column;align-items:stretch;}' +
      '#nievo-cookie-banner button{width:100%;text-align:center;}}';
    document.head.appendChild(style);
  }

  /* ============================================================
   * 4. HTML DEL BANNER
   * ========================================================== */
  function buildBannerHTML(savedAnalytics) {
    var checked = savedAnalytics ? 'checked' : '';
    return (
      '<div class="nievo-inner">' +
        '<div class="nievo-text">' +
          '<strong>Usiamo i cookie.</strong> Utilizziamo cookie tecnici necessari al funzionamento del sito e, previo tuo consenso, cookie analitici per capire come viene usata la Nievo Cup. ' +
          'Consulta la <a href="privacy-policy.html">Privacy Policy</a> e la <a href="cookie-policy.html">Cookie Policy</a>.' +
        '</div>' +
        '<div class="nievo-actions">' +
          '<button type="button" class="nievo-btn-customize" id="nievo-btn-customize">Personalizza</button>' +
          '<button type="button" class="nievo-btn-necessary" id="nievo-btn-necessary">Solo necessari</button>' +
          '<button type="button" class="nievo-btn-accept" id="nievo-btn-accept">Accetta tutti</button>' +
        '</div>' +
      '</div>' +
      '<div id="nievo-cookie-panel">' +
        '<div class="nievo-row">' +
          '<div>' +
            '<div class="nievo-row-title">Cookie necessari</div>' +
            '<div class="nievo-row-desc">Indispensabili al funzionamento del sito (es. salvataggio delle preferenze). Non possono essere disattivati.</div>' +
          '</div>' +
          '<label class="nievo-switch">' +
            '<input type="checkbox" checked disabled>' +
            '<span class="nievo-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="nievo-row">' +
          '<div>' +
            '<div class="nievo-row-title">Cookie analitici</div>' +
            '<div class="nievo-row-desc">Ci aiutano a capire come i visitatori usano il sito (Google Analytics 4). Attivi solo con il tuo consenso.</div>' +
          '</div>' +
          '<label class="nievo-switch">' +
            '<input type="checkbox" id="nievo-analytics-toggle" ' + checked + '>' +
            '<span class="nievo-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="nievo-save-row">' +
          '<button type="button" class="nievo-btn-save" id="nievo-btn-save">Salva preferenze</button>' +
        '</div>' +
      '</div>'
    );
  }

  var bannerEl = null;

  function ensureBanner() {
    if (bannerEl) return bannerEl;
    injectStyles();
    bannerEl = document.createElement('div');
    bannerEl.id = 'nievo-cookie-banner';
    document.body.appendChild(bannerEl);
    return bannerEl;
  }

  function renderBanner(savedAnalytics) {
    var el = ensureBanner();
    el.innerHTML = buildBannerHTML(savedAnalytics);
    wireEvents();
  }

  function showBanner() {
    var el = ensureBanner();
    requestAnimationFrame(function () {
      el.classList.add('nievo-visible');
    });
  }

  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove('nievo-visible');
  }

  function togglePanel() {
    var panel = document.getElementById('nievo-cookie-panel');
    if (panel) panel.classList.toggle('nievo-open');
  }

  function wireEvents() {
    var btnAccept = document.getElementById('nievo-btn-accept');
    var btnNecessary = document.getElementById('nievo-btn-necessary');
    var btnCustomize = document.getElementById('nievo-btn-customize');
    var btnSave = document.getElementById('nievo-btn-save');

    if (btnAccept) btnAccept.addEventListener('click', function () {
      var consent = saveConsent({ analytics: true });
      applyConsent(consent);
      hideBanner();
    });

    if (btnNecessary) btnNecessary.addEventListener('click', function () {
      var consent = saveConsent({ analytics: false });
      applyConsent(consent);
      hideBanner();
    });

    if (btnCustomize) btnCustomize.addEventListener('click', togglePanel);

    if (btnSave) btnSave.addEventListener('click', function () {
      var toggle = document.getElementById('nievo-analytics-toggle');
      var consent = saveConsent({ analytics: !!(toggle && toggle.checked) });
      applyConsent(consent);
      hideBanner();
    });
  }

  /* ============================================================
   * 5. API GLOBALE PER RIAPRIRE LE PREFERENZE
   * ========================================================== */
  window.openCookieSettings = function () {
    var saved = getSavedConsent();
    renderBanner(saved ? saved.analytics : false);
    var panel = document.getElementById('nievo-cookie-panel');
    if (panel) panel.classList.add('nievo-open');
    showBanner();
  };

  /* ============================================================
   * 6. AVVIO
   * ========================================================== */
  function init() {
    var saved = getSavedConsent();

    if (saved) {
      // Scelta già salvata: applica il consenso, non mostrare il banner.
      applyConsent(saved);
      return;
    }

    renderBanner(false);
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();