import "./hand-view";
import "./controls-view";

export type Card = {
  value: string;
  suit: string;
  id: string;
};

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

function createDeck(): Card[] {
  const deck: Card[] = [];
  let uid = 0;
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ value, suit, id: `${value}${suit}-${uid++}` });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getCardNumber(value: string): number {
  if (["J", "Q", "K"].includes(value)) return 10;
  if (value === "A") return 15;
  return Number(value);
}

// Poker helper functions
function getCounts(cards: Card[]) {
  const counts: Record<string, number> = {};
  for (const c of cards) counts[c.value] = (counts[c.value] || 0) + 1;
  return counts;
}
function isPair(cards: Card[]) {
  const c = Object.values(getCounts(cards));
  return c.filter((v) => v === 2).length === 1;
}
function isTwoPair(cards: Card[]) {
  const c = Object.values(getCounts(cards));
  return c.filter((v) => v === 2).length === 2;
}
function isThreeOfAKind(cards: Card[]) {
  const c = Object.values(getCounts(cards));
  return c.some((v) => v === 3);
}
function isFullHouse(cards: Card[]) {
  const c = Object.values(getCounts(cards));
  return c.includes(3) && c.includes(2);
}
function isFlush(cards: Card[]) {
  if (cards.length < 5) return false;
  return cards.every((card) => card.suit === cards[0].suit);
}
function isFourOfAKind(cards: Card[]) {
  const c = Object.values(getCounts(cards));
  return c.some((v) => v === 4);
}

function getCombinationRarity(cards: Card[]): number {
  if (isFourOfAKind(cards)) return 8;
  if (isFullHouse(cards)) return 6;
  if (isFlush(cards)) return 5;
  if (isThreeOfAKind(cards)) return 4;
  if (isTwoPair(cards)) return 3;
  if (isPair(cards)) return 2;
  return 1;
}

function calculatePoints(cards: Card[]): number {
  const rarity = getCombinationRarity(cards);
  const sum = cards.reduce((acc, c) => acc + getCardNumber(c.value), 0);
  return sum * rarity;
}

class GameApp extends HTMLElement {
  private deck: Card[] = [];
  private hand: Card[] = [];
  private score: number = 0;
  private pointsGoal: number = 100;
  private round: number = 1;
  private handsLeft: number = 4;
  private discardsLeft: number = 3;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.startGame();
  }

  startGame() {
    this.score = 0;
    this.round = 1;
    this.pointsGoal = 100;
    this.handsLeft = 4;
    this.discardsLeft = 3;
    this.deck = createDeck();
    this.hand = [];
    this.dealHand();
    this.render();
    this.updateHandView();
  }

  dealHand() {
    while (this.hand.length < 8 && this.deck.length > 0) {
      this.hand.push(this.deck.pop()!);
    }
    this.updateHandView();
  }

  playCards(selectedIds: string[]) {
    if (selectedIds.length === 0 || selectedIds.length > 5) return;
    const selected = this.hand.filter((carta) =>
      selectedIds.includes(carta.id)
    );
    this.hand = this.hand.filter((carta) => !selectedIds.includes(carta.id));
    const points = calculatePoints(selected);
    this.score += points;
    this.handsLeft--;
    if (this.handsLeft === 0 || this.score >= this.pointsGoal) {
      this.render();
      this.updateHandView();
      setTimeout(() => this.finishRound(), 500);
    } else {
      this.dealHand();
      this.render();
      this.updateHandView();
    }
  }

  discardCards(selectedIds: string[]) {
    if (selectedIds.length === 0 || selectedIds.length > 5) return;
    if (this.discardsLeft === 0) return;
    this.hand = this.hand.filter((carta) => !selectedIds.includes(carta.id));
    this.discardsLeft--;
    this.dealHand();
    this.render();
    this.updateHandView();
  }

  updateHandView() {
    const handView = this.shadowRoot?.querySelector("hand-view");
    if (handView) {
      handView.setAttribute("hand", JSON.stringify(this.hand));
    }
  }

  finishRound() {
    if (this.score >= this.pointsGoal) {
      setTimeout(() => {
        alert(`Parabéns! Você venceu a rodada!\nPontuação: ${this.score}`);
        this.round++;
        this.pointsGoal *= 2;
        this.handsLeft = 4;
        this.discardsLeft = 3;
        this.deck = createDeck();
        this.hand = [];
        this.dealHand();
        this.render();
        this.updateHandView();
      }, 100);
    } else {
      setTimeout(() => {
        alert(`Você perdeu!\nPontuação final: ${this.score}`);
        this.startGame();
      }, 100);
    }
  }

  connectedCallback() {
    this.render();
    this.shadowRoot?.addEventListener("play-cards", (e: any) => {
      this.playCards(e.detail);
      const handView = this.shadowRoot?.querySelector("hand-view");
      (handView as any)?.clearSelection?.();
    });
    this.shadowRoot?.addEventListener("discard-cards", (e: any) => {
      this.discardCards(e.detail);
      const handView = this.shadowRoot?.querySelector("hand-view");
      (handView as any)?.clearSelection?.();
    });
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Share+Tech+Mono&display=swap');
        body, :host {
          font-family: 'Montserrat', sans-serif;
        }
        .container {
          background: rgba(255,255,255,0.7);
          border-radius: 18px;
          box-shadow: 0 6px 32px 0 #4cc9f0b6, 0 1.5px 8px 0 #b4b2d7;
          padding: 30px 25px 20px 25px;
          margin: 30px 0 0 0;
          min-width: 350px;
          max-width: 420px;
        }
        h1 {
          margin: 0 0 12px 0;
          text-align: center;
          font-size: 2.3rem;
          font-family: 'Share Tech Mono', monospace;
          color: #1d3557;
          text-shadow: 0 2px 16px #7adfffad;
        }
        .info { margin: 7px 0; font-size: 1.06rem; color: #2d3142; text-align: center;}
      </style>
      <div class="container">
        <h1>ICElatro</h1>
        <div class="info">Rodada: ${this.round} | Meta: ${
      this.pointsGoal
    } pts</div>
        <div class="info">Pontuação: ${this.score}</div>
        <div class="info">Mãos Restantes: ${this.handsLeft}</div>
        <div class="info">Descartes Restantes: ${this.discardsLeft}</div>
        <hand-view hand='${JSON.stringify(this.hand)}'></hand-view>
        <controls-view></controls-view>
      </div>
    `;
  }
}

customElements.define("game-app", GameApp);
