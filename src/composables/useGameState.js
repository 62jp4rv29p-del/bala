import { reactive, computed } from 'vue'
import { createDeck, shuffleDeck, HAND_TYPES } from './useCardEngine.js'

export const BLINDS = [
  { name: '小盲注', target: 300, reward: 5, icon: '🔵' },
  { name: '中盲注', target: 500, reward: 5, icon: '🟡' },
  { name: '大盲注', target: 800, reward: 5, icon: '🔴' }
]

export const JOKER_CATALOG = [
  { id: 'joker_jester', name: '小丑', price: 3, art: '🃏', desc: '每手 +4 倍率' },
  { id: 'joker_scholar', name: '学者', price: 3, art: '📖', desc: '打出的牌每张 A：+4 倍率' },
  { id: 'joker_hearts', name: '红心收藏家', price: 5, art: '❤️', desc: '打出的牌里含 ♥ 时，倍率 ×4' },
  { id: 'joker_clubs', name: '梅花爱好者', price: 5, art: '♣', desc: '打出的牌里含 ♣ 时，倍率 ×4' },
  { id: 'joker_royals', name: '皇家头牌', price: 5, art: '👑', desc: '打出的牌里含 J/Q/K 时，倍率 ×10' },
  { id: 'joker_sf_master', name: '同花顺大师', price: 8, art: '🔥', desc: '打出同花顺时 +50 倍率' }
]

export const JOKER_SLOTS = 5
export const HAND_SIZE = 8
export const HANDS_PER_ROUND = 4
export const DISCARDS_PER_ROUND = 3

export function createGameState() {
  const state = reactive({
    // Game phase: 'playing' | 'shop' | 'won' | 'lost'
    phase: 'playing',

    // Current blind index (0, 1, 2)
    currentBlindIndex: 0,
    roundNumber: 1,

    // Score tracking
    roundScore: 0,

    // Resources
    coins: 0,
    handsLeft: HANDS_PER_ROUND,
    discardsLeft: DISCARDS_PER_ROUND,

    // Deck & hand
    deck: [],
    hand: [],
    playArea: [],

    // Jokers
    ownedJokers: [],

    // Shop
    shopJokers: [],

    // UI state
    selectedCardIds: [],
    animating: false,

    // Current hand calculation display
    currentHandType: null,
    currentChips: 0,
    currentMult: 0,
    currentComputedScore: 0,
  })

  const currentBlind = computed(() => BLINDS[state.currentBlindIndex])

  function initDeck() {
    const d = createDeck()
    state.deck = shuffleDeck(d)
  }

  function dealHand(count = HAND_SIZE) {
    const cards = []
    for (let i = 0; i < count && state.deck.length > 0; i++) {
      cards.push(state.deck.pop())
    }
    // Add dealt flag for animation
    return cards.map(c => ({ ...c, _dealt: true }))
  }

  function startGame() {
    state.phase = 'playing'
    state.currentBlindIndex = 0
    state.roundNumber = 1
    state.coins = 0
    state.ownedJokers = []
    state.roundScore = 0
    state.handsLeft = HANDS_PER_ROUND
    state.discardsLeft = DISCARDS_PER_ROUND
    state.selectedCardIds = []
    state.playArea = []
    state.currentHandType = null
    state.currentChips = 0
    state.currentMult = 0
    state.currentComputedScore = 0

    initDeck()
    state.hand = dealHand(HAND_SIZE)
  }

  function startNewRound() {
    state.roundScore = 0
    state.handsLeft = HANDS_PER_ROUND
    state.discardsLeft = DISCARDS_PER_ROUND
    state.selectedCardIds = []
    state.playArea = []
    state.currentHandType = null
    state.currentChips = 0
    state.currentMult = 0
    state.currentComputedScore = 0

    // Re-shuffle deck for new round
    initDeck()
    state.hand = dealHand(HAND_SIZE)
  }

  function generateShop() {
    // Pick 3 random unique jokers from catalog
    const available = JOKER_CATALOG.filter(j => !state.ownedJokers.find(o => o.id === j.id))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    state.shopJokers = shuffled.slice(0, 3).map(j => ({ ...j, purchased: false }))
  }

  function buyJoker(jokerId) {
    const joker = state.shopJokers.find(j => j.id === jokerId)
    if (!joker || joker.purchased) return false
    if (state.coins < joker.price) return false
    if (state.ownedJokers.length >= JOKER_SLOTS) return false

    state.coins -= joker.price
    state.ownedJokers.push({ ...JOKER_CATALOG.find(j => j.id === jokerId) })
    joker.purchased = true
    return true
  }

  function proceedFromShop() {
    state.currentBlindIndex++
    state.roundNumber++
    state.phase = 'playing'
    startNewRound()
  }

  return {
    state,
    currentBlind,
    initDeck,
    dealHand,
    startGame,
    startNewRound,
    generateShop,
    buyJoker,
    proceedFromShop
  }
}
