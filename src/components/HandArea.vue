<template>
  <div class="hand-area-wrapper">
    <!-- Hand cards -->
    <div class="hand-cards-row" ref="handCardsRow">
      <div
        v-for="(card, index) in handCards"
        :key="card.id"
        class="hand-card-slot"
        :data-card-id="card.id"
        ref="cardSlots"
      >
        <PlayingCard
          :card="card"
          :selected="selectedCardIds.includes(card.id)"
          @click="onCardClick"
        />
      </div>
    </div>

    <!-- Action buttons row -->
    <div class="action-buttons-row">
      <!-- Sort buttons -->
      <div class="sort-group">
        <button class="px-btn sort-btn" @click="$emit('sort-rank')">按点数</button>
        <button class="px-btn sort-btn" @click="$emit('sort-suit')">按花色</button>
      </div>

      <!-- Play & Discard -->
      <button
        class="px-btn play-btn"
        :disabled="selectedCardIds.length === 0 || animating"
        @click="$emit('play')"
      >
        出牌 {{ selectedCardIds.length > 0 ? selectedCardIds.length : '' }}
      </button>

      <button
        class="px-btn discard-btn"
        :disabled="selectedCardIds.length === 0 || discardsLeft <= 0 || animating"
        @click="$emit('discard')"
      >
        弃牌 {{ discardsLeft }}
      </button>

      <!-- AI button -->
      <button
        class="px-btn ai-btn"
        :class="{ 'ai-thinking': aiThinking }"
        :disabled="animating || aiThinking"
        @click="$emit('ai-play')"
      >
        {{ aiThinking ? '🤔 AI思考中…' : '🤖 AI出牌' }}
      </button>
    </div>
  </div>
</template>

<script>
import PlayingCard from './PlayingCard.vue'

export default {
  name: 'HandArea',
  components: { PlayingCard },
  props: {
    handCards: {
      type: Array,
      default: () => []
    },
    selectedCardIds: {
      type: Array,
      default: () => []
    },
    discardsLeft: {
      type: Number,
      default: 0
    },
    animating: {
      type: Boolean,
      default: false
    },
    aiThinking: {
      type: Boolean,
      default: false
    }
  },
  emits: ['card-click', 'sort-rank', 'sort-suit', 'play', 'discard', 'ai-play'],
  methods: {
    onCardClick(card) {
      this.$emit('card-click', card)
    },
    getCardSlotEl(cardId) {
      const slots = this.$refs.cardSlots
      if (!slots) return null
      return slots.find(el => el.dataset.cardId === String(cardId)) || null
    },
    getHandRowRect() {
      return this.$refs.handCardsRow ? this.$refs.handCardsRow.getBoundingClientRect() : null
    }
  }
}
</script>

<style scoped>
.hand-area-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 16px 16px;
}

.hand-cards-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding-top: 20px;
  flex: 1;
  align-items: flex-end;
}

.hand-card-slot {
  flex-shrink: 0;
}

.action-buttons-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 36px;
  flex-wrap: wrap;
}

.sort-group {
  display: flex;
  gap: 6px;
}

.px-btn {
  min-height: 52px;
  padding: 14px 20px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1px;
  border: 2px solid rgba(0,0,0,.35);
  transition: all 0.15s ease;
  cursor: pointer;
  white-space: nowrap;
}

.px-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.sort-btn {
  background: transparent;
  border-color: rgba(99, 102, 241, 0.6);
  color: #a5b4fc;
  min-height: 40px;
  padding: 8px 14px;
  font-size: 13px;
}

.sort-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.play-btn {
  background: linear-gradient(180deg, #34d399, #10b981, #059669);
  color: white;
}

.play-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #6ee7b7, #34d399, #10b981);
  transform: translateY(-2px);
}

.discard-btn {
  background: linear-gradient(180deg, #fb7185, #ef4444, #dc2626);
  color: white;
}

.discard-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #fda4af, #fb7185, #ef4444);
  transform: translateY(-2px);
}

.ai-btn {
  background: linear-gradient(180deg, #c084fc, #a855f7, #7e22ce);
  color: white;
  margin-left: auto;
}

.ai-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #d8b4fe, #c084fc, #a855f7);
  transform: translateY(-2px);
}

.ai-btn.ai-thinking {
  animation: aiPulse 1s ease-in-out infinite;
}

@keyframes aiPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
  50% { box-shadow: 0 0 20px 6px rgba(168, 85, 247, 0.5); }
}
</style>
