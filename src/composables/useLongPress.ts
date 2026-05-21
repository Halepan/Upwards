import { ref } from 'vue'

export interface ContextMenuItem {
  icon: string
  label: string
  action: () => void
}

export function useLongPress() {
  const contextVisible = ref(false)
  const contextItems = ref<ContextMenuItem[]>([])
  const contextX = ref(0)
  const contextY = ref(0)

  let pressTimer: number | null = null

  function startPress(event: MouseEvent | TouchEvent, items: ContextMenuItem[]): void {
    const point = 'touches' in event ? event.touches[0] : event
    contextItems.value = items
    contextX.value = point.clientX
    contextY.value = point.clientY

    pressTimer = window.setTimeout(() => {
      contextVisible.value = true
    }, 500)
  }

  function cancelPress(): void {
    if (pressTimer !== null) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
  }

  function closeContext(): void {
    contextVisible.value = false
  }

  return {
    contextVisible,
    contextItems,
    contextX,
    contextY,
    startPress,
    cancelPress,
    closeContext,
  }
}
