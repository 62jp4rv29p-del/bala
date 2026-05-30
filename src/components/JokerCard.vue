<template>
  <div
    class="joker-card"
    :class="{
      'joker-active': active,
      'joker-empty': !joker,
      'joker-glow': glowing,
      'shop-joker': inShop,
      'sold-out': joker && joker.purchased,
      'cant-afford': inShop && joker && !joker.purchased && !canAfford,
      'slots-full': inShop && joker && !joker.purchased && canAfford && slotsAreFull,
      'ai-suggest': aiSuggested
    }"
    @click="$emit('click', joker)"
  >
    <template v-if="joker">
      <div class="joker-art">{{ joker.art }}</div>
      <div class="joker-name">{{ joker.name }}</div>
      <div class="joker-desc">{{ joker.desc }}</div>
      <div v-if="inShop" class="joker-price">
        <span class="price-sign">$</span>{{ joker.price }}
      </div>
      <div v-if="inShop && joker.purchased" class="sold-overlay">已售出</div>
      <div v-if="inShop && !joker.purchased && !canAfford" class="cant-afford-label">钱不够</div>
      <div v-if="inShop && !joker.purchased && canAfford && slotsAreFull" class="cant-afford-label">槽满了</div>
      <div v-if="aiSuggested" class="ai-badge">🤖 推荐</div>
    </template>
    <template v-else>
      <div class="empty-slot-icon">+</div>
      <div class="empty-slot-label">空槽</div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'JokerCard',
  props: {
    joker: {
      type: Object,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    },
    glowing: {
      type: Boolean,
      default: false
    },
    inShop: {
      type: Boolean,
      default: false
    },
    canAfford: {
      type: Boolean,
      default: true
    },
    slotsAreFull: {
      type: Boolean,
      default: false
    },
    aiSuggested: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.joker-card {
  width: 140px;
  height: 200px;
  border-radius: 12px;
  background: linear-gradient(145deg, #2d1b69, #1a0f3d);
  border: 2px solid #7c3aed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}

.joker-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5);
}

.joker-card.joker-empty {
  background: transparent;
  border: 2px dashed rgba(99, 102, 241, 0.4);
  cursor: default;
}

.joker-card.joker-empty:hover {
  transform: none;
  box-shadow: none;
}

.joker-card.joker-glow {
  animation: jokerGlow 800ms ease;
}

@keyframes jokerGlow {
  0% { box-shadow: 0 0 0 rgba(251, 191, 36, 0); transform: translateY(0) scale(1); }
  30% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.9), 0 0 60px rgba(251, 191, 36, 0.4); transform: translateY(-18px) scale(1.15); }
  70% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.7), 0 0 40px rgba(251, 191, 36, 0.3); transform: translateY(-18px) scale(1.15); }
  100% { box-shadow: 0 0 0 rgba(251, 191, 36, 0); transform: translateY(0) scale(1); }
}

.joker-art {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 8px;
}

.joker-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #e2d3ff;
  text-align: center;
  padding: 0 8px;
  margin-bottom: 6px;
}

.joker-desc {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #a78bfa;
  text-align: center;
  padding: 0 10px;
  line-height: 1.4;
}

.joker-price {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fbbf24;
  color: #1a0f24;
  border-radius: 6px;
  padding: 2px 6px;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  font-weight: 900;
}

.price-sign {
  font-family: 'Press Start 2P', monospace;
}

.empty-slot-icon {
  font-size: 32px;
  color: rgba(99, 102, 241, 0.4);
  line-height: 1;
  margin-bottom: 4px;
}

.empty-slot-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: rgba(99, 102, 241, 0.4);
}

.sold-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: rgba(255,255,255,0.5);
  border-radius: 10px;
}

.cant-afford-label {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(107, 114, 128, 0.8);
  color: #d1d5db;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.shop-joker.cant-afford {
  opacity: 0.6;
}

.shop-joker.slots-full {
  opacity: 0.6;
}

.ai-badge {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #c084fc, #7e22ce);
  color: white;
  border-radius: 8px;
  padding: 2px 8px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.6);
}

.joker-card.ai-suggest {
  border-color: #c084fc;
  box-shadow: 0 0 16px rgba(192, 132, 252, 0.6);
}
</style>
