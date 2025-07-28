import type { Card } from "./game-app";

class HandView extends HTMLElement {
  hand: Card[] = [];
  selectedIds: Set<string> = new Set();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["hand"];
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === "hand") {
      this.hand = JSON.parse(newVal);
      this.selectedIds.clear();
      this.render();
    }
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedIds);
  }

  updateHandView() {
    // Sempre atualiza o atributo "hand" do componente hand-view, sem recriar ele!
    const handView = this.shadowRoot?.querySelector("hand-view");
    if (handView) {
      handView.setAttribute("hand", JSON.stringify(this.hand));
    }
  }

  clearSelection() {
    this.selectedIds.clear();
    this.render();
  }

  connectedCallback() {
    this.render();

    // Clique na carta para selecionar/deselecionar (delegação correta!)
    this.shadowRoot?.addEventListener("click", (e: Event) => {
      // Procura um ancestral com data-id
      let el = e.target as HTMLElement | null;
      while (
        el &&
        !el.hasAttribute("data-id") &&
        el !== this.shadowRoot?.host
      ) {
        el = el.parentElement;
      }
      const id = el?.getAttribute?.("data-id");
      if (id && this.hand.some((c) => c.id === id)) {
        if (this.selectedIds.has(id)) {
          this.selectedIds.delete(id);
        } else if (this.selectedIds.size < 5) {
          this.selectedIds.add(id);
        }
        this.render();
      }
    });
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Share+Tech+Mono&display=swap');
        .hand-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          margin-bottom: 12px;
        }
        .card {
          background: linear-gradient(135deg, #fcfdff 60%, #c7f3ff 100%);
          border-radius: 13px;
          border: 2.5px solid #e0f2fe;
          box-shadow: 0 4px 18px #b6e0f7bb;
          width: 74px;
          height: 108px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          position: relative;
          transition: transform 0.13s, box-shadow 0.19s, border-color 0.16s;
          font-family: 'Montserrat', sans-serif;
        }
        .card.selected {
          border: 3.5px solid #28a9e2;
          box-shadow: 0 0 0 4px #a8dfff77, 0 8px 40px #42d4e1a8;
          transform: scale(1.04) rotate(1.5deg);
        }
        .card:hover {
          transform: translateY(-7px) scale(1.06) rotate(-2deg);
          box-shadow: 0 8px 38px #5bb9fbb8;
          z-index: 2;
        }
        .value {
          font-size: 1.75rem;
          font-family: 'Share Tech Mono', monospace;
          margin-top: 7px;
          letter-spacing: 1.2px;
          font-weight: bold;
          text-align: left;
          width: 100%;
          padding-left: 8px;
          text-shadow: 0 1px 6px #e6f3fa90;
        }
        .suit {
          font-size: 2.7rem;
          text-align: center;
          margin: 0 auto;
          line-height: 1;
          font-family: 'Share Tech Mono', monospace;
          margin-bottom: 0.5em;
        }
        .card.red .value,
        .card.red .suit {
          color: #eb2f61;
          text-shadow: 0 1px 14px #ffd9e7a1;
        }
        .card.black .value,
        .card.black .suit {
          color: #2b3644;
          text-shadow: 0 1px 14px #aee3ffa8;
        }
        .card.club .suit {
          color: #35736d;
        }
        .card.spade .suit {
          color: #1c2542;
        }
        .corner {
          position: absolute;
          bottom: 6px;
          right: 10px;
          font-size: 1.08rem;
          opacity: 0.32;
          font-family: 'Share Tech Mono', monospace;
        }
        @media (max-width: 480px) {
          .card {
            width: 47px;
            height: 68px;
          }
          .value { font-size: 1rem; padding-left: 5px; }
          .suit { font-size: 1.4rem; }
          .corner { font-size: 0.7rem; }
        }
      </style>
      <div class="hand-cards">
        ${this.hand
          .map((c) => {
            const isRed = c.suit === "♥" || c.suit === "♦";
            let suitClass = "spade";
            if (c.suit === "♠") suitClass = "spade";
            else if (c.suit === "♣") suitClass = "club";
            else if (c.suit === "♥") suitClass = "heart";
            else if (c.suit === "♦") suitClass = "diamond";
            return `
            <div class="card ${isRed ? "red" : "black"} ${suitClass} ${
              this.selectedIds.has(c.id) ? "selected" : ""
            }" data-id="${c.id}">
              <div class="value">${c.value}</div>
              <div class="suit">${c.suit}</div>
              <div class="corner">${c.value}${c.suit}</div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
    this.updateHandView();
  }
}

customElements.define("hand-view", HandView);
