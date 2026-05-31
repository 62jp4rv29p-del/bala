<template>
  <div class="play-area-wrapper">
    <div class="play-area-label">出牌区</div>
    <div class="play-area-content" ref="playAreaEl">
      <!-- Played cards -->
      <div class="played-cards-row" ref="playedCardsRow">
        <div
          v-for="card in playedCards"
          :key="card.id"
          class="played-card-slot"
          :class="{ 'card-highlight': highlightedCardIds.includes(card.id) }"
          ref="playedCardEls"
        >
          <div class="played-card">
            <div class="pc-corner tl">
              <span class="pc-rank" :class="{ 'red': card.suit === '♥' || card.suit === '♦' }">{{ card.rank }}</span>
              <span class="pc-suit" :class="{ 'red': card.suit === '♥' || card.suit === '♦' }">{{ card.suit }}</span>
            </div>
            <div class="pc-center" :class="{ 'red': card.suit === '♥' || card.suit === '♦' }">{{ card.suit }}</div>
            <div class="pc-corner br">
              <span class="pc-rank" :class="{ 'red': card.suit === '♥' || card.suit === '♦' }">{{ card.rank }}</span>
              <span class="pc-suit" :class="{ 'red': card.suit === '♥' || card.suit === '♦' }">{{ card.suit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Score popup -->
      <div class="score-popup" v-if="showScorePopup" :key="scorePopupKey">
        <span class="score-popup-chips">{{ scorePopupChips }}</span>
        <span class="score-popup-x">×</span>
        <span class="score-popup-mult">{{ scorePopupMult }}</span>
        <span class="score-popup-eq">=</span>
        <span class="score-popup-score">{{ scorePopupScore }}</span>
      </div>

      <!-- Deck pile (absolute, bottom right) -->
      <div class="deck-pile" ref="deckPileEl">
        <div class="deck-card deck-card-3"></div>
        <div class="deck-card deck-card-2"></div>
        <div class="deck-card deck-card-1">
          <span class="deck-count">{{ deckCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayArea',
  props: {
    playedCards: {
      type: Array,
      default: () => []
    },
    deckCount: {
      type: Number,
      default: 0
    },
    highlightedCardIds: {
      type: Array,
      default: () => []
    },
    showScorePopup: {
      type: Boolean,
      default: false
    },
    scorePopupKey: {
      type: Number,
      default: 0
    },
    scorePopupChips: {
      type: Number,
      default: 0
    },
    scorePopupMult: {
      type: Number,
      default: 0
    },
    scorePopupScore: {
      type: Number,
      default: 0
    }
  },
  methods: {
    getDeckRect() {
      const el = this.$refs.deckPileEl
      return el ? el.getBoundingClientRect() : null
    },
    getPlayedCardEl(index) {
      const els = this.$refs.playedCardEls
      return els && els[index] ? els[index] : null
    },
    getPlayAreaRect() {
      return this.$refs.playAreaEl ? this.$refs.playAreaEl.getBoundingClientRect() : null
    }
  }
}
</script>

<style scoped>
.play-area-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 16px 8px;
}

.play-area-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #475569;
  margin-bottom: 6px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.play-area-content {
  flex: 1;
  position: relative;
  background: rgba(10, 15, 40, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.played-cards-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px;
}

.played-card-slot {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.played-card-slot.card-highlight {
  transform: translateY(-18px);
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.9));
}

.played-card {
  width: 90px;
  height: 130px;
  border-radius: 8px;
  background: linear-gradient(180deg, #fff8e1, #f7e9c4);
  border: 2px solid #1a0f24;
  box-shadow: 2px 3px 8px rgba(0,0,0,0.4);
  position: relative;
  padding: 6px;
}

.pc-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.pc-corner.br {
  position: absolute;
  bottom: 5px;
  right: 5px;
  transform: rotate(180deg);
}

.pc-rank {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 900;
  color: #1a0f24;
  line-height: 1;
}

.pc-suit {
  font-size: 10px;
  color: #1a0f24;
  line-height: 1;
}

.pc-rank.red, .pc-suit.red, .pc-center.red {
  color: #dc2626;
}

.pc-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  line-height: 1;
  color: #1a0f24;
}

/* Score popup */
.score-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 15, 40, 0.92);
  border: 2px solid rgba(251, 191, 36, 0.6);
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  animation: popupBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes popupBounce {
  from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.score-popup-chips {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #60a5fa;
}

.score-popup-x {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #94a3b8;
}

.score-popup-mult {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #f87171;
}

.score-popup-eq {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #94a3b8;
}

.score-popup-score {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #fbbf24;
}

/* Deck pile */
.deck-pile {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 90px;
  height: 130px;
  cursor: default;
}

.deck-card {
  position: absolute;
  width: 90px;
  height: 130px;
  border-radius: 8px;
  border: 2px solid #1a0f24;
}

.deck-card-3 {
  background: url('/card-back.jpg') center/cover no-repeat;
  bottom: -4px;
  right: -4px;
  opacity: 0.6;
}

.deck-card-2 {
  background: url('/card-back.jpg') center/cover no-repeat;
  bottom: -2px;
  right: -2px;
  opacity: 0.8;
}

.deck-card-1 {
  background: url('/card-back.jpg') center/cover no-repeat;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deck-count {
  font-family: 'VT323', monospace;
  font-size: 32px;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}

/* ── 移动端横屏适配 ── */
@media (max-height: 500px) and (orientation: landscape) {
  .play-area-wrapper {
    padding: 6px 8px 4px;
  }

  .play-area-label {
    font-size: 9px;
    margin-bottom: 4px;
  }

  .played-cards-row {
    gap: 4px;
    padding: 8px;
  }

  .played-card {
    width: 54px;
    height: 78px;
    border-radius: 6px;
    padding: 4px;
  }

  .pc-rank { font-size: 10px; }
  .pc-suit { font-size: 8px; }
  .pc-center { font-size: 18px; }

  .deck-pile {
    width: 54px;
    height: 78px;
    bottom: 8px;
    right: 8px;
  }

  .deck-card {
    width: 54px;
    height: 78px;
    border-radius: 6px;
  }

  .deck-count { font-size: 22px; }

  .score-popup {
    padding: 7px 12px;
    gap: 5px;
    border-radius: 8px;
  }

  .score-popup-chips { font-size: 11px; }
  .score-popup-x     { font-size: 9px; }
  .score-popup-mult  { font-size: 11px; }
  .score-popup-eq    { font-size: 9px; }
  .score-popup-score { font-size: 13px; }
}
</style>
