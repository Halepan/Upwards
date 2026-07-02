<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend as ChartLegend,
  TimeScale,
  Filler,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'chartjs-adapter-date-fns'
import { es } from 'date-fns/locale'

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  ChartLegend,
  TimeScale,
  Filler,
  zoomPlugin,
)

export interface ChartSeries {
  label: string
  data: { x: Date; y: number }[]
  color: string
}

const props = withDefaults(defineProps<{
  series: ChartSeries[]
  viewMode: 'diario' | 'semanal' | 'mensual'
  yFormat?: (v: number) => string
  showLegend?: boolean
  chartHeight?: number
  darkMode?: boolean
}>(), {
  yFormat: undefined,
  showLegend: true,
  chartHeight: 200,
  darkMode: false,
})

const emit = defineEmits<{
  'update:viewMode': [mode: 'diario' | 'semanal' | 'mensual']
}>()

const chartRef = ref<InstanceType<typeof Line> | null>(null)

const datasets = computed(() =>
  props.series.map(s => ({
    label: s.label,
    data: s.data as any,
    borderColor: s.color,
    backgroundColor: s.color,
    pointRadius: 0,
    pointHitRadius: 6,
    pointHoverRadius: 4,
    tension: 0.2,
    fill: false,
    borderWidth: 1.5,
  }))
)

const textColor = computed(() => props.darkMode ? '#999' : '#888')
const gridColor = computed(() => props.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')

const chartOptions = computed(() => {
  const now = new Date()
  let min: Date, max: Date
  let unit: 'day' | 'week' | 'month'
  let displayFormats: Record<string, string>
  switch (props.viewMode) {
    case 'diario':
      min = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      max = now
      unit = 'day'
      displayFormats = { day: 'EEE d', week: 'd MMM', month: 'MMM yyyy' }
      break
    case 'semanal':
      min = new Date(now.getFullYear() - 1, now.getMonth(), 1)
      max = now
      unit = 'week'
      displayFormats = { day: 'EEE d', week: 'd MMM', month: 'MMM yyyy' }
      break
    case 'mensual':
      min = new Date(now.getFullYear() - 3, 0, 1)
      max = now
      unit = 'month'
      displayFormats = { day: 'EEE d', week: 'd MMM', month: 'MMM yyyy' }
      break
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit,
          displayFormats,
          tooltipFormat: 'PPP',
        },
        adapters: {
          date: { locale: es },
        },
        min: min.getTime(),
        max: max.getTime(),
        grid: {
          color: gridColor.value,
          drawTicks: false,
        },
        ticks: {
          maxTicksLimit: 12,
          font: { size: 10, family: "'Nunito', sans-serif" },
          color: textColor.value,
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: gridColor.value,
          drawTicks: false,
        },
        ticks: {
          font: { size: 10, family: "'Nunito', sans-serif" },
          color: textColor.value,
          callback: props.yFormat ? (v: string | number) => props.yFormat!(typeof v === 'number' ? v : parseFloat(v)) : undefined,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 12, family: "'Nunito', sans-serif" },
        bodyFont: { size: 11, family: "'Nunito', sans-serif" },
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${props.yFormat ? props.yFormat(ctx.parsed.y as number) : ctx.parsed.y}`,
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
          threshold: 5,
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.05,
          },
          pinch: {
            enabled: true,
          },
          drag: {
            enabled: false,
          },
          mode: 'x' as const,
          onZoomComplete: ({ chart }: { chart: ChartJS }) => {
            if (suppressAutoMode) return
            const xScale = chart.scales.x
            const rangeDays =
              (xScale.max - xScale.min) / (1000 * 60 * 60 * 24)

            let newMode: 'diario' | 'semanal' | 'mensual'
            if (rangeDays <= 70) newMode = 'diario'
            else if (rangeDays <= 250) newMode = 'semanal'
            else newMode = 'mensual'

            if (newMode !== props.viewMode) {
              emit('update:viewMode', newMode)
            }
          },
        },
      } as any,
    },
  }
})

let suppressAutoMode = false

function resetZoom() {
  suppressAutoMode = true
  const chart = (chartRef.value as any)?.chart
  if (chart) {
    chart.resetZoom()
    // Manually set the scale to match viewMode after reset
    const xScale = chart.scales.x
    const opts = chartOptions.value
    if (opts.scales?.x && 'min' in opts.scales.x && 'max' in opts.scales.x) {
      xScale.options.min = (opts.scales.x as any).min
      xScale.options.max = (opts.scales.x as any).max
    }
    chart.update('none')
  }
  setTimeout(() => { suppressAutoMode = false }, 100)
}

watch(
  () => props.viewMode,
  () => {
    nextTick(resetZoom)
  },
)
</script>

<template>
  <div class="generic-chart">
    <div class="chart-scroll">
      <Line
        ref="chartRef"
        :data="{ datasets }"
        :options="chartOptions"
        :style="{ height: chartHeight + 'px' }"
        class="chart-canvas"
      />
    </div>
    <div v-if="showLegend" class="chart-legend">
      <div
        v-for="s in series"
        :key="s.label"
        class="legend-item"
      >
        <span class="legend-swatch" :style="{ background: s.color }" />
        <span class="legend-label">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generic-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.chart-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  padding: 8px 8px 0;
  touch-action: pan-y;
}

.chart-scroll::-webkit-scrollbar {
  height: 4px;
}

.chart-scroll::-webkit-scrollbar-track {
  background: var(--color-border, #e8e8e8);
  border-radius: 2px;
}

.chart-scroll::-webkit-scrollbar-thumb {
  background: var(--color-primary, #00897B);
  border-radius: 2px;
}

.chart-canvas {
  width: 100%;
  min-width: 400px;
  max-height: v-bind('chartHeight + "px"');
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 4px;
}

.legend-swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 9px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
}
</style>
