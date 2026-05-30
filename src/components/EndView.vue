<template>
  <div class="end-view" :class="phase === 'won' ? 'won' : 'lost'">
    <div class="end-content">
      <div class="end-icon">{{ phase === 'won' ? '🏆' : '💀' }}</div>
      <div class="end-title">{{ phase === 'won' ? '通关！' : '游戏结束' }}</div>
      <div class="end-subtitle">
        {{ phase === 'won'
          ? '恭喜你，击败了所有盲注！'
          : `第 ${roundNumber} 轮 ${blindName} 未能达到目标分 ${targetScore}` }}
      </div>

      <div class="end-stats">
        <div class="stat-item">
          <span class="stat-label">最终得分</span>
          <span class="stat-value">{{ finalScore }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Joker 数量</span>
          <span class="stat-value">{{ jokerCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">剩余金币</span>
          <span class="stat-value">${{ coins }}</span>
        </div>
      </div>

      <button class="px-btn restart-btn" @click="$emit('restart')">
        {{ phase === 'won' ? '🎮 再玩一次' : '重新开始' }}
      </button>
    </div>

    <!-- Confetti for won state -->
    <div v-if="phase === 'won'" class="confetti-container">
      <div v-for="i in 20" :key="i" class="confetti-piece" :style="getConfettiStyle(i)"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EndView',
  props: {
    phase: {
      type: String,
      default: 'lost'
    },
    roundNumber: {
      type: Number,
      default: 1
    },
    blindName: {
      type: String,
      default: ''
    },
    targetScore: {
      type: Number,
      default: 0
    },
    finalScore: {
      type: Number,
      default: 0
    },
    jokerCount: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    }
  },
  emits: ['restart'],
  methods: {
    getConfettiStyle(i) {
      const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185']
      return {
        left: (Math.random() * 100) + '%',
        animationDelay: (Math.random() * 2) + 's',
        animationDuration: (2 + Math.random() * 2) + 's',
        background: colors[i % colors.length],
        width: (6 + Math.random() * 8) + 'px',
        height: (6 + Math.random() * 8) + 'px',
      }
    }
  }
}
</script>

<style scoped>
.end-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.end-view.won {
  background: radial-gradient(ellipse at center, rgba(6, 78, 59, 0.3) 0%, transparent 70%);
}

.end-view.lost {
  background: radial-gradient(ellipse at center, rgba(127, 29, 29, 0.3) 0%, transparent 70%);
}

.end-content {
  text-align: center;
  z-index: 2;
  position: relative;
}

.end-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bounceIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.end-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 12px;
}

.end-view.won .end-title {
  color: #fbbf24;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
}

.end-view.lost .end-title {
  color: #f87171;
  text-shadow: 0 0 30px rgba(248, 113, 113, 0.5);
}

.end-subtitle {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 24px;
  max-width: 400px;
}

.end-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 32px;
}

.stat-item {
  background: rgba(30, 30, 60, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #64748b;
}

.stat-value {
  font-family: 'VT323', monospace;
  font-size: 28px;
  color: #e2e8f0;
}

.px-btn {
  min-height: 52px;
  padding: 14px 40px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  border: 2px solid rgba(0,0,0,.35);
  transition: all 0.15s ease;
  cursor: pointer;
}

.restart-btn {
  background: linear-gradient(180deg, #fb7185, #ef4444, #dc2626);
  color: white;
}

.end-view.won .restart-btn {
  background: linear-gradient(180deg, #34d399, #10b981, #059669);
}

.restart-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* Confetti */
.confetti-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.confetti-piece {
  position: absolute;
  top: -10px;
  border-radius: 2px;
  animation: confettiFall linear infinite;
}

@keyframes confettiFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
</style>
