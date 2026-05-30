<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="logo">🃏 小丑牌</div>

    <!-- Blind info panel -->
    <div class="blind-panel">
      <div class="blind-header">
        <span class="blind-icon">{{ currentBlind.icon }}</span>
        <span class="blind-badge">盲注 {{ blindIndex + 1 }}/3</span>
      </div>
      <div class="blind-name">{{ currentBlind.name }}</div>
      <div class="blind-target-row">
        <span class="blind-target-label">目标</span>
        <span class="blind-target-value">{{ currentBlind.target }}</span>
      </div>
      <div class="blind-reward">奖励: ${{ currentBlind.reward }} + 手数 × $1</div>
    </div>

    <!-- Round Score -->
    <div class="score-panel">
      <div class="score-label">当前得分</div>
      <div class="score-value" ref="scoreEl">{{ displayScore }}</div>
      <div class="score-progress-bar">
        <div
          class="score-progress-fill"
          :style="{ width: Math.min(100, (roundScore / currentBlind.target) * 100) + '%' }"
        ></div>
        <div class="score-progress-target">{{ currentBlind.target }}</div>
      </div>
    </div>

    <!-- HAND scoring block -->
    <div class="hand-score-panel" v-if="currentHandType">
      <div class="hand-type-name">{{ currentHandType.name }}</div>
      <div class="hand-chips-mult-row">
        <div class="chips-block" ref="chipsBlock">
          <span class="chips-label">筹码</span>
          <span class="chips-value">{{ currentChips }}</span>
        </div>
        <div class="mult-sep">×</div>
        <div class="mult-block" ref="multBlock">
          <span class="mult-label">倍率</span>
          <span class="mult-value">{{ currentMult }}</span>
        </div>
      </div>
    </div>
    <div class="hand-score-panel empty" v-else>
      <div class="hand-type-name">-</div>
      <div class="hand-chips-mult-row">
        <div class="chips-block" ref="chipsBlock">
          <span class="chips-label">筹码</span>
          <span class="chips-value">0</span>
        </div>
        <div class="mult-sep">×</div>
        <div class="mult-block" ref="multBlock">
          <span class="mult-label">倍率</span>
          <span class="mult-value">1</span>
        </div>
      </div>
    </div>

    <!-- Hands / Discards -->
    <div class="resources-row">
      <div class="resource-panel">
        <div class="resource-label">手数</div>
        <div class="resource-value">{{ handsLeft }}</div>
      </div>
      <div class="resource-panel discard-panel">
        <div class="resource-label">弃牌</div>
        <div class="resource-value">{{ discardsLeft }}</div>
      </div>
    </div>

    <!-- Coins -->
    <div class="coins-panel">
      <span class="coins-sign">$</span>
      <span class="coins-value">{{ coins }}</span>
    </div>

    <!-- Turn Timer -->
    <div class="timer-panel" :class="{ 'timer-warning': timeLeft <= 10, 'timer-critical': timeLeft <= 5 }">
      <div class="timer-label">剩余时间</div>
      <div class="timer-value">{{ timeLeft }}s</div>
      <div class="timer-bar">
        <div class="timer-bar-fill" :style="{ width: (timeLeft / 60 * 100) + '%' }"></div>
      </div>
    </div>

    <!-- Ante / Round info -->
    <div class="ante-info">
      Ante 1/3 · 第 {{ roundNumber }} 轮
    </div>

    <!-- Restart button -->
    <button class="px-btn restart-btn" @click="$emit('restart')">
      重新开始
    </button>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  props: {
    currentBlind: { type: Object, required: true },
    blindIndex: { type: Number, required: true },
    roundScore: { type: Number, required: true },
    handsLeft: { type: Number, required: true },
    discardsLeft: { type: Number, required: true },
    coins: { type: Number, required: true },
    roundNumber: { type: Number, required: true },
    currentHandType: { type: Object, default: null },
    currentChips: { type: Number, default: 0 },
    currentMult: { type: Number, default: 0 },
    timeLeft: { type: Number, default: 60 }
  },
  emits: ['restart'],
  data() {
    return {
      displayScore: 0,
      _scoreTimeout: null
    }
  },
  watch: {
    roundScore(newVal, oldVal) {
      this.animateScore(oldVal, newVal)
    }
  },
  methods: {
    animateScore(from, to) {
      const duration = 600
      const startTime = performance.now()
      const tick = (now) => {
        const elapsed = now - startTime
        const t = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        this.displayScore = Math.floor(from + (to - from) * ease)
        if (t < 1) requestAnimationFrame(tick)
        else this.displayScore = to
      }
      requestAnimationFrame(tick)
    },
    getChipsBlockEl() {
      return this.$refs.chipsBlock
    },
    getMultBlockEl() {
      return this.$refs.multBlock
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: min(28vw, 480px);
  min-width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #0e1b3d 0%, #0a1438 50%, #0e1b3d 100%);
  border-right: 1px solid rgba(99, 102, 241, 0.3);
  display: flex;
  flex-direction: column;
  padding: 16px 14px;
  gap: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.logo {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #fbbf24;
  text-shadow: 2px 2px 0px #000, -1px -1px 0px #000;
  text-align: center;
  padding: 4px 0;
}

.blind-panel {
  background: rgba(30, 20, 70, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 10px;
  padding: 10px 12px;
}

.blind-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.blind-icon {
  font-size: 18px;
}

.blind-badge {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #a5b4fc;
}

.blind-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.blind-target-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.blind-target-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #94a3b8;
}

.blind-target-value {
  font-family: 'VT323', monospace;
  font-size: 28px;
  color: #fbbf24;
  line-height: 1;
}

.blind-reward {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #6ee7b7;
  margin-top: 2px;
}

.score-panel {
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 10px 12px;
}

.score-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.score-value {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: #fff;
  line-height: 1;
  margin-bottom: 6px;
}

.score-progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.score-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.score-progress-target {
  position: absolute;
  right: 0;
  top: -16px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 9px;
  color: #64748b;
}

.hand-score-panel {
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 8px 12px;
}

.hand-score-panel.empty {
  opacity: 0.4;
}

.hand-type-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #e2e8f0;
  text-align: center;
  margin-bottom: 6px;
}

.hand-chips-mult-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chips-block {
  flex: 1;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border-radius: 8px;
  padding: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chips-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 9px;
  color: rgba(255,255,255,0.7);
}

.chips-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fff;
}

.mult-sep {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #94a3b8;
  flex-shrink: 0;
}

.mult-block {
  flex: 1;
  background: linear-gradient(135deg, #991b1b, #ef4444);
  border-radius: 8px;
  padding: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mult-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 9px;
  color: rgba(255,255,255,0.7);
}

.mult-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fff;
}

.resources-row {
  display: flex;
  gap: 8px;
}

.resource-panel {
  flex: 1;
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 8px;
  text-align: center;
}

.resource-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.resource-value {
  font-family: 'VT323', monospace;
  font-size: 34px;
  color: #fff;
  line-height: 1;
}

.discard-panel .resource-value {
  color: #fb7185;
}

.coins-panel {
  background: #0f172a;
  border: 2px inset rgba(99, 102, 241, 0.4);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.coins-sign {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #fbbf24;
}

.coins-value {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: #fbbf24;
  line-height: 1;
}

.timer-panel {
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 8px 12px;
  transition: border-color 0.3s, background 0.3s;
}

.timer-panel.timer-warning {
  border-color: rgba(251, 191, 36, 0.6);
  background: rgba(40, 30, 10, 0.9);
}

.timer-panel.timer-critical {
  border-color: rgba(239, 68, 68, 0.8);
  background: rgba(50, 10, 10, 0.9);
  animation: timerPulse 0.5s ease-in-out infinite alternate;
}

@keyframes timerPulse {
  from { box-shadow: none; }
  to { box-shadow: 0 0 12px rgba(239, 68, 68, 0.6); }
}

.timer-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.timer-value {
  font-family: 'VT323', monospace;
  font-size: 34px;
  color: #fff;
  line-height: 1;
  margin-bottom: 4px;
}

.timer-panel.timer-warning .timer-value {
  color: #fbbf24;
}

.timer-panel.timer-critical .timer-value {
  color: #f87171;
}

.timer-bar {
  height: 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 3px;
  transition: width 1s linear, background 0.3s;
}

.timer-panel.timer-warning .timer-bar-fill {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.timer-panel.timer-critical .timer-bar-fill {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.ante-info {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #475569;
  text-align: center;
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

.restart-btn {
  background: linear-gradient(180deg, #fb7185, #ef4444, #dc2626);
  color: white;
  margin-top: auto;
}

.restart-btn:hover {
  background: linear-gradient(180deg, #f43f5e, #dc2626, #b91c1c);
  transform: translateY(-2px);
}

.restart-btn:active {
  transform: translateY(0);
}
</style>
