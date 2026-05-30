<template>
  <div class="app-root">
    <!-- Settings button -->
    <button class="settings-btn" @click="showSettings = true">⚙️</button>

    <!-- Settings Modal -->
    <SettingsModal
      :visible="showSettings"
      @close="showSettings = false"
      @settings-changed="onSettingsChanged"
      ref="settingsModal"
    />

    <!-- Playing card flyout layer -->
    <div class="fly-layer" ref="flyLayer"></div>

    <div class="layout">
      <!-- Left sidebar -->
      <SideBar
        :current-blind="currentBlind"
        :blind-index="gameState.currentBlindIndex"
        :round-score="gameState.roundScore"
        :hands-left="gameState.handsLeft"
        :discards-left="gameState.discardsLeft"
        :coins="gameState.coins"
        :round-number="gameState.roundNumber"
        :current-hand-type="gameState.currentHandType"
        :current-chips="gameState.currentChips"
        :current-mult="gameState.currentMult"
        @restart="startGame"
        ref="sidebarRef"
      />

      <!-- Main area -->
      <div class="main-area">
        <!-- Won / Lost end view -->
        <template v-if="gameState.phase === 'won' || gameState.phase === 'lost'">
          <EndView
            :phase="gameState.phase"
            :round-number="gameState.roundNumber"
            :blind-name="currentBlind.name"
            :target-score="currentBlind.target"
            :final-score="gameState.roundScore"
            :joker-count="gameState.ownedJokers.length"
            :coins="gameState.coins"
            @restart="startGame"
          />
        </template>

        <!-- Shop view -->
        <template v-else-if="gameState.phase === 'shop'">
          <ShopView
            :shop-jokers="gameState.shopJokers"
            :owned-jokers="gameState.ownedJokers"
            :coins="gameState.coins"
            :joker-slots="JOKER_SLOTS"
            :hands-remaining="shopHandsRemaining"
            :reward-amount="shopRewardAmount"
            :ai-suggested-id="aiSuggestedJokerId"
            @buy="buyJoker"
            @skip="proceedFromShop"
            @ai-suggest="doAiSuggest"
          />
        </template>

        <!-- Playing view -->
        <template v-else>
          <div class="play-layout">
            <!-- Row 1: Joker area -->
            <div class="joker-area">
              <div class="joker-area-header">
                <span class="joker-area-title">JOKERS</span>
                <span class="joker-count-badge">{{ gameState.ownedJokers.length }}/{{ JOKER_SLOTS }}</span>
              </div>
              <div class="joker-slots-row">
                <JokerCard
                  v-for="i in JOKER_SLOTS"
                  :key="i"
                  :joker="gameState.ownedJokers[i - 1] || null"
                  :glowing="glowingJokerIndex === (i - 1)"
                />
              </div>
            </div>

            <!-- Row 2: Play area -->
            <PlayArea
              :played-cards="gameState.playArea"
              :deck-count="gameState.deck.length"
              :highlighted-card-ids="highlightedCardIds"
              ref="playAreaRef"
            />

            <!-- Row 3: Hand area -->
            <HandArea
              :hand-cards="gameState.hand"
              :selected-card-ids="gameState.selectedCardIds"
              :discards-left="gameState.discardsLeft"
              :animating="gameState.animating"
              :ai-thinking="aiThinking"
              @card-click="toggleCardSelect"
              @sort-rank="sortByRank"
              @sort-suit="sortBySuit"
              @play="handlePlay"
              @discard="handleDiscard"
              @ai-play="handleAiPlay"
              ref="handAreaRef"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Big score popup (teleported to body) -->
    <Teleport to="body">
      <div v-if="showBigScorePopup" class="big-score-teleport">
        <div class="big-score-box" :key="bigScoreKey">
          <div class="bsb-hand-name">{{ bigScoreHandName }}</div>
          <div class="bsb-formula">
            <span class="bsb-chips">{{ bigScoreChips }}</span>
            <span class="bsb-x">&#xD7;</span>
            <span class="bsb-mult">{{ bigScoreMultDisplay }}</span>
            <span class="bsb-eq">=</span>
            <span class="bsb-score">{{ bigScoreValue }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import SideBar from './components/SideBar.vue'
import JokerCard from './components/JokerCard.vue'
import PlayArea from './components/PlayArea.vue'
import HandArea from './components/HandArea.vue'
import ShopView from './components/ShopView.vue'
import EndView from './components/EndView.vue'
import SettingsModal from './components/SettingsModal.vue'

import { createDeck, shuffleDeck, identifyHand, calculateScore, findBestPlay, findBestJokerBuy } from './composables/useCardEngine.js'
import { BLINDS, JOKER_SLOTS, HAND_SIZE, HANDS_PER_ROUND, DISCARDS_PER_ROUND } from './composables/useGameState.js'
import { createFloatingText } from './composables/useAnimations.js'

const SETTINGS_KEY = 'balatro.settings'

function loadSettings() {
  try {
    const s = localStorage.getItem(SETTINGS_KEY)
    if (s) return { bgmVolume: 50, sfxVolume: 70, animSpeed: 'normal', showFormulaPreview: true, ...JSON.parse(s) }
  } catch (e) {}
  return { bgmVolume: 50, sfxVolume: 70, animSpeed: 'normal', showFormulaPreview: true }
}

function getAnimMultiplier(settings) {
  const speed = settings && settings.animSpeed ? settings.animSpeed : 'normal'
  if (speed === 'slow') return 1.5
  if (speed === 'fast') return 0.6
  return 1.0
}

let cardIdCounter = 0

const JOKER_CATALOG = [
  { id: 'joker_jester', name: '小丑', price: 3, art: '🃏', desc: '每手 +4 倍率' },
  { id: 'joker_scholar', name: '学者', price: 3, art: '📖', desc: '打出的牌每张 A：+4 倍率' },
  { id: 'joker_hearts', name: '红心收藏家', price: 5, art: '❤️', desc: '打出的牌里含 ♥ 时，倍率 ×4' },
  { id: 'joker_clubs', name: '梅花爱好者', price: 5, art: '♣', desc: '打出的牌里含 ♣ 时，倍率 ×4' },
  { id: 'joker_royals', name: '皇家头牌', price: 5, art: '👑', desc: '打出的牌里含 J/Q/K 时，倍率 ×10' },
  { id: 'joker_sf_master', name: '同花顺大师', price: 8, art: '🔥', desc: '打出同花顺时 +50 倍率' }
]

export default {
  name: 'App',
  components: { SideBar, JokerCard, PlayArea, HandArea, ShopView, EndView, SettingsModal },

  data() {
    return {
      JOKER_SLOTS,
      BLINDS,

      showSettings: false,
      settings: loadSettings(),

      gameState: {
        phase: 'playing',
        currentBlindIndex: 0,
        roundNumber: 1,
        roundScore: 0,
        coins: 0,
        handsLeft: HANDS_PER_ROUND,
        discardsLeft: DISCARDS_PER_ROUND,
        deck: [],
        hand: [],
        playArea: [],
        ownedJokers: [],
        shopJokers: [],
        selectedCardIds: [],
        animating: false,
        currentHandType: null,
        currentChips: 0,
        currentMult: 0,
        currentComputedScore: 0,
      },

      glowingJokerIndex: -1,
      highlightedCardIds: [],

      showBigScorePopup: false,
      bigScoreKey: 0,
      bigScoreHandName: '',
      bigScoreChips: 0,
      bigScoreMultDisplay: 0,
      bigScoreValue: 0,

      aiThinking: false,
      aiSuggestedJokerId: null,

      shopHandsRemaining: 0,
      shopRewardAmount: 5,
    }
  },

  computed: {
    currentBlind() {
      const idx = Math.min(this.gameState.currentBlindIndex, BLINDS.length - 1)
      return BLINDS[idx]
    }
  },

  mounted() {
    this.startGame()
  },

  methods: {
    onSettingsChanged(settings) {
      this.settings = Object.assign({}, settings)
    },

    getAnimMs(base) {
      return Math.round(base * getAnimMultiplier(this.settings))
    },

    sleep(ms) {
      return new Promise(function(r) { setTimeout(r, ms) })
    },

    startGame() {
      this.gameState.phase = 'playing'
      this.gameState.currentBlindIndex = 0
      this.gameState.roundNumber = 1
      this.gameState.coins = 0
      this.gameState.ownedJokers = []
      this.gameState.roundScore = 0
      this.gameState.handsLeft = HANDS_PER_ROUND
      this.gameState.discardsLeft = DISCARDS_PER_ROUND
      this.gameState.selectedCardIds = []
      this.gameState.playArea = []
      this.gameState.currentHandType = null
      this.gameState.currentChips = 0
      this.gameState.currentMult = 0
      this.gameState.currentComputedScore = 0
      this.gameState.animating = false
      this.glowingJokerIndex = -1
      this.highlightedCardIds = []
      this.showBigScorePopup = false
      this.aiThinking = false
      this.aiSuggestedJokerId = null

      this.initDeckAndDeal()
    },

    initDeckAndDeal() {
      const deck = createDeck()
      const shuffled = shuffleDeck(deck)
      this.gameState.deck = shuffled
      this.gameState.hand = []
      this.dealCardsWithAnim(HAND_SIZE)
    },

    startNewRound() {
      this.gameState.roundScore = 0
      this.gameState.handsLeft = HANDS_PER_ROUND
      this.gameState.discardsLeft = DISCARDS_PER_ROUND
      this.gameState.selectedCardIds = []
      this.gameState.playArea = []
      this.gameState.currentHandType = null
      this.gameState.currentChips = 0
      this.gameState.currentMult = 0
      this.gameState.currentComputedScore = 0
      this.gameState.animating = false

      const deck = createDeck()
      const shuffled = shuffleDeck(deck)
      this.gameState.deck = shuffled
      this.gameState.hand = []
      this.dealCardsWithAnim(HAND_SIZE)
    },

    dealCard() {
      if (this.gameState.deck.length === 0) {
        const newDeck = createDeck()
        this.gameState.deck = shuffleDeck(newDeck)
      }
      const card = this.gameState.deck.pop()
      cardIdCounter++
      return Object.assign({}, card, { _uid: cardIdCounter })
    },

    async dealCardsWithAnim(count) {
      const stagger = this.getAnimMs(60)
      const newCards = []
      for (let i = 0; i < count; i++) {
        newCards.push(this.dealCard())
      }
      for (let i = 0; i < newCards.length; i++) {
        await this.sleep(stagger)
        this.gameState.hand.push(newCards[i])
      }
    },

    async dealReplacementCards(count) {
      const stagger = this.getAnimMs(60)
      for (let i = 0; i < count; i++) {
        await this.sleep(stagger)
        const c = this.dealCard()
        this.gameState.hand.push(c)
      }
    },

    toggleCardSelect(card) {
      if (this.gameState.animating) return
      const idx = this.gameState.selectedCardIds.indexOf(card.id)
      if (idx === -1) {
        if (this.gameState.selectedCardIds.length < 5) {
          this.gameState.selectedCardIds.push(card.id)
        }
      } else {
        this.gameState.selectedCardIds.splice(idx, 1)
      }
      this.updateHandPreview()
    },

    updateHandPreview() {
      const sel = this.gameState.hand.filter(function(c) {
        return this.gameState.selectedCardIds.includes(c.id)
      }.bind(this))
      if (sel.length === 0) {
        this.gameState.currentHandType = null
        this.gameState.currentChips = 0
        this.gameState.currentMult = 0
        return
      }
      const ht = identifyHand(sel)
      if (!ht) return
      const result = calculateScore(sel, this.gameState.ownedJokers, ht)
      this.gameState.currentHandType = ht
      this.gameState.currentChips = result.chips
      this.gameState.currentMult = result.mult
    },

    sortByRank() {
      const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
      this.gameState.hand.sort(function(a, b) {
        return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank)
      })
    },

    sortBySuit() {
      const suitOrder = ['♠','♥','♦','♣']
      this.gameState.hand.sort(function(a, b) {
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit)
      })
    },

    async handlePlay() {
      if (this.gameState.animating) return
      const selIds = this.gameState.selectedCardIds.slice()
      if (selIds.length === 0) return

      const playedCards = this.gameState.hand.filter(function(c) {
        return selIds.includes(c.id)
      })
      if (playedCards.length === 0) return

      this.gameState.animating = true

      const handType = identifyHand(playedCards)
      if (!handType) {
        this.gameState.animating = false
        return
      }

      // Step 1: Fly cards to play area
      await this.animateCardsToPlayArea(playedCards)

      // Move cards from hand to play area
      this.gameState.hand = this.gameState.hand.filter(function(c) {
        return !selIds.includes(c.id)
      })
      this.gameState.playArea = playedCards
      this.gameState.selectedCardIds = []

      // Step 2: Show hand type
      this.gameState.currentHandType = handType
      this.gameState.currentChips = handType.chips
      this.gameState.currentMult = handType.mult

      await this.sleep(this.getAnimMs(150))

      // Step 3: Highlight cards and add chip values
      this.highlightedCardIds = []
      let runningChips = handType.chips

      for (let i = 0; i < playedCards.length; i++) {
        await this.sleep(this.getAnimMs(150))
        this.highlightedCardIds.push(playedCards[i].id)
        runningChips += playedCards[i].points
        this.gameState.currentChips = runningChips

        // Float +N text toward chips block
        const playAreaRef = this.$refs.playAreaRef
        if (playAreaRef) {
          const cardEls = playAreaRef.$el.querySelectorAll('.played-card-slot')
          if (cardEls[i]) {
            const cardRect = cardEls[i].getBoundingClientRect()
            const sidebarRef = this.$refs.sidebarRef
            const chipsEl = sidebarRef ? sidebarRef.getChipsBlockEl() : null
            createFloatingText('+' + playedCards[i].points, '#60a5fa', cardRect, chipsEl)
          }
        }
      }

      await this.sleep(this.getAnimMs(300))

      // Step 4: Apply Joker effects
      let mult = handType.mult
      for (let ji = 0; ji < this.gameState.ownedJokers.length; ji++) {
        const joker = this.gameState.ownedJokers[ji]
        const prevMult = mult
        let multDelta = 0
        let multMultiplier = 1

        if (joker.id === 'joker_jester') {
          mult += 4
          multDelta = 4
        } else if (joker.id === 'joker_scholar') {
          const aceCount = playedCards.filter(function(c) { return c.rank === 'A' }).length
          if (aceCount > 0) {
            mult += aceCount * 4
            multDelta = aceCount * 4
          }
        } else if (joker.id === 'joker_hearts') {
          if (playedCards.some(function(c) { return c.suit === '♥' })) {
            mult *= 4
            multMultiplier = 4
          }
        } else if (joker.id === 'joker_clubs') {
          if (playedCards.some(function(c) { return c.suit === '♣' })) {
            mult *= 4
            multMultiplier = 4
          }
        } else if (joker.id === 'joker_royals') {
          if (playedCards.some(function(c) { return ['J','Q','K'].includes(c.rank) })) {
            mult *= 10
            multMultiplier = 10
          }
        } else if (joker.id === 'joker_sf_master') {
          if (handType.name === '同花顺') {
            mult += 50
            multDelta = 50
          }
        }

        if (mult !== prevMult) {
          this.glowingJokerIndex = ji
          this.gameState.currentMult = Math.round(mult)

          // Float mult text
          const jokerEls = this.$el.querySelectorAll('.joker-slots-row .joker-card')
          if (jokerEls[ji]) {
            const jokerRect = jokerEls[ji].getBoundingClientRect()
            const sidebarRef = this.$refs.sidebarRef
            const multEl = sidebarRef ? sidebarRef.getMultBlockEl() : null
            const text = multMultiplier > 1 ? 'x' + multMultiplier : '+' + multDelta + ' Mult'
            createFloatingText(text, '#f87171', jokerRect, multEl)
          }

          await this.sleep(this.getAnimMs(800))
          this.glowingJokerIndex = -1
          await this.sleep(this.getAnimMs(200))
        }
      }

      const finalChips = runningChips
      const finalMult = mult
      const finalScore = Math.floor(finalChips * finalMult)

      // Step 5: Big score popup
      if (this.settings.showFormulaPreview) {
        this.bigScoreHandName = handType.name
        this.bigScoreChips = finalChips
        this.bigScoreMultDisplay = Math.round(finalMult)
        this.bigScoreValue = finalScore
        this.bigScoreKey++
        this.showBigScorePopup = true

        await this.sleep(this.getAnimMs(800))
        this.showBigScorePopup = false
      }

      // Step 6: Add score
      this.gameState.roundScore += finalScore
      this.gameState.handsLeft--
      this.gameState.currentHandType = null

      await this.sleep(this.getAnimMs(400))

      // Clear play area
      this.gameState.playArea = []
      this.highlightedCardIds = []

      // Step 7: Deal replacement cards
      const needed = HAND_SIZE - this.gameState.hand.length
      if (needed > 0) {
        await this.dealReplacementCards(needed)
      }

      this.gameState.animating = false
      await this.sleep(100)
      this.checkRoundEnd()
    },

    async animateCardsToPlayArea(cards) {
      const handAreaRef = this.$refs.handAreaRef
      const playAreaRef = this.$refs.playAreaRef
      if (!handAreaRef || !playAreaRef) return

      const playAreaRect = playAreaRef.getPlayAreaRect()
      if (!playAreaRect) return

      const ms = this.getAnimMs(350)
      const self = this

      const promises = cards.map(function(card, i) {
        return new Promise(function(resolve) {
          const slotEl = handAreaRef.getCardSlotEl(card.id)
          if (!slotEl) { resolve(); return }

          const fromRect = slotEl.getBoundingClientRect()
          const toX = playAreaRect.left + playAreaRect.width / 2 + (i - cards.length / 2) * 100
          const toY = playAreaRect.top + playAreaRect.height / 2

          const clone = slotEl.cloneNode(true)
          clone.style.cssText = [
            'position: fixed',
            'left: ' + fromRect.left + 'px',
            'top: ' + fromRect.top + 'px',
            'width: ' + fromRect.width + 'px',
            'height: ' + fromRect.height + 'px',
            'margin: 0',
            'transition: none',
            'z-index: 500',
            'pointer-events: none'
          ].join(';')
          document.body.appendChild(clone)
          slotEl.style.visibility = 'hidden'

          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              clone.style.transition = 'all ' + ms + 'ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              clone.style.left = toX + 'px'
              clone.style.top = toY + 'px'
              clone.style.transform = 'translate(-50%, -50%)'
              clone.style.opacity = '0.8'
              setTimeout(function() {
                if (clone.parentNode) clone.parentNode.removeChild(clone)
                slotEl.style.visibility = ''
                resolve()
              }, ms)
            })
          })
        })
      })

      await Promise.all(promises)
    },

    async handleDiscard() {
      if (this.gameState.animating) return
      if (this.gameState.selectedCardIds.length === 0) return
      if (this.gameState.discardsLeft <= 0) return

      const discardIds = this.gameState.selectedCardIds.slice()
      this.gameState.hand = this.gameState.hand.filter(function(c) {
        return !discardIds.includes(c.id)
      })
      this.gameState.selectedCardIds = []
      this.gameState.discardsLeft--
      this.gameState.currentHandType = null

      await this.dealReplacementCards(discardIds.length)
    },

    checkRoundEnd() {
      const gs = this.gameState
      const blind = BLINDS[gs.currentBlindIndex]

      if (gs.roundScore >= blind.target) {
        const handsBonus = gs.handsLeft
        const reward = 5 + handsBonus
        gs.coins += reward
        this.shopHandsRemaining = handsBonus
        this.shopRewardAmount = reward

        if (gs.currentBlindIndex >= BLINDS.length - 1) {
          gs.phase = 'won'
        } else {
          gs.phase = 'shop'
          this.generateShop()
        }
      } else if (gs.handsLeft <= 0) {
        gs.phase = 'lost'
      }
    },

    generateShop() {
      const available = JOKER_CATALOG.filter(function(j) {
        return !this.gameState.ownedJokers.find(function(o) { return o.id === j.id })
      }.bind(this))
      const shuffled = available.slice().sort(function() { return Math.random() - 0.5 })
      this.gameState.shopJokers = shuffled.slice(0, 3).map(function(j) {
        return Object.assign({}, j, { purchased: false })
      })
    },

    buyJoker(jokerId) {
      const joker = this.gameState.shopJokers.find(function(j) { return j.id === jokerId })
      if (!joker || joker.purchased) return
      if (this.gameState.coins < joker.price) return
      if (this.gameState.ownedJokers.length >= JOKER_SLOTS) return

      this.gameState.coins -= joker.price
      const catalogEntry = JOKER_CATALOG.find(function(j) { return j.id === jokerId })
      if (catalogEntry) {
        this.gameState.ownedJokers.push(Object.assign({}, catalogEntry))
      }
      joker.purchased = true
    },

    proceedFromShop() {
      this.gameState.currentBlindIndex++
      this.gameState.roundNumber++
      this.gameState.phase = 'playing'
      this.aiSuggestedJokerId = null
      this.startNewRound()
    },

    async handleAiPlay() {
      if (this.gameState.animating || this.aiThinking) return
      if (this.gameState.hand.length === 0) return

      this.aiThinking = true
      await this.sleep(this.getAnimMs(800))

      const bestIds = findBestPlay(this.gameState.hand, this.gameState.ownedJokers)
      this.gameState.selectedCardIds = bestIds
      this.aiThinking = false
      this.updateHandPreview()

      await this.sleep(this.getAnimMs(200))
      await this.handlePlay()
    },

    doAiSuggest() {
      const best = findBestJokerBuy(
        this.gameState.shopJokers,
        this.gameState.ownedJokers,
        this.gameState.coins,
        JOKER_SLOTS
      )
      this.aiSuggestedJokerId = best ? best.id : null
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Inter:wght@400;700;800;900&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background: linear-gradient(135deg, #0a1438 0%, #1a2858 50%, #0a1438 100%);
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59, 130, 246, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 70%, rgba(99, 102, 241, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: waterRipple 8s ease-in-out infinite alternate;
}

@keyframes waterRipple {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.02); }
}
</style>

<style scoped>
.app-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.settings-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 2px solid rgba(0,0,0,0.3);
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.settings-btn:hover {
  background: linear-gradient(135deg, #fb923c, #f97316);
  transform: scale(1.1) rotate(15deg);
}

.fly-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 500;
}

.layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.main-area {
  flex: 1;
  height: 100vh;
  overflow: hidden;
  min-width: 0;
}

.play-layout {
  display: grid;
  grid-template-rows: 230px 1fr 280px;
  height: 100vh;
  width: 100%;
}

.joker-area {
  display: flex;
  flex-direction: column;
  padding: 12px 16px 8px;
  background: rgba(10, 15, 40, 0.3);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  overflow: hidden;
}

.joker-area-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.joker-area-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fbbf24;
  text-shadow: 1px 1px 0 #000;
}

.joker-count-badge {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #94a3b8;
}

.joker-slots-row {
  display: flex;
  gap: 12px;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.joker-slots-row::-webkit-scrollbar {
  display: none;
}

.big-score-teleport {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
  pointer-events: none;
}

.big-score-box {
  background: rgba(8, 12, 30, 0.95);
  border: 2px solid rgba(251, 191, 36, 0.6);
  border-radius: 16px;
  padding: 20px 32px;
  text-align: center;
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.2);
  animation: bsbIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bsbIn {
  from { transform: scale(0.5) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.bsb-hand-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 900;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.bsb-formula {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.bsb-chips {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #60a5fa;
}

.bsb-x, .bsb-eq {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #94a3b8;
}

.bsb-mult {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #f87171;
}

.bsb-score {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #fbbf24;
}
</style>
