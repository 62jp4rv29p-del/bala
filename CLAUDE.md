# CLAUDE.md

## 项目定位

Balatro 风格的网页扑克游戏，Vue 3 + Vite 单页应用，纯前端，无后端依赖。
课程项目，计划 6 轮迭代：核心循环 → 学员动手 → 配乐粒子 → 自动化验收 → Tauri 跨端 → DeepSeek AI。

## 目录结构

```
src/
  App.vue                  # 根组件，游戏主状态机（playing / shop / won / lost）
  main.js
  components/
    SideBar.vue            # 左侧 HUD（盲注、分数、手数/弃牌、金币）
    PlayArea.vue           # 出牌区 + 牌堆（position: relative，牌堆 absolute 右下角）
    HandArea.vue           # 手牌区 + 操作按钮行（出牌/弃牌/排序/AI）
    JokerCard.vue          # Joker 卡片（空槽/实卡/触发动效）
    PlayingCard.vue        # 扑克牌（选中态 translateY -28px）
    ShopView.vue           # 商店界面
    EndView.vue            # 通关/失败结算界面
    SettingsModal.vue      # 设置弹窗（localStorage key: balatro.settings）
  composables/
    useCardEngine.js       # 牌型识别、计分、AI 最优出牌枚举
    useGameState.js        # 常量：BLINDS、JOKER_SLOTS、JOKER_POOL
    useAnimations.js       # 飞牌、浮字动效工具函数
public/
  card-back.png            # 牌背图片
```

## 常用命令

```bash
npm run dev      # 启动开发服务器（http://localhost:5173）
npm run build    # 构建生产版本（输出到 dist/）
npm run preview  # 本地预览构建产物
```

## 关键设计约定

- **布局**：左 sidebar `width: min(28vw, 480px); min-width: 280px`，右主区 `grid-template-rows: 230px 1fr 280px`
- **牌堆**：`position: absolute; bottom: 16px; right: 16px` 在 PlayArea 内，不用 fixed
- **字体分工**：Press Start 2P（英文装饰/Logo/chips·mult数字）/ VT323（数字大屏）/ Inter+PingFang SC（所有中文）
- **动效速度**：受设置面板「动画速度」控制（慢1.5×/普通1×/快0.6×），存 localStorage
- **通关判断**：`currentBlindIndex >= BLINDS.length - 1` 时直接进 `won`，不再进商店

## 已知待修
- 第 1 轮实施完成（v1.0.0），后续轮次见 PRD 文档
