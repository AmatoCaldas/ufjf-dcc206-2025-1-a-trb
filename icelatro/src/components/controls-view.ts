class ControlsView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    setTimeout(() => {
      this.shadowRoot
        ?.querySelector("#play-btn")
        ?.addEventListener("click", () => {
          const root = this.getRootNode() as ShadowRoot;
          const gameApp = root.host as HTMLElement;
          const hand = gameApp.shadowRoot?.querySelector("hand-view") as any;
          if (!hand) return;
          const ids = hand.getSelectedIds();
          gameApp.shadowRoot?.dispatchEvent(
            new CustomEvent("play-cards", { detail: ids, bubbles: true })
          );
        });
      this.shadowRoot
        ?.querySelector("#discard-btn")
        ?.addEventListener("click", () => {
          const root = this.getRootNode() as ShadowRoot;
          const gameApp = root.host as HTMLElement;
          const hand = gameApp.shadowRoot?.querySelector("hand-view") as any;
          if (!hand) return;
          const ids = hand.getSelectedIds();
          gameApp.shadowRoot?.dispatchEvent(
            new CustomEvent("discard-cards", { detail: ids, bubbles: true })
          );
        });
    });
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        /* ... seu css bonito ... */
      </style>
      <div>
        <button id="play-btn">Jogar Selecionadas</button>
        <button id="discard-btn">Descartar Selecionadas</button>
      </div>
    `;
  }
}

customElements.define("controls-view", ControlsView);
