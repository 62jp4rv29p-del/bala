# 小丑牌 Tauri 跨端适配 — 移动端 UI 布局设计规范

> 版本 1.0 | 2026-05-31
> 断点策略：`@media (max-height: 500px) and (orientation: landscape)` 触发紧凑模式

---

## 1. 设计气质

**克制 · 密集 · 游戏感**

- **克制**：移动端每一像素都珍贵，所有装饰性空白全部压缩到视觉刚好不拥挤的临界值，拒绝留白浪费。
- **密集**：7 个信息区域（盲注 / 分数 / 手牌型 / 手数弃牌 / 金币 / 计时 / Joker）在 360–500px 高度内全部可见，参考游戏机街机面板的信息密度。
- **游戏感**：按钮保持彩色渐变（绿/红/紫），像素字体保留 Press Start 2P，不因为小屏就退化成"纯文字扁平"风格。

---

## 2. 色板

> 移动端与 PC 端完全共享同一套色彩 token，无需额外补充。

| Token 用途             | 值                                          | 状态     |
|------------------------|---------------------------------------------|----------|
| 背景主色               | `linear-gradient(135deg,#0a1438,#1a2858)`   | 沿用 PC  |
| SideBar 背景           | `linear-gradient(180deg,#0e1b3d,#0a1438)`   | 沿用 PC  |
| 盲注/目标数字          | `#fbbf24`（amber-400）                      | 沿用 PC  |
| 分数/筹码              | `#60a5fa`（blue-400）                       | 沿用 PC  |
| 倍率                   | `#f87171`（red-400）                        | 沿用 PC  |
| 手数资源               | `#e2e8f0`（slate-200）                      | 沿用 PC  |
| 弃牌资源               | `#fb7185`（rose-400）                       | 沿用 PC  |
| 出牌按钮               | `linear-gradient(180deg,#34d399,#059669)`   | 沿用 PC  |
| 弃牌按钮               | `linear-gradient(180deg,#fb7185,#dc2626)`   | 沿用 PC  |
| AI 按钮                | `linear-gradient(180deg,#c084fc,#7e22ce)`   | 沿用 PC  |
| 竖屏遮罩背景           | `rgba(10,20,56,0.97)`                       | 移动端新增 |
| 竖屏遮罩图标色         | `#fbbf24`                                   | 沿用 PC amber |

---

## 3. 间距系统（移动端紧凑模式 token）

```
--gap-xs:  4px    /* 卡牌间距、小元素间 */
--gap-sm:  6px    /* 按钮组内间距 */
--gap-md:  8px    /* 面板内 padding、主要间隔 */
--gap-lg:  10px   /* 按钮行 padding-top */
--pad-card: 4px   /* PlayingCard 内边距 */
--pad-wrap: 8px   /* 各区域 wrapper padding */
--btn-h:   36px   /* 操作按钮最小高度（触摸友好 ≥36px） */
--btn-sort-h: 30px /* 排序按钮最小高度 */
```

### 移动端关键尺寸汇总

| 元素                  | PC 端           | 移动端紧凑       |
|-----------------------|-----------------|-----------------|
| SideBar 宽度          | min(28vw,480px) min-width:280px | min(22vw,200px) min-width:160px |
| SideBar padding       | 16px 14px       | 8px 8px         |
| SideBar gap           | 10px            | 5px             |
| play-layout rows      | 230px 1fr 280px | 130px 1fr 175px |
| HandArea wrapper pad  | 0 16px 16px     | 0 8px 8px       |
| 手牌卡片              | 100×145px       | 60×88px         |
| 出牌区卡片            | 90×130px        | 54×78px         |
| 牌堆尺寸              | 90×130px        | 54×78px         |
| 牌堆定位              | bottom:16 right:16 | bottom:8 right:8 |
| 操作按钮 min-height   | 52px            | 36px            |
| 排序按钮 min-height   | 40px            | 30px            |
| 操作按钮 font-size    | 15px            | 11px            |
| 操作按钮 padding      | 14px 20px       | 6px 10px        |
| 手牌选中上移          | translateY(-28px) | translateY(-16px) |
| 设置按钮尺寸          | 44×44px         | 34×34px         |
| Joker 区 padding      | 12px 16px 8px   | 6px 8px 4px     |
| Joker 区 title 字号   | 14px            | 10px            |

---

## 4. ASCII 线框图

> 注意：所有线框宽度 ≤ 80 字符。`[ ]` = 按钮，`≡` = 卡背/牌堆，字母 = 区域标识。

---

### 场景 A：手机竖屏 → 「请横屏游玩」遮罩

```
┌──────────────────────────────┐  ← 手机屏幕（竖屏，约320×568px）
│                              │
│                              │
│                              │
│         ╔══════════╗         │
│         ║          ║         │
│         ║    ⟳     ║         │  ← 图标旋转动画（rotate 0→90°，1.5s loop）
│         ║  (64px)  ║         │
│         ║          ║         │
│         ╚══════════╝         │
│                              │
│       请 横 屏 游 玩         │  ← font-size:20px, font-weight:700, #e2e8f0
│                              │
│                              │
└──────────────────────────────┘

遮罩层规范：
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(135deg, #0a1438 0%, #1a2858 50%, #0a1438 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 20px;

触发条件：@media (max-width: 768px) and (orientation: portrait)
  → .rotate-prompt { display: flex }
游戏内容层（.layout）不做任何处理，遮罩完全覆盖。
```

---

### 场景 B：手机横屏小屏（高度 375px，宽约 667px）— playing 状态（核心场景）

```
┌─────────────────────────────────────────────────────────────────────┐
│ 宽约667px × 高375px（iPhone SE 横屏）                               │
│ ╔══════╦═══════════════════════════════════════════════════════════╗ │
│ ║ SIDE ║  JOKER 区（高130px）                               [⚙34] ║ │
│ ║  BAR ║  JOKERS 0/5  [J1][J2][J3][J4][J5]空槽            ...    ║ │
│ ║160px ╠═══════════════════════════════════════════════════════════╣ │
│ ║      ║  出牌区（高度：375-130-175=70px + flex余量）              ║ │
│ ║ 盲注 ║  ┌─────────────────────────────────────────────────┐     ║ │
│ ║ 小盲 ║  │          出牌区（played cards 居中）             │     ║ │
│ ║ 目标 ║  │  [54×78][54×78][54×78][54×78][54×78]           │ ≡≡  ║ │
│ ║ 得分 ║  │                                            牌堆 │ ≡≡  ║ │
│ ║ ──── ║  └─────────────────────────────────────────────────┘     ║ │
│ ║筹码× ╠═══════════════════════════════════════════════════════════╣ │
│ ║ 倍率 ║  手牌区（高175px）                                        ║ │
│ ║ ──── ║  手牌行（60×88px，间距4px，padding-top 8px）              ║ │
│ ║手 弃 ║  [♠A][♥K][♣Q][♦J][♠10][♥9][♣8][♦7]                     ║ │
│ ║ $金币 ║  ────────────────────────────────────────────────        ║ │
│ ║ 计时 ║  按钮行（padding-top:10px, gap:6px, flex nowrap）         ║ │
│ ║ ante ║  [按数][按色] [出牌 3] [弃牌 2]          [🤖AI出牌]       ║ │
│ ║[重启]║                                                           ║ │
│ ╚══════╩═══════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────────────┘

关键数字：
  SideBar: width=min(22vw,200px)=约147px; min-width:160px → 实际160px
  主区域宽: 667-160=507px
  play-layout rows: 130px  1fr  175px
  1fr = 375-130-175 = 70px（出牌区净高，但 flex:1 撑满剩余）
  
  出牌区 deck-pile: bottom:8px; right:8px; width:54px; height:78px
  手牌选中: translateY(-16px)（不超出手牌区域上边界）
  操作按钮: min-height:36px（满足触摸友好 ≥36px）
```

---

### 场景 C：竖屏遮罩消失后过渡动效说明

```
时序图（设备从竖屏旋转至横屏）：

  t=0ms   设备旋转事件触发（orientation: landscape）
            ↓
  t=0ms   CSS 媒体查询立即隐藏 .rotate-prompt（display:none）
            ↓
  t=0ms   .layout 变为可见（无额外过渡，避免白屏感）
            ↓
  t=0–300ms  游戏布局自动以 CSS transition 过渡：
               - SideBar width transition: width 0.3s ease（已有）
               - play-layout grid rows 无 transition（避免布局抖动）
               - 操作按钮 flex-wrap:nowrap 立即生效
            ↓
  t=300ms  布局稳定，游戏可操作

视觉效果规范（在 App.vue <style> 中添加）：
  .rotate-prompt {
    /* 消失动画：淡出+缩放 */
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  /* 当 orientation:landscape 时 display:none 会覆盖 transition，
     需要先 opacity:0，再延迟 display:none。
     实现方式：使用 v-if + Vue Transition 组件包裹 rotate-prompt，
     leave-active: opacity 0.25s, transform scale(0.95) */

推荐实现（App.vue template 改动）：
  <Transition name="rotate-fade">
    <div v-if="isPortrait" class="rotate-prompt">...</div>
  </Transition>

  CSS:
  .rotate-fade-leave-active { transition: opacity 0.25s ease; }
  .rotate-fade-leave-to     { opacity: 0; }

  isPortrait 通过 window.matchMedia 或 screen.orientation 响应式计算。
```

---

### 场景 D：平板/PC 浏览器（宽 ≥ 900px）— 对比图（证明 PC 版不受影响）

```
┌────────────────────────────────────────────────────────────────────────┐
│  浏览器宽1280px × 高720px（PC 标准布局，不触发移动端媒体查询）          │
│ ╔════════════════╦══════════════════════════════════════════════════╗  │
│ ║   SideBar      ║   JOKER 区（高230px）                           ║  │
│ ║ width:min(28vw,║   JOKERS  [J1][J2][J3][J4][J5]                 ║  │
│ ║   480px)       ║                                                 ║  │
│ ║ min-w:280px    ╠══════════════════════════════════════════════════╣  │
│ ║                ║   出牌区（高度：1fr，约 210px）                  ║  │
│ ║  盲注面板      ║                                                 ║  │
│ ║                ║   [90×130] [90×130] [90×130] [90×130] [90×130] ║  │
│ ║  得分面板      ║                                        ╔══════╗ ║  │
│ ║                ║                                        ║ 牌堆 ║ ║  │
│ ║  筹码×倍率     ║                                        ║90×130║ ║  │
│ ║                ║                                        ╚══════╝ ║  │
│ ║  手数/弃牌     ╠══════════════════════════════════════════════════╣  │
│ ║                ║   手牌区（高280px）                              ║  │
│ ║  金币          ║   [100×145] [100×145] ... (8张，gap:8px)        ║  │
│ ║                ║   选中牌: translateY(-28px)                     ║  │
│ ║  计时器        ║   ─────────────────────────────────────────     ║  │
│ ║  Ante信息      ║   [按点数][按花色]  [出牌 3]  [弃牌 2]  [🤖AI] ║  │
│ ║  [重新开始]    ║   min-height:52px  padding:14px 20px            ║  │
│ ╚════════════════╩══════════════════════════════════════════════════╝  │
│                                                                        │
│  媒体查询不触发，所有 CSS 均为默认值，与移动端媒体查询块完全隔离        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 组件级改动规范

每个组件只列出 `@media (max-height: 500px) and (orientation: landscape)` 块内的 key CSS 差异值。PC 端默认值保持不变。

---

### 5.1 App.vue

**竖屏遮罩层（全局 style）**

```css
/* PC 端默认 */
.rotate-prompt {
  display: none;
}

/* 竖屏触发 */
@media (max-width: 768px) and (orientation: portrait) {
  .rotate-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: linear-gradient(135deg, #0a1438 0%, #1a2858 50%, #0a1438 100%);
    gap: 20px;
  }
  .rotate-icon {
    font-size: 64px;
    animation: rotateHint 1.5s ease-in-out infinite;
  }
  .rotate-text {
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
    font-family: 'Inter', 'PingFang SC', sans-serif;
  }
  @keyframes rotateHint {
    0%, 100% { transform: rotate(0deg); }
    50%       { transform: rotate(90deg); }
  }
}

/* 横屏小屏 — play-layout */
@media (max-height: 500px) and (orientation: landscape) {
  /* PC 端默认值 */
  /* .play-layout { grid-template-rows: 230px 1fr 280px; } */

  .play-layout {
    grid-template-rows: 130px 1fr 175px;
  }
  .joker-area {
    padding: 6px 8px 4px;
  }
  .joker-area-header {
    margin-bottom: 5px;
  }
  .joker-area-title {
    font-size: 10px;         /* PC: 14px */
  }
  .joker-count-badge {
    font-size: 9px;          /* PC: 12px */
  }
  .joker-slots-row {
    gap: 7px;                /* PC: 12px */
  }
  .settings-btn {
    top: 8px;
    right: 8px;
    width: 34px;             /* PC: 44px */
    height: 34px;            /* PC: 44px */
    font-size: 16px;         /* PC: 20px */
  }
  .big-score-box {
    padding: 12px 20px;      /* PC: 20px 32px */
  }
  .bsb-hand-name { font-size: 13px; margin-bottom: 8px; }  /* PC: 18px, 12px */
  .bsb-chips     { font-size: 14px; }   /* PC: 20px */
  .bsb-x, .bsb-eq { font-size: 11px; } /* PC: 16px */
  .bsb-mult      { font-size: 14px; }   /* PC: 20px */
  .bsb-score     { font-size: 17px; }   /* PC: 24px */
}
```

---

### 5.2 SideBar.vue

```css
/* PC 端默认值参考 */
/* .sidebar { width: min(28vw, 480px); min-width: 280px; padding: 16px 14px; gap: 10px; } */

@media (max-height: 500px) and (orientation: landscape) {
  .sidebar {
    width: min(22vw, 200px);  /* PC: min(28vw, 480px) */
    min-width: 160px;          /* PC: 280px */
    padding: 8px 8px;          /* PC: 16px 14px */
    gap: 5px;                  /* PC: 10px */
  }
  .logo {
    font-size: 11px;           /* PC: 18px */
    padding: 2px 0;            /* PC: 4px 0 */
  }
  .blind-panel   { padding: 6px 8px; }   /* PC: 10px 12px */
  .blind-icon    { font-size: 13px; }    /* PC: 18px */
  .blind-badge   { font-size: 9px; }     /* PC: 11px */
  .blind-name    { font-size: 11px; }    /* PC: 14px */
  .blind-target-value { font-size: 20px; } /* PC: 28px */
  .blind-reward  { font-size: 8px; }     /* PC: 10px */

  .score-panel   { padding: 6px 8px; }   /* PC: 10px 12px */
  .score-label   { font-size: 9px; }     /* PC: 11px */
  .score-value   { font-size: 30px; }    /* PC: 44px */

  .hand-score-panel { padding: 5px 8px; } /* PC: 8px 12px */
  .hand-type-name   { font-size: 10px; margin-bottom: 3px; } /* PC: 13px, 6px */
  .chips-value, .mult-value { font-size: 10px; } /* PC: 14px */
  .chips-label, .mult-label { font-size: 7px; }  /* PC: 9px */
  .mult-sep         { font-size: 10px; }  /* PC: 14px */

  .resources-row { gap: 5px; }            /* PC: 8px */
  .resource-panel { padding: 5px; }       /* PC: 8px */
  .resource-label { font-size: 8px; }     /* PC: 10px */
  .resource-value { font-size: 24px; }    /* PC: 34px */

  .coins-panel  { padding: 5px 8px; }    /* PC: 8px 12px */
  .coins-sign   { font-size: 14px; }     /* PC: 20px */
  .coins-value  { font-size: 30px; }     /* PC: 44px */

  .timer-panel  { padding: 5px 8px; }    /* PC: 8px 12px */
  .timer-label  { font-size: 8px; }      /* PC: 10px */
  .timer-value  { font-size: 22px; }     /* PC: 34px */

  .ante-info    { font-size: 8px; }      /* PC: 10px */

  .px-btn.restart-btn {
    min-height: 36px;   /* PC: 52px */
    padding: 8px 12px;  /* PC: 14px 26px */
    font-size: 11px;    /* PC: 16px */
  }
}
```

---

### 5.3 HandArea.vue（含操作按钮行）

```css
/* PC 端默认值参考 */
/* .hand-area-wrapper { padding: 0 16px 16px; } */
/* .action-buttons-row { padding-top: 36px; gap: 10px; flex-wrap: wrap; } */
/* .px-btn { min-height: 52px; padding: 14px 20px; font-size: 15px; } */
/* .sort-btn { min-height: 40px; padding: 8px 14px; font-size: 13px; } */

@media (max-height: 500px) and (orientation: landscape) {
  .hand-area-wrapper {
    padding: 0 8px 8px;      /* PC: 0 16px 16px */
  }
  .hand-cards-row {
    gap: 4px;                /* PC: 8px */
    padding-top: 8px;        /* PC: 20px */
  }
  .action-buttons-row {
    padding-top: 10px;       /* PC: 36px */
    gap: 6px;                /* PC: 10px */
    flex-wrap: nowrap;       /* PC: wrap — 强制单行，防止按钮占用手牌空间 */
  }
  .sort-group {
    gap: 4px;                /* PC: 6px */
  }
  .px-btn {
    min-height: 36px;        /* PC: 52px — 满足触摸最小 36px */
    padding: 6px 10px;       /* PC: 14px 20px */
    font-size: 11px;         /* PC: 15px */
    border-radius: 8px;      /* PC: 12px */
  }
  .sort-btn {
    min-height: 30px;        /* PC: 40px */
    padding: 5px 8px;        /* PC: 8px 14px */
    font-size: 10px;         /* PC: 13px */
  }
}
```

**布局决策说明**

操作按钮行（出牌/弃牌/排序/AI）设为 `flex-wrap: nowrap`，在 507px（主区域宽度）下，四组按钮总宽约：
- 排序组：(按点数 ~60px) + (按花色 ~60px) + gap4 = 124px
- 出牌按钮：~80px
- 弃牌按钮：~70px
- AI按钮：~90px
- gaps(3×6px): 18px
- 合计约 382px < 507px，单行可容纳，不会换行遮挡手牌。

---

### 5.4 PlayArea.vue（含出牌区、牌堆）

```css
/* PC 端默认值参考 */
/* .play-area-wrapper { padding: 12px 16px 8px; } */
/* .played-card { width: 90px; height: 130px; } */
/* .deck-pile { width: 90px; height: 130px; bottom: 16px; right: 16px; } */
/* .deck-card { width: 90px; height: 130px; } */

@media (max-height: 500px) and (orientation: landscape) {
  .play-area-wrapper {
    padding: 6px 8px 4px;    /* PC: 12px 16px 8px */
  }
  .play-area-label {
    font-size: 9px;           /* PC: 11px */
    margin-bottom: 4px;       /* PC: 6px */
  }
  .played-cards-row {
    gap: 4px;                 /* PC: 8px */
    padding: 8px;             /* PC: 16px */
  }
  .played-card {
    width: 54px;              /* PC: 90px  — 缩放比约0.6× */
    height: 78px;             /* PC: 130px — 缩放比约0.6× */
    border-radius: 6px;       /* PC: 8px */
    padding: 4px;             /* PC: 6px */
  }
  .pc-rank   { font-size: 10px; }   /* PC: 14px */
  .pc-suit   { font-size: 8px; }    /* PC: 10px */
  .pc-center { font-size: 18px; }   /* PC: 28px */

  /* 牌堆等比缩放（54/90 ≈ 0.6×） */
  .deck-pile {
    width: 54px;              /* PC: 90px */
    height: 78px;             /* PC: 130px */
    bottom: 8px;              /* PC: 16px */
    right: 8px;               /* PC: 16px */
  }
  .deck-card {
    width: 54px;              /* PC: 90px */
    height: 78px;             /* PC: 130px */
    border-radius: 6px;       /* PC: 8px */
  }
  .deck-count { font-size: 22px; }  /* PC: 32px */

  /* 分数弹窗 */
  .score-popup {
    padding: 7px 12px;        /* PC: 12px 20px */
    gap: 5px;                 /* PC: 8px */
    border-radius: 8px;       /* PC: 12px */
  }
  .score-popup-chips  { font-size: 11px; }  /* PC: 16px */
  .score-popup-x      { font-size: 9px; }   /* PC: 14px */
  .score-popup-mult   { font-size: 11px; }  /* PC: 16px */
  .score-popup-eq     { font-size: 9px; }   /* PC: 14px */
  .score-popup-score  { font-size: 13px; }  /* PC: 20px */
}
```

---

### 5.5 PlayingCard.vue

```css
/* PC 端默认值参考 */
/* .playing-card { width: 100px; height: 145px; border-radius: 10px; } */
/* .playing-card.selected { transform: translateY(-28px); } */

@media (max-height: 500px) and (orientation: landscape) {
  .playing-card {
    width: 60px;              /* PC: 100px */
    height: 88px;             /* PC: 145px */
    border-radius: 6px;       /* PC: 10px */
  }
  .playing-card.selected {
    transform: translateY(-16px); /* PC: translateY(-28px) */
  }
  .playing-card:hover {
    transform: translateY(-5px);  /* PC: translateY(-8px) */
  }
  .card-rank        { font-size: 11px; }  /* PC: 16px */
  .card-suit        { font-size: 8px; }   /* PC: 12px */
  .card-center-suit { font-size: 22px; }  /* PC: 32px */
  .card-inner       { padding: 4px; }     /* PC: 6px */
  .card-corner.bottom-right {
    bottom: 4px;              /* PC: 6px */
    right: 4px;               /* PC: 6px */
  }
}
```

---

## 6. 关键交互细节

### 6.1 竖屏 → 横屏遮罩消失时机与动效

**时机**：依赖 CSS `orientation: portrait/landscape` 媒体查询，设备旋转后浏览器立即重新计算媒体查询，遮罩层 `display:none` 生效。

**推荐动效实现**（App.vue 改造方案，不影响逻辑代码）：

```javascript
// App.vue <script> — 在 data() 中新增
isPortrait: window.matchMedia('(orientation: portrait)').matches

// mounted() 中新增
mounted() {
  this._mq = window.matchMedia('(orientation: portrait)')
  this._mqHandler = (e) => { this.isPortrait = e.matches }
  this._mq.addEventListener('change', this._mqHandler)
},
beforeUnmount() {
  this._mq.removeEventListener('change', this._mqHandler)
  // ...已有 stopTurnTimer
}
```

```html
<!-- template 中替换原有 .rotate-prompt -->
<Transition name="rotate-fade">
  <div v-if="isPortrait" class="rotate-prompt">
    <div class="rotate-icon">⟳</div>
    <div class="rotate-text">请横屏游玩</div>
  </div>
</Transition>
```

```css
/* 全局 style 中添加 */
.rotate-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.rotate-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
```

**效果**：旋转后 0.25s 渐隐 + 轻微缩小消失，游戏布局立即可见。

---

### 6.2 操作按钮在小屏下如何布局不遮挡手牌

**核心策略：高度预算分配**

```
play-layout 总高度：375px（最小值）
├── Joker 区：130px（含 padding）
├── 出牌区：1fr = 375 - 130 - 175 = 70px（最小，flex 撑满）
└── HandArea：175px
    ├── 手牌行：flex:1 = 175 - 10(padding-top按钮) - 36(按钮高) - 8(bottom-pad) - 8(top-pad) ≈ 113px
    └── 按钮行：10px(padding-top) + 36px(min-height) + 8px(padding-bottom) = 54px
```

手牌高度 113px，卡牌 88px + 16px选中上移 = 104px，剩余 9px padding 缓冲，卡牌顶部不会触碰 Joker 区。

**按钮行不换行（flex-wrap: nowrap）**：在 507px 主区域宽度内，4 个按钮组线性排列宽约 382px，有 125px 余量，绝对不换行。一旦换行，按钮会叠到手牌上方，故强制 `nowrap`。

**按钮与手牌的空间分隔**：按钮行有 `padding-top: 10px`，该空白是唯一的视觉分隔，不用额外分隔线。

---

### 6.3 牌堆在移动端的定位方式

**保持 `position: absolute`**（不改为 fixed），理由：
1. 飞牌动效 `flyCardFromDeck()` 依赖 `deckPileEl.getBoundingClientRect()` 获取绝对屏幕坐标，absolute 和 fixed 对 getBoundingClientRect 返回值相同，不影响动效逻辑。
2. 避免引入新的层叠上下文问题。

**移动端位置调整**：
```css
/* PC: bottom:16px; right:16px */
/* 移动端: */
.deck-pile {
  bottom: 8px;   /* 节省 8px 空间给出牌区内容 */
  right: 8px;
}
```

牌堆 54×78px，在出牌区（高约 70px+1fr）右下角，与出牌牌（54×78px）不重叠（出牌牌居中排列，5 张最宽约 54×5 + 4×4 = 286px，出牌区宽约 507px，居中后两侧各留约 110px 余量，牌堆在右侧不冲突）。

---

## 7. 总结

### 气质定位

移动端横屏设计遵循「**零妥协密度**」原则：在 360–500px 的极端高度限制下，选择压缩间距而非简化信息，确保玩家在手机上获得与 PC 端等量的游戏信息。字体缩小但保留像素风格，按钮缩小但保持彩色渐变，出牌区卡牌以 0.6× 等比缩放而非裁切，整体保留桌游的「信息仪表盘」质感。

### 主色选择理由

沿用 PC 端全部色彩 token，移动端不引入新颜色。原因：移动端屏幕小、信息密集，若引入差异色会产生认知割裂；游戏 amber/blue/red 三色体系在小尺寸下对比度依然足够（amber #fbbf24 对深蓝背景对比比 > 7:1）。

### 最关键的 3 个布局决策

1. **SideBar 宽度从 280px 压缩至 160px**：释放 120px 给主游戏区（出牌+手牌），是移动端可玩性的根本保证。160px 是 SideBar 信息在 8px 字号下仍可辨识的最小宽度。

2. **play-layout rows 从 `230px 1fr 280px` 改为 `130px 1fr 175px`**：Joker 区节省 100px（Joker 卡片缩小后不需要那么高），HandArea 节省 105px（卡牌 88px + 按钮 36px + padding 51px = 175px 刚好够用），两处节省共 205px，直接决定了 360px 高度下是否能无滚动显示所有内容。

3. **操作按钮 flex-wrap: nowrap + min-height: 36px**：强制按钮单行排列避免换行遮挡手牌，同时保证触摸点击区域 ≥ 36px 满足移动端交互标准。这两个约束看似矛盾（单行要小，触摸要大），通过缩小字号和 padding 而非缩小 min-height 来化解。
