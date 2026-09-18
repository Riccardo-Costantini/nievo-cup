/*!
 * Nievo Cup - Consent Mode v2: default DENIED
 * Caricato SENZA "defer" e per primo in <head>, come raccomandato da Google,
 * cosi' il consenso di default e' impostato prima di qualsiasi altro script.
 * Centralizza il blocco che prima era duplicato manualmente in ogni pagina.
 */
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
window.__nievoConsentDefaultSet = true;