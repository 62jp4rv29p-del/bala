<template>
  <div class="start-view">
    <!-- Floating card decorations -->
    <div class="bg-cards">
      <div v-for="c in bgCards" :key="c.id" class="bg-card" :style="c.style">{{ c.face }}</div>
    </div>

    <div class="start-content">
      <!-- Logo -->
      <div class="logo-block">
        <div class="logo-icon">🃏</div>
        <div class="logo-title">小丑牌</div>
        <div class="logo-sub">BALATRO</div>
      </div>

      <!-- Blinds preview -->
      <div class="blinds-preview">
        <div v-for="blind in blinds" :key="blind.name" class="blind-chip">
          <span>{{ blind.icon }}</span>
          <span>{{ blind.name }}</span>
          <span class="blind-chip-target">{{ blind.target }}</span>
        </div>
      </div>

      <!-- Buttons -->
      <div class="btn-group">
        <button class="start-btn" @click="$emit('start')">开始游戏</button>
        <button class="rules-btn" @click="showRules = true">游戏规则</button>
      </div>

      <div class="hint-text">选牌 → 出牌 → 打败盲注，赢取金币</div>
    </div>

    <!-- Rules modal -->
    <Transition name="modal">
      <div v-if="showRules" class="modal-mask" @click.self="showRules = false">
        <div class="modal-box">
          <button class="modal-close" @click="showRules = false">✕</button>

          <div class="modal-title">📖 游戏规则</div>

          <div class="rules-body">
            <section>
              <h3>🎯 目标</h3>
              <p>打出扑克手牌获得分数，每关都有一个<b>目标分数</b>（盲注）。在手数用完前达到目标即可过关，失败则游戏结束。</p>
            </section>

            <section>
              <h3>🔄 基本流程</h3>
              <ol>
                <li>每轮发 <b>8 张</b>手牌</li>
                <li>从手牌中选 1–5 张，点击<b>出牌</b>计算得分</li>
                <li>或选 1–5 张点击<b>弃牌</b>换新牌（最多 3 次）</li>
                <li>共有 <b>4 次</b>出牌机会，得分累积达到目标即过关</li>
                <li>过关后进入<b>商店</b>，可购买 Joker 强化出牌</li>
                <li>通过全部 3 关（小盲 → 中盲 → 大盲）即为通关</li>
              </ol>
            </section>

            <section>
              <h3>🃏 牌型与基础分（筹码 × 倍率）</h3>
              <div class="hand-table">
                <div class="hand-row header">
                  <span>牌型</span><span>筹码</span><span>倍率</span>
                </div>
                <div v-for="h in handTypes" :key="h.name" class="hand-row">
                  <span>{{ h.name }}</span>
                  <span class="chip-val">{{ h.chips }}</span>
                  <span class="mult-val">×{{ h.mult }}</span>
                </div>
              </div>
              <p class="note">实际得分 = （基础筹码 + 所有打出牌的点数之和）× 倍率</p>
            </section>

            <section>
              <h3>🃏 牌面点数</h3>
              <div class="point-row">
                <span v-for="r in rankPoints" :key="r.rank" class="point-chip">
                  {{ r.rank }}<b>{{ r.pts }}</b>
                </span>
              </div>
            </section>

            <section>
              <h3>⏱ 60 秒限时</h3>
              <p>每手牌有 <b>60 秒</b>决策时间，超时后 AI 会自动为你打出最优手牌。</p>
            </section>

            <section>
              <h3>🤖 Joker 效果示例</h3>
              <div class="joker-list">
                <div class="joker-item"><span class="j-art">🃏</span><span>小丑：每手 +4 倍率</span></div>
                <div class="joker-item"><span class="j-art">📖</span><span>学者：每张 A +4 倍率</span></div>
                <div class="joker-item"><span class="j-art">❤️</span><span>红心收藏家：含 ♥ 时倍率 ×4</span></div>
                <div class="joker-item"><span class="j-art">♣</span><span>梅花爱好者：含 ♣ 时倍率 ×4</span></div>
                <div class="joker-item"><span class="j-art">👑</span><span>皇家头牌：含 J/Q/K 时倍率 ×10</span></div>
                <div class="joker-item"><span class="j-art">🔥</span><span>同花顺大师：打出同花顺 +50 倍率</span></div>
              </div>
            </section>

            <section>
              <h3>💰 金币与商店</h3>
              <p>过关奖励 <b>$5 + 剩余手数</b>。商店可购买 Joker（最多持有 5 个），Joker 越强越贵。</p>
            </section>
          </div>

          <button class="modal-start-btn" @click="$emit('start')">明白了，开始游戏！</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { BLINDS } from '../composables/useGameState.js'
import { HAND_TYPES, RANK_POINTS } from '../composables/useCardEngine.js'

const FACES = ['🂡','🂱','🃁','🃑','🂢','🂲','🃂','🃒','🂣','🂳','🃃','🃓','🂤','🂴','🃄','🃔']

export default {
  name: 'StartView',
  emits: ['start'],
  data() {
    return {
      showRules: false,
      blinds: BLINDS,
      handTypes: Object.values(HAND_TYPES),
      rankPoints: ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].map(r => ({
        rank: r, pts: RANK_POINTS[r]
      })),
      bgCards: Array.from({ length: 12 }, (_, i) => ({
        id: i,
        face: FACES[i % FACES.length],
        style: {
          left: (Math.random() * 90 + 5) + '%',
          top: (Math.random() * 90 + 5) + '%',
          fontSize: (28 + Math.random() * 36) + 'px',
          animationDelay: (Math.random() * 6) + 's',
          animationDuration: (8 + Math.random() * 8) + 's',
          opacity: 0.04 + Math.random() * 0.08,
          transform: `rotate(${-30 + Math.random() * 60}deg)`,
        }
      }))
    }
  }
}
</script>

<style scoped>
.start-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-cards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-card {
  position: absolute;
  color: #a5b4fc;
  animation: floatCard ease-in-out infinite alternate;
  user-select: none;
}

@keyframes floatCard {
  from { transform: translateY(-12px) rotate(-5deg); }
  to   { transform: translateY(12px) rotate(5deg); }
}

.start-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* Logo */
.logo-block {
  text-align: center;
  animation: logoIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes logoIn {
  from { transform: scale(0.6) translateY(-20px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

.logo-icon {
  font-size: 80px;
  line-height: 1;
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.4)); }
  50%       { filter: drop-shadow(0 0 36px rgba(251, 191, 36, 0.8)); }
}

.logo-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 36px;
  color: #fbbf24;
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #78350f;
  margin-top: 12px;
  letter-spacing: 2px;
}

.logo-sub {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #a78bfa;
  letter-spacing: 8px;
  margin-top: 6px;
  opacity: 0.7;
}

/* Blinds preview */
.blinds-preview {
  display: flex;
  gap: 12px;
  animation: fadeUp 0.6s 0.3s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.blind-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(30, 20, 70, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 20px;
  padding: 8px 14px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #c4b5fd;
}

.blind-chip-target {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #fbbf24;
  line-height: 1;
}

/* Buttons */
.btn-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeUp 0.6s 0.5s ease both;
}

.start-btn {
  min-width: 200px;
  padding: 18px 48px;
  border-radius: 14px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 2px;
  border: 2px solid rgba(0,0,0,0.35);
  background: linear-gradient(180deg, #fbbf24, #f59e0b, #d97706);
  color: #1c1917;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 4px 24px rgba(251, 191, 36, 0.35);
}

.start-btn:hover {
  background: linear-gradient(180deg, #fcd34d, #fbbf24, #f59e0b);
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 10px 32px rgba(251, 191, 36, 0.5);
}

.start-btn:active {
  transform: translateY(0) scale(0.98);
}

.rules-btn {
  min-width: 200px;
  padding: 12px 32px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  border: 2px solid rgba(99, 102, 241, 0.5);
  background: rgba(30, 20, 70, 0.7);
  color: #c4b5fd;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rules-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.8);
  color: #e0d9ff;
  transform: translateY(-2px);
}

.hint-text {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #475569;
  animation: fadeUp 0.6s 0.7s ease both;
}

/* Modal */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(4px);
}

.modal-box {
  position: relative;
  width: min(640px, 92vw);
  max-height: 82vh;
  background: linear-gradient(160deg, #0e1b3d, #1a1040);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 20px;
  padding: 32px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: rgba(255,255,255,0.07);
  border: none;
  color: #94a3b8;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.modal-close:hover {
  background: rgba(255,255,255,0.14);
  color: #e2e8f0;
}

.modal-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #fbbf24;
  text-align: center;
}

.rules-body {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.4) transparent;
}

.rules-body section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rules-body h3 {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #a5b4fc;
  margin: 0;
}

.rules-body p, .rules-body li {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0;
}

.rules-body b {
  color: #e2e8f0;
}

.rules-body ol {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Hand type table */
.hand-table {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hand-row {
  display: grid;
  grid-template-columns: 1fr 56px 56px;
  gap: 8px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(255,255,255,0.03);
  color: #cbd5e1;
}

.hand-row.header {
  color: #64748b;
  font-size: 11px;
  background: none;
  padding-bottom: 2px;
}

.chip-val {
  color: #60a5fa;
  font-family: 'VT323', monospace;
  font-size: 16px;
  line-height: 1;
}

.mult-val {
  color: #f87171;
  font-family: 'VT323', monospace;
  font-size: 16px;
  line-height: 1;
}

.note {
  font-size: 11px !important;
  color: #475569 !important;
  font-style: italic;
}

/* Rank points */
.point-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.point-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(30, 20, 70, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 4px 8px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #94a3b8;
  gap: 1px;
}

.point-chip b {
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fbbf24;
  font-weight: normal;
  line-height: 1;
}

/* Joker list */
.joker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.joker-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 6px 10px;
}

.j-art {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

/* Modal bottom button */
.modal-start-btn {
  padding: 14px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
  border: 2px solid rgba(0,0,0,0.3);
  background: linear-gradient(180deg, #fbbf24, #f59e0b, #d97706);
  color: #1c1917;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.modal-start-btn:hover {
  background: linear-gradient(180deg, #fcd34d, #fbbf24, #f59e0b);
  transform: translateY(-2px);
}

/* Transition */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
