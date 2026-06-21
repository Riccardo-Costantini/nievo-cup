class NavbarComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="header">
        <div class="logo">
          <a href="index.html">
            <img src="assets/images/loghi/logo_nievo_white.png" alt="Logo Nievo Cup">
          </a>
        </div>
        <div class="menu">
          <div class="voce"><a href="partite.html"><p>Partite</p></a></div>
          <div class="voce"><a href="gironi.html"><p>Gironi</p></a></div>
          <div class="voce"><a href="tabellone.html"><p>Tabellone</p></a></div>
          <div class="voce"><a href="squadre.html"><p>Squadre</p></a></div>
        </div>
      </div>
    `;
  }
}

customElements.define('custom-navbar', NavbarComponent);