<template>
  <Teleport to="body">
    <div v-if="visible" class="settings-overlay" @click.self="$emit('close')">
      <div class="settings-modal">
        <div class="settings-header">
          <div class="settings-title">⚙️ 设置</div>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="settings-body">
          <!-- BGM Volume -->
          <div class="setting-row">
            <label class="setting-label">BGM 音量</label>
            <div class="setting-control">
              <input
                type="range"
                min="0"
                max="100"
                v-model.number="localSettings.bgmVolume"
                @change="save"
                class="slider"
              />
              <span class="slider-value">{{ localSettings.bgmVolume }}</span>
            </div>
          </div>

          <!-- SFX Volume -->
          <div class="setting-row">
            <label class="setting-label">SFX 音量</label>
            <div class="setting-control">
              <input
                type="range"
                min="0"
                max="100"
                v-model.number="localSettings.sfxVolume"
                @change="save"
                class="slider"
              />
              <span class="slider-value">{{ localSettings.sfxVolume }}</span>
            </div>
          </div>

          <!-- Animation speed -->
          <div class="setting-row">
            <label class="setting-label">动画速度</label>
            <div class="setting-control radio-group">
              <label class="radio-item" v-for="opt in speedOptions" :key="opt.value">
                <input
                  type="radio"
                  :value="opt.value"
                  v-model="localSettings.animSpeed"
                  @change="save"
                />
                <span class="radio-label">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- Show formula preview toggle -->
          <div class="setting-row">
            <label class="setting-label">出牌公式预览</label>
            <div class="setting-control">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="localSettings.showFormulaPreview"
                  @change="save"
                />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">{{ localSettings.showFormulaPreview ? '开' : '关' }}</span>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="px-btn confirm-btn" @click="$emit('close')">确认</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
const SETTINGS_KEY = 'balatro.settings'

const DEFAULT_SETTINGS = {
  bgmVolume: 50,
  sfxVolume: 70,
  animSpeed: 'normal',
  showFormulaPreview: true
}

export default {
  name: 'SettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'settings-changed'],
  data() {
    return {
      localSettings: { ...DEFAULT_SETTINGS },
      speedOptions: [
        { value: 'slow', label: '慢' },
        { value: 'normal', label: '普通' },
        { value: 'fast', label: '快' }
      ]
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    load() {
      try {
        const saved = localStorage.getItem(SETTINGS_KEY)
        if (saved) {
          this.localSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        }
      } catch (e) {
        this.localSettings = { ...DEFAULT_SETTINGS }
      }
    },
    save() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.localSettings))
      } catch (e) {}
      this.$emit('settings-changed', { ...this.localSettings })
    },
    getSettings() {
      return { ...this.localSettings }
    }
  }
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  width: 600px;
  max-width: 90vw;
  background: linear-gradient(135deg, #0d1b3e 0%, #0a1438 50%, #111827 100%);
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15);
  overflow: hidden;
  animation: modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

.settings-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #e2e8f0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(99, 102, 241, 0.4);
  color: #fff;
}

.settings-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.setting-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #cbd5e1;
  min-width: 100px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

.slider {
  flex: 1;
  max-width: 200px;
  height: 6px;
  accent-color: #6366f1;
  cursor: pointer;
}

.slider-value {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #fbbf24;
  min-width: 36px;
  text-align: right;
}

.radio-group {
  gap: 16px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
}

.radio-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #cbd5e1;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #374151;
  border-radius: 24px;
  transition: background 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: #6366f1;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #94a3b8;
  min-width: 20px;
}

.settings-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(99, 102, 241, 0.3);
  display: flex;
  justify-content: flex-end;
}

.px-btn {
  min-height: 44px;
  padding: 10px 28px;
  border-radius: 10px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1px;
  border: 2px solid rgba(0,0,0,.35);
  transition: all 0.15s ease;
  cursor: pointer;
}

.confirm-btn {
  background: linear-gradient(180deg, #818cf8, #4338ca);
  color: white;
}

.confirm-btn:hover {
  background: linear-gradient(180deg, #a5b4fc, #818cf8);
  transform: translateY(-2px);
}
</style>
