/*!
 * Nievo Cup - Cookie Banner + Google Consent Mode v2
 * GA4 e Vercel Insights vengono caricati solo dopo consenso analytics.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'nievo_cookie_consent';
  var GA_ID = 'G-LNX14N1XMB';
  var VERCEL_INSIGHTS_SRC = '/_vercel/insights/script.js';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

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
  var vercelLoaded = false;
  var bannerEl = null;
  var previousFocus = null;

  function loadGA4() {
    if (gaLoaded) return;
    gaLoaded = true;
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
      document.head.appendChild(s);
    }
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function loadVercelInsights() {
    if (vercelLoaded) return;
    vercelLoaded = true;
    if (document.querySelector('script[data-nievo-vercel-insights="true"]')) return;
    var script = document.createElement('script');
    script.defer = true;
    script.src = VERCEL_INSIGHTS_SRC;
    script.setAttribute('data-nievo-vercel-insights', 'true');
    document.head.appendChild(script);
  }

  function applyConsent(consent) {
    var analytics = !!(consent && consent.analytics);
    gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (analytics) {
      loadGA4();
      loadVercelInsights();
    }
  }

  function getSavedConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    var payload = {
      necessary: true,
      analytics: !!(consent && consent.analytics),
      timestamp: new Date().toISOString(),
      version: 2
    };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(payload)); } catch (e) {}
    return payload;
  }

  function injectStyles() {
    if (document.getElementById('nievo-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'nievo-cookie-styles';
    style.textContent =
      '#nievo-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:99999;font-family:"Rajdhani","Rubik",Arial,sans-serif;background:rgba(8,12,22,.97);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid rgba(254,218,0,.25);box-shadow:0 -8px 30px rgba(0,0,0,.5);transform:translateY(110%);transition:transform .35s ease;padding:1.1rem 1.25rem;}' +
      '#nievo-cookie-banner.nievo-visible{transform:translateY(0);}' +
      '#nievo-cookie-banner .nievo-inner{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.5rem;}' +
      '#nievo-cookie-banner .nievo-text{flex:1 1 320px;color:#e2e8f0;font-size:.98rem;line-height:1.45;font-weight:500;}' +
      '#nievo-cookie-banner .nievo-text strong{color:#feda00;font-weight:700;}' +
      '#nievo-cookie-banner .nievo-text a{color:#feda00;text-decoration:underline;text-underline-offset:2px;}' +
      '#nievo-cookie-banner .nievo-actions{display:flex;flex-wrap:wrap;gap:.6rem;flex:0 0 auto;align-items:center;}' +
      '#nievo-cookie-banner button{font-family:inherit;font-size:.85rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:999px;padding:.65rem 1.4rem;transition:all .2s ease;white-space:nowrap;}' +
      '#nievo-cookie-banner button:focus-visible,#nievo-cookie-banner a:focus-visible{outline:3px solid #fff;outline-offset:3px;}' +
      '#nievo-cookie-banner .nievo-btn-accept{background:#feda00;color:#0b0f17;border:2px solid #feda00;}' +
      '#nievo-cookie-banner .nievo-btn-necessary{background:transparent;color:#e2e8f0;border:2px solid rgba(226,232,240,.35);}' +
      '#nievo-cookie-banner .nievo-btn-customize{background:transparent;color:#feda00;border:2px solid transparent;text-decoration:underline;text-underline-offset:3px;padding:.65rem .4rem;}' +
      '#nievo-cookie-panel{max-width:1100px;margin:1rem auto 0 auto;display:none;border-top:1px solid rgba(254,218,0,.25);padding-top:1rem;}' +
      '#nievo-cookie-panel.nievo-open{display:block;}' +
      '#nievo-cookie-panel .nievo-row{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.7rem 0;border-bottom:1px solid rgba(255,255,255,.06);}' +
      '#nievo-cookie-panel .nievo-row-title{color:#e2e8f0;font-weight:700;font-size:.92rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem;}' +
      '#nievo-cookie-panel .nievo-row-desc{color:#94a3b8;font-size:.85rem;line-height:1.4;max-width:640px;}' +
      '#nievo-cookie-panel .nievo-switch{position:relative;width:46px;height:26px;flex:0 0 auto;margin-top:.2rem;}' +
      '#nievo-cookie-panel .nievo-switch input{opacity:0;width:0;height:0;}' +
      '#nievo-cookie-panel .nievo-slider{position:absolute;inset:0;background:rgba(255,255,255,.15);border-radius:999px;cursor:pointer;transition:.2s;}' +
      '#nievo-cookie-panel .nievo-slider:before{content:"";position:absolute;height:20px;width:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s;}' +
      '#nievo-cookie-panel input:checked + .nievo-slider{background:#feda00;}' +
      '#nievo-cookie-panel input:checked + .nievo-slider:before{transform:translateX(20px);}' +
      '#nievo-cookie-panel input:disabled + .nievo-slider{opacity:.45;cursor:not-allowed;}' +
      '#nievo-cookie-panel .nievo-save-row{display:flex;justify-content:flex-end;margin-top:.9rem;}' +
      '#nievo-cookie-panel .nievo-btn-save{background:#feda00;color:#0b0f17;border:2px solid #feda00;}' +
      '@media (max-width:700px){#nievo-cookie-banner .nievo-inner{flex-direction:column;align-items:stretch;}#nievo-cookie-banner .nievo-actions{flex-direction:column;align-items:stretch;}#nievo-cookie-banner button{width:100%;text-align:center;}}';
    document.head.appendChild(style);
  }

  function buildBannerHTML(savedAnalytics) {
    var checked = savedAnalytics ? 'checked' : '';
    return '<div class="nievo-inner"><div class="nievo-text" id="nievo-cookie-description"><strong>Usiamo i cookie.</strong> Utilizziamo cookie tecnici necessari e, solo con il tuo consenso, strumenti analytics come Google Analytics 4 e Vercel Insights. Consulta la <a href="privacy-policy.html">Privacy Policy</a> e la <a href="cookie-policy.html">Cookie Policy</a>.</div><div class="nievo-actions"><button type="button" class="nievo-btn-customize" id="nievo-btn-customize" aria-expanded="false" aria-controls="nievo-cookie-panel">Personalizza</button><button type="button" class="nievo-btn-necessary" id="nievo-btn-necessary">Solo necessari</button><button type="button" class="nievo-btn-accept" id="nievo-btn-accept">Accetta tutti</button></div></div><div id="nievo-cookie-panel"><div class="nievo-row"><div><div class="nievo-row-title">Cookie necessari</div><div class="nievo-row-desc">Indispensabili al funzionamento del sito e al salvataggio delle preferenze. Non possono essere disattivati.</div></div><label class="nievo-switch" aria-label="Cookie necessari sempre attivi"><input type="checkbox" checked disabled><span class="nievo-slider"></span></label></div><div class="nievo-row"><div><div class="nievo-row-title">Cookie analytics</div><div class="nievo-row-desc">Google Analytics 4 e Vercel Insights, usati per statistiche aggregate. Partono solo dopo il tuo consenso.</div></div><label class="nievo-switch" aria-label="Abilita cookie analytics"><input type="checkbox" id="nievo-analytics-toggle" ' + checked + '><span class="nievo-slider"></span></label></div><div class="nievo-save-row"><button type="button" class="nievo-btn-save" id="nievo-btn-save">Salva preferenze</button></div></div>';
  }

  function ensureBanner() {
    if (bannerEl) return bannerEl;
    injectStyles();
    bannerEl = document.createElement('div');
    bannerEl.id = 'nievo-cookie-banner';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-modal', 'false');
    bannerEl.setAttribute('aria-describedby', 'nievo-cookie-description');
    document.body.appendChild(bannerEl);
    bannerEl.addEventListener('keydown', trapKeyboard);
    return bannerEl;
  }

  function focusableItems() {
    if (!bannerEl) return [];
    return Array.prototype.slice.call(bannerEl.querySelectorAll('a[href],button,input:not([disabled])')).filter(function (el) { return el.offsetParent !== null; });
  }

  function trapKeyboard(event) {
    if (event.key === 'Escape') {
      var consent = saveConsent({ analytics: false });
      applyConsent(consent);
      hideBanner();
      return;
    }
    if (event.key !== 'Tab') return;
    var items = focusableItems();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }

  function renderBanner(savedAnalytics) {
    var el = ensureBanner();
    el.innerHTML = buildBannerHTML(savedAnalytics);
    wireEvents();
  }

  function showBanner(openPanel) {
    var el = ensureBanner();
    previousFocus = document.activeElement;
    requestAnimationFrame(function () {
      el.classList.add('nievo-visible');
      var first = openPanel ? document.getElementById('nievo-analytics-toggle') : document.getElementById('nievo-btn-accept');
      if (first) first.focus({ preventScroll: true });
    });
  }

  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove('nievo-visible');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
  }

  function togglePanel(forceOpen) {
    var panel = document.getElementById('nievo-cookie-panel');
    var button = document.getElementById('nievo-btn-customize');
    if (!panel) return;
    var shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('nievo-open');
    panel.classList.toggle('nievo-open', shouldOpen);
    if (button) button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (shouldOpen) {
      var toggle = document.getElementById('nievo-analytics-toggle');
      if (toggle) toggle.focus({ preventScroll: true });
    }
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
    if (btnCustomize) btnCustomize.addEventListener('click', function () { togglePanel(); });
    if (btnSave) btnSave.addEventListener('click', function () {
      var toggle = document.getElementById('nievo-analytics-toggle');
      var consent = saveConsent({ analytics: !!(toggle && toggle.checked) });
      applyConsent(consent);
      hideBanner();
    });
  }

  window.openCookieSettings = function () {
    var saved = getSavedConsent();
    renderBanner(saved ? saved.analytics : false);
    togglePanel(true);
    showBanner(true);
  };

  function init() {
    var saved = getSavedConsent();
    if (saved) {
      applyConsent(saved);
      return;
    }
    renderBanner(false);
    showBanner(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();