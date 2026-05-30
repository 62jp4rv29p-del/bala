<template>
  <div class="shop-view">
    <div class="shop-header">
      <div class="shop-title">🛒 商店</div>
      <div class="shop-subtitle">选购 Joker 强化你的牌组</div>
    </div>

    <!-- Reward info -->
    <div class="reward-banner">
      <span class="reward-icon">💰</span>
      <span class="reward-text">
        本关奖励: <span class="reward-amount">${{ rewardAmount }}</span>
        (通关 $5 + 剩余 {{ handsRemaining }} 手 × $1)
      </span>
    </div>

    <!-- Current coins -->
    <div class="shop-coins">
      <span class="coins-sign">$</span>
      <span class="coins-value">{{ coins }}</span>
      <span class="coins-label">金币</span>
    </div>

    <!-- Joker slots available -->
    <div class="slots-info">
      Joker 槽位: {{ ownedJokers.length }}/{{ jokerSlots }}
    </div>

    <!-- Shop items -->
    <div class="shop-items-row">
      <JokerCard
        v-for="joker in shopJokers"
        :key="joker.id"
        :joker="joker"
        :in-shop="true"
        :can-afford="coins >= joker.price"
        :slots-are-full="ownedJokers.length >= jokerSlots"
        :ai-suggested="aiSuggestedId === joker.id"
        @click="onBuyJoker"
      />
    </div>

    <!-- Currently owned jokers -->
    <div class="owned-jokers-section" v-if="ownedJokers.length > 0">
      <div class="section-title">已拥有的 Joker</div>
      <div class="owned-jokers-row">
        <JokerCard
          v-for="j in ownedJokers"
          :key="j.id"
          :joker="j"
        />
      </div>
    </div>

    <!-- Skip button -->
    <div class="shop-footer">
      <button class="px-btn ai-suggest-btn" @click="$emit('ai-suggest')" :disabled="shopJokers.every(j => j.purchased || coins < j.price)">
        🤖 AI建议
      </button>
      <button class="px-btn skip-btn" @click="$emit('skip')">
        跳过 →
      </button>
    </div>
  </div>
</template>

<script>
import JokerCard from './JokerCard.vue'

export default {
  name: 'ShopView',
  components: { JokerCard },
  props: {
    shopJokers: {
      type: Array,
      default: () => []
    },
    ownedJokers: {
      type: Array,
      default: () => []
    },
    coins: {
      type: Number,
      default: 0
    },
    jokerSlots: {
      type: Number,
      default: 5
    },
    handsRemaining: {
      type: Number,
      default: 0
    },
    rewardAmount: {
      type: Number,
      default: 5
    },
    aiSuggestedId: {
      type: String,
      default: null
    }
  },
  emits: ['buy', 'skip', 'ai-suggest'],
  methods: {
    onBuyJoker(joker) {
      if (!joker || joker.purchased) return
      if (this.coins < joker.price) return
      if (this.ownedJokers.length >= this.jokerSlots) return
      this.$emit('buy', joker.id)
    }
  }
}
</script>

<style scoped>
.shop-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 16px;
  overflow: hidden;
}

.shop-header {
  text-align: center;
}

.shop-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 900;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.shop-subtitle {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #64748b;
}

.reward-banner {
  background: rgba(6, 78, 59, 0.4);
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reward-icon {
  font-size: 16px;
}

.reward-text {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #6ee7b7;
}

.reward-amount {
  font-family: 'Press Start 2P', monospace;
  font-size: 13px;
  color: #fbbf24;
}

.shop-coins {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  border: 2px solid rgba(251, 191, 36, 0.4);
  border-radius: 10px;
  padding: 8px 20px;
}

.coins-sign {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #fbbf24;
}

.coins-value {
  font-family: 'VT323', monospace;
  font-size: 40px;
  color: #fbbf24;
  line-height: 1;
}

.coins-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #94a3b8;
}

.slots-info {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #64748b;
}

.shop-items-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.owned-jokers-section {
  width: 100%;
  max-width: 600px;
}

.section-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  text-align: center;
}

.owned-jokers-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.owned-jokers-row :deep(.joker-card) {
  width: 90px;
  height: 130px;
}

.owned-jokers-row :deep(.joker-art) {
  font-size: 28px;
}

.owned-jokers-row :deep(.joker-name) {
  font-size: 9px;
}

.owned-jokers-row :deep(.joker-desc) {
  display: none;
}

.shop-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: auto;
}

.px-btn {
  min-height: 52px;
  padding: 14px 26px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1.5px;
  border: 2px solid rgba(0,0,0,.35);
  transition: all 0.15s ease;
  cursor: pointer;
}

.px-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skip-btn {
  background: linear-gradient(180deg, #818cf8, #4338ca);
  color: white;
}

.skip-btn:hover {
  background: linear-gradient(180deg, #a5b4fc, #818cf8);
  transform: translateY(-2px);
}

.ai-suggest-btn {
  background: linear-gradient(180deg, #c084fc, #a855f7, #7e22ce);
  color: white;
}

.ai-suggest-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #d8b4fe, #c084fc, #a855f7);
  transform: translateY(-2px);
}
</style>
