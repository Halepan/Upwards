<script setup lang="ts">
import { computed } from 'vue'
import normSvg from '../assets/icons/body-avatar-norm.svg'
import musclSvg from '../assets/icons/body-avatar-muscl.svg'
import obeSvg from '../assets/icons/body-avatar-obeso.svg'

const props = withDefaults(defineProps<{
  gender?: 'male' | 'female'
  weightKg?: number
  heightCm?: number
  bodyFatPercent?: number
  chestCm?: number
  waistCm?: number
  thighCm?: number
  size?: 'small' | 'medium' | 'large'
}>(), {
  gender: 'male',
  weightKg: 75,
  heightCm: 175,
  bodyFatPercent: 15,
  chestCm: 98,
  waistCm: 80,
  thighCm: 55,
  size: 'medium',
})

const sizePx = computed(() => {
  switch (props.size) {
    case 'small': return 60
    case 'large': return 200
    default: return 120
  }
})

const bmi = computed(() => {
  if (!props.heightCm) return 0
  return props.weightKg / ((props.heightCm / 100) ** 2)
})

const bodySvg = computed(() => {
  const b = bmi.value
  if (b <= 0) return normSvg
  if (b < 18.5) return null
  if (b < 25) return normSvg
  if (b < 30) return musclSvg
  return obeSvg
})
</script>

<template>
  <img
    v-if="bodySvg"
    :src="bodySvg"
    :width="sizePx"
    :height="sizePx * 2"
    class="body-avatar"
    alt="body silhouette"
  />
  <svg
    v-else
    viewBox="0 0 80 160"
    :width="sizePx"
    :height="sizePx * 2"
    class="body-avatar"
  >
    <circle cx="40" cy="18" r="10" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" fill="none" />
    <line x1="40" y1="28" x2="40" y2="70" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="40" y1="45" x2="15" y2="60" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="40" y1="45" x2="65" y2="60" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="40" y1="70" x2="30" y2="110" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="40" y1="70" x2="50" y2="110" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="30" y1="110" x2="22" y2="148" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="50" y1="110" x2="58" y2="148" stroke="var(--fi-text-sec, #888)" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.body-avatar {
  display: block;
}
</style>
