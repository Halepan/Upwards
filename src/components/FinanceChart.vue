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

const props = defineProps<{
  viewMode: 'diario' | 'semanal' | 'mensual'
}>()

const emit = defineEmits<{
  'update:viewMode': [mode: 'diario' | 'semanal' | 'mensual']
}>()

const chartRef = ref<InstanceType<typeof Line> | null>(null)

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function generateData(
  startVal: number,
  volatility: number,
  drift: number,
  seed: number,
  minVal = 10,
  maxVal = 10000,
): { x: Date; y: number }[] {
  const rand = seededRand(seed)
  let val = startVal
  const data: { x: Date; y: number }[] = []
  const start = new Date(2023, 0, 1)
  const end = new Date(2026, 11, 31)
  const cur = new Date(start)

  while (cur <= end) {
    val += drift + (rand() - 0.5) * volatility
    val = Math.max(minVal, Math.min(maxVal, val))
    data.push({ x: new Date(cur), y: Math.round(val) })
    cur.setDate(cur.getDate() + 1)
  }
  return data
}

const seriesConfig = [
  {
    label: 'Gastable',
    seed: 42,
    startVal: 2800,
    volatility: 380,
    drift: 1.2,
    color: '#00897B',
  },
  {
    label: 'Ahorro',
    seed: 123,
    startVal: 1200,
    volatility: 180,
    drift: 5.5,
    color: '#FFA000',
  },
  {
    label: 'Inversión',
    seed: 777,
    startVal: 5200,
    volatility: 650,
    drift: -0.8,
    color: '#7B1FA2',
  },
]

const datasets = seriesConfig.map(s => ({
  label: s.label,
  data: generateData(s.startVal, s.volatility, s.drift, s.seed),
  borderColor: s.color,
  backgroundColor: s.color,
  pointRadius: 0,
  pointHitRadius: 6,
  pointHoverRadius: 4,
  tension: 0.2,
  fill: false,
  borderWidth: 1.5,
}))

const chartOptions = computed(() => {
  const now = new Date(2026, 11, 31)
  let min: Date, max: Date
  let unit: 'day' | 'week' | 'month'
  let displayFormats: Record<string, string>

  switch (props.viewMode) {
    case 'diario':
      min = new Date(2026, 10, 1)
      max = now
      unit = 'day'
      displayFormats = { day: 'EEE d', week: 'd MMM', month: 'MMM yyyy' }
      break
    case 'semanal':
      min = new Date(2026, 6, 1)
      max = now
      unit = 'week'
      displayFormats = { day: 'EEE d', week: 'd MMM', month: 'MMM yyyy' }
      break
    case 'mensual':
      min = new Date(2023, 0, 1)
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
          color: 'rgba(0,0,0,0.06)',
          drawTicks: false,
        },
        ticks: {
          maxTicksLimit: 12,
          font: { size: 10, family: "'Nunito', sans-serif" },
          color: '#888',
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0,0,0,0.06)',
          drawTicks: false,
        },
        ticks: {
          font: { size: 10, family: "'Nunito', sans-serif" },
          color: '#888',
          callback: (v: number) => '$' + v.toLocaleString('es-MX'),
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
            `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-MX')}`,
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

function resetZoom() {
  const chart = chartRef.value?.chart
  if (chart) {
    chart.resetZoom()
  }
}

watch(
  () => props.viewMode,
  () => {
    nextTick(() => {
      const chart = chartRef.value?.chart
      if (chart) {
        chart.resetZoom()
      }
    })
  },
)
</script>

<template>
  <div class="finance-chart">
    <div class="chart-scroll">
      <Line
        ref="chartRef"
        :data="{ datasets }"
        :options="chartOptions"
        class="chart-canvas"
      />
    </div>
    <div class="chart-legend">
      <div
        v-for="s in seriesConfig"
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
.finance-chart {
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
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 8px 8px 0;
  touch-action: pan-y;
}

.chart-scroll::-webkit-scrollbar {
  height: 4px;
}

.chart-scroll::-webkit-scrollbar-track {
  background: var(--color-border);
  border-radius: 2px;
}

.chart-scroll::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 2px;
}

.chart-canvas {
  width: 100%;
  min-width: 400px;
  height: 200px;
  max-height: 200px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chart-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
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
  color: var(--color-text);
}
</style>
