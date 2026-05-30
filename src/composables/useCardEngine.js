// Card engine: hand recognition + scoring

export const SUITS = ['♠', '♥', '♦', '♣']
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export const RANK_POINTS = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10, 'A': 11
}

export const HAND_TYPES = {
  STRAIGHT_FLUSH: { name: '同花顺', chips: 100, mult: 8 },
  FOUR_OF_A_KIND: { name: '四条', chips: 60, mult: 7 },
  FULL_HOUSE: { name: '葫芦', chips: 40, mult: 4 },
  FLUSH: { name: '同花', chips: 35, mult: 4 },
  STRAIGHT: { name: '顺子', chips: 30, mult: 4 },
  THREE_OF_A_KIND: { name: '三条', chips: 30, mult: 3 },
  TWO_PAIR: { name: '两对', chips: 20, mult: 2 },
  PAIR: { name: '对子', chips: 10, mult: 2 },
  HIGH_CARD: { name: '高牌', chips: 5, mult: 1 }
}

export function createDeck() {
  const deck = []
  let id = 0
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: id++, suit, rank, points: RANK_POINTS[rank] })
    }
  }
  return deck
}

export function shuffleDeck(deck) {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

export function identifyHand(cards) {
  if (!cards || cards.length === 0) return null
  const n = cards.length

  const rankCounts = {}
  const suitCounts = {}
  for (const c of cards) {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1
  }

  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  const isFlush = n >= 5 && Object.values(suitCounts).some(v => v >= 5)

  // Check straight
  const rankIndices = cards.map(c => RANKS.indexOf(c.rank))
  const uniqueRanks = [...new Set(rankIndices)].sort((a, b) => a - b)
  let isStraight = false
  if (uniqueRanks.length >= 5) {
    // Check 5 consecutive
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      const slice = uniqueRanks.slice(i, i + 5)
      if (slice[4] - slice[0] === 4) {
        isStraight = true
        break
      }
    }
    // Check A-low straight (A=0 actually at index 12, but treat A as 1 below 2)
    if (!isStraight && uniqueRanks.includes(12)) {
      const withLowAce = [-1, ...uniqueRanks.filter(r => r !== 12)].sort((a, b) => a - b)
      for (let i = 0; i <= withLowAce.length - 5; i++) {
        const slice = withLowAce.slice(i, i + 5)
        if (slice[4] - slice[0] === 4) {
          isStraight = true
          break
        }
      }
    }
  }

  if (isFlush && isStraight) return HAND_TYPES.STRAIGHT_FLUSH
  if (counts[0] >= 4) return HAND_TYPES.FOUR_OF_A_KIND
  if (counts[0] >= 3 && counts[1] >= 2) return HAND_TYPES.FULL_HOUSE
  if (isFlush) return HAND_TYPES.FLUSH
  if (isStraight) return HAND_TYPES.STRAIGHT
  if (counts[0] >= 3) return HAND_TYPES.THREE_OF_A_KIND
  if (counts[0] >= 2 && counts[1] >= 2) return HAND_TYPES.TWO_PAIR
  if (counts[0] >= 2) return HAND_TYPES.PAIR
  return HAND_TYPES.HIGH_CARD
}

export function calculateScore(cards, ownedJokers, handType) {
  if (!handType) return { chips: 0, mult: 1, score: 0 }

  const cardPoints = cards.reduce((sum, c) => sum + c.points, 0)
  let chips = handType.chips + cardPoints
  let mult = handType.mult

  // Apply Joker effects
  for (const joker of ownedJokers) {
    if (joker.id === 'joker_jester') {
      mult += 4
    } else if (joker.id === 'joker_scholar') {
      const aceCount = cards.filter(c => c.rank === 'A').length
      mult += aceCount * 4
    } else if (joker.id === 'joker_hearts') {
      if (cards.some(c => c.suit === '♥')) {
        mult *= 4
      }
    } else if (joker.id === 'joker_clubs') {
      if (cards.some(c => c.suit === '♣')) {
        mult *= 4
      }
    } else if (joker.id === 'joker_royals') {
      if (cards.some(c => ['J', 'Q', 'K'].includes(c.rank))) {
        mult *= 10
      }
    } else if (joker.id === 'joker_sf_master') {
      if (handType === HAND_TYPES.STRAIGHT_FLUSH) {
        mult += 50
      }
    }
  }

  return { chips, mult, score: Math.floor(chips * mult) }
}

export function calculateScoreForCards(cards, ownedJokers) {
  const handType = identifyHand(cards)
  return calculateScore(cards, ownedJokers, handType)
}

// Find best play from hand cards (AI)
export function findBestPlay(handCards, ownedJokers) {
  if (handCards.length === 0) return []
  if (handCards.length <= 5) return handCards.map(c => c.id)

  let bestScore = -1
  let bestIds = []

  // Enumerate all subsets of size 1-5
  for (let size = 1; size <= 5; size++) {
    const subsets = getCombinations(handCards, size)
    for (const subset of subsets) {
      const { score } = calculateScoreForCards(subset, ownedJokers)
      if (score > bestScore) {
        bestScore = score
        bestIds = subset.map(c => c.id)
      }
    }
  }

  return bestIds
}

function getCombinations(arr, k) {
  if (k === 0) return [[]]
  if (arr.length === 0) return []
  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c])
  const withoutFirst = getCombinations(rest, k)
  return [...withFirst, ...withoutFirst]
}

// Find best joker recommendation
export function findBestJokerBuy(shopJokers, ownedJokers, coins, jokerSlots) {
  const available = shopJokers.filter(j =>
    !j.purchased &&
    coins >= j.price &&
    ownedJokers.length < jokerSlots
  )
  if (available.length === 0) return null

  // Simple heuristic: sort by impact
  const jokerValue = (j) => {
    if (j.id === 'joker_sf_master') return j.price <= coins ? 50 / j.price : 0
    if (j.id === 'joker_royals') return 10 / j.price
    if (j.id === 'joker_hearts' || j.id === 'joker_clubs') return 4 / j.price
    if (j.id === 'joker_jester') return 4 / j.price
    if (j.id === 'joker_scholar') return 3 / j.price
    return 1 / j.price
  }

  return available.sort((a, b) => jokerValue(b) - jokerValue(a))[0]
}
