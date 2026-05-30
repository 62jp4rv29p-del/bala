<template>
  <div
    class="playing-card"
    :class="{
      'selected': selected,
      'red-suit': isRed,
      'card-enter': entering
    }"
    @click="$emit('click', card)"
  >
    <div class="card-inner">
      <div class="card-corner top-left">
        <span class="card-rank">{{ card.rank }}</span>
        <span class="card-suit">{{ card.suit }}</span>
      </div>
      <div class="card-center-suit">{{ card.suit }}</div>
      <div class="card-corner bottom-right">
        <span class="card-rank">{{ card.rank }}</span>
        <span class="card-suit">{{ card.suit }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayingCard',
  props: {
    card: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    entering: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    isRed() {
      return this.card.suit === '♥' || this.card.suit === '♦'
    }
  }
}
</script>

<style scoped>
.playing-card {
  width: 100px;
  height: 145px;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff8e1, #f7e9c4);
  border: 2px solid #1a0f24;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  flex-shrink: 0;
  user-select: none;
  box-shadow: 2px 3px 8px rgba(0,0,0,0.4);
}

.playing-card:hover {
  transform: translateY(-8px);
  box-shadow: 2px 8px 16px rgba(0,0,0,0.5);
}

.playing-card.selected {
  transform: translateY(-28px);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4), 2px 8px 16px rgba(0,0,0,0.5);
}

.card-inner {
  width: 100%;
  height: 100%;
  padding: 6px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.card-corner.bottom-right {
  position: absolute;
  bottom: 6px;
  right: 6px;
  transform: rotate(180deg);
}

.card-rank {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 900;
  line-height: 1;
  color: #1a0f24;
}

.card-suit {
  font-size: 12px;
  line-height: 1;
}

.card-center-suit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  line-height: 1;
}

.playing-card.red-suit .card-rank,
.playing-card.red-suit .card-center-suit,
.playing-card.red-suit .card-suit {
  color: #dc2626;
}
</style>
