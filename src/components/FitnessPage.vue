<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import BodyAvatar from './BodyAvatar.vue'
import GenericChart from './GenericChart.vue'
import WeekPlanner from './WeekPlanner.vue'
import RoutinePlanner from './RoutinePlanner.vue'
import type { FabAction } from './FloatingActionButton.vue'
import type { ChartSeries } from './GenericChart.vue'
import type { PlannerItem } from './WeekPlanner.vue'
import { themeIcons, themeColors } from '../config/theme.config'
import { fitnessStore, useAuthStore } from '../store'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)

/* -------------------------------------------------------------------------- */
/*  Tipos locales                                                             */
/* -------------------------------------------------------------------------- */

interface Ejercicio {
  id: number
  nombre: string
  icono: string
  grupoMuscular: string
  tipo: 'fuerza' | 'resistencia'
}

interface Rutina {
  id: number
  nombre: string
  icono: string
  idsEjercicios: number[]
}

/* -------------------------------------------------------------------------- */
/*  Datos de ejercicios y rutinas (inicializados desde store)                  */
/* -------------------------------------------------------------------------- */

const ejercicios = ref<Ejercicio[]>([])
const rutinas = ref<Rutina[]>([])

function initFromStore() {
  ejercicios.value = fitnessStore.items.length > 0
    ? fitnessStore.items.map((e: any) => ({
        id: e.id!,
        nombre: e.name,
        icono: '🏋️',
        grupoMuscular: e.sub_type || 'General',
        tipo: e.type as 'fuerza' | 'resistencia',
      }))
    : []
  const storedRoutines = fitnessStore.routines.value
  rutinas.value = storedRoutines.length > 0
    ? storedRoutines.map((r: any) => ({
        id: r.id!,
        nombre: r.name,
        icono: '💪',
        idsEjercicios: [] as number[],
      }))
    : []
}

/* -------------------------------------------------------------------------- */
/*  Tema e iconos                                                             */
/* -------------------------------------------------------------------------- */

const { isDark } = useTheme()

const coloresActuales = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)
const colorPrimario = computed(() => coloresActuales.value.primary)
const colorSuperficie = computed(() => coloresActuales.value.surface)
const colorTexto = computed(() => coloresActuales.value.text)
const colorTextoSecundario = computed(() => coloresActuales.value.textSecondary)
const colorBorde = computed(() => coloresActuales.value.border)
const colorFondo = computed(() => coloresActuales.value.background)
const colorFondoInput = computed(() => coloresActuales.value.inputBg)

/* -------------------------------------------------------------------------- */
/*  Datos de gráficos                                                         */
/* -------------------------------------------------------------------------- */

const seriesFuerza = ref<ChartSeries[]>([])
const seriesResistencia = ref<ChartSeries[]>([])

const modoVista = ref<'diario' | 'semanal' | 'mensual'>('mensual')

/* -------------------------------------------------------------------------- */
/*  Estado de edición y menú contextual                                       */
/* -------------------------------------------------------------------------- */

const panelEditarAbierto = ref(false)
const tituloPanel = ref('')
const idEjercicioEditando = ref<number | null>(null)

const {
  contextVisible: contextoVisible,
  contextItems: contextoItems,
  contextX: contextoX,
  contextY: contextoY,
  startPress: iniciarPulsacion,
  cancelPress: cancelarPulsacion,
  closeContext: cerrarContexto,
} = useLongPress()

const modoPlanificacion = ref(false)
const tituloPlanificacion = ref('')
const modoRutinaPlanificador = ref<'nueva' | 'editar' | null>(null)
const rutinaEditando = ref<Rutina | null>(null)

const accionesFab: FabAction[] = [
  { icon: themeIcons.gym.light, label: 'Nuevo ejercicio', action: () => abrirDialogoAgregar() },
  { icon: themeIcons.book.light, label: 'Nueva rutina', action: () => { modoRutinaPlanificador.value = 'nueva'; rutinaEditando.value = null } },
  { icon: themeIcons.leftBar.light, label: 'Planificación semanal', action: () => { tituloPlanificacion.value = 'Planificación semanal'; modoPlanificacion.value = true } },
  { icon: themeIcons.check.light, label: 'Editar planificación semanal', action: () => { tituloPlanificacion.value = 'Editar planificación semanal'; modoPlanificacion.value = true } },
]

/* -------------------------------------------------------------------------- */
/*  Elementos del planificador semanal                                         */
/* -------------------------------------------------------------------------- */

const elementosPlanificador = computed<PlannerItem[]>(() => [
  ...ejercicios.value.map(e => ({ id: e.id, name: e.nombre, icon: e.icono, type: 'exercise' as const })),
  ...rutinas.value.map(r => ({ id: r.id, name: r.nombre, icon: r.icono, type: 'routine' as const, exerciseIds: r.idsEjercicios })),
])

function alConfirmarPlan(_planificacion: Record<number, number[]>) {
  modoPlanificacion.value = false
}

function alCancelarPlan() {
  modoPlanificacion.value = false
}

function alEditarPlan(elemento: PlannerItem) {
  if (elemento.type === 'routine') {
    const rutina = rutinas.value.find(r => r.id === elemento.id)
    if (rutina) {
      rutinaEditando.value = rutina
      modoRutinaPlanificador.value = 'editar'
    }
  } else {
    const ejercicio = ejercicios.value.find(e => e.id === elemento.id)
    if (ejercicio) {
      tituloPanel.value = `Editar ${ejercicio.nombre}`
      idEjercicioEditando.value = ejercicio.id
      panelEditarAbierto.value = true
    }
  }
}

async function alEliminarPlan(elemento: PlannerItem) {
  if (elemento.type === 'routine') {
    await fitnessStore.deleteRoutine(elemento.id)
    rutinas.value = rutinas.value.filter(r => r.id !== elemento.id)
  } else {
    await fitnessStore.deleteExercise(elemento.id)
    ejercicios.value = ejercicios.value.filter(e => e.id !== elemento.id)
  }
}

/* -------------------------------------------------------------------------- */
/*  Planificador de rutinas                                                   */
/* -------------------------------------------------------------------------- */

async function alGuardarRutina(rutinaData: { name: string; exerciseIds: number[] }) {
  if (modoRutinaPlanificador.value === 'editar' && rutinaEditando.value) {
    const r = rutinas.value.find(rt => rt.id === rutinaEditando.value!.id)
    if (r) {
      r.nombre = rutinaData.name
      r.idsEjercicios = rutinaData.exerciseIds
    }
  } else {
    const saved = await fitnessStore.createRoutine(currentUser.value!.id!, { name: rutinaData.name, description: '', isActive: true } as any)
    rutinas.value.push({
      id: saved.id!,
      nombre: saved.name,
      icono: themeIcons.gym.light,
      idsEjercicios: rutinaData.exerciseIds,
    })
  }
  modoRutinaPlanificador.value = null
  rutinaEditando.value = null
}

function alCancelarRutina() {
  modoRutinaPlanificador.value = null
  rutinaEditando.value = null
}

/* -------------------------------------------------------------------------- */
/*  Ejercicios de hoy (limitados a 4)                                         */
/* -------------------------------------------------------------------------- */

const planificacionSemanal = ref<Record<number, number[]>>({})

const ejerciciosDeHoy = computed<Ejercicio[]>(() => {
  const ahora = new Date()
  const indiceHoy = (ahora.getDay() + 6) % 7
  const idsPlanificados = planificacionSemanal.value[indiceHoy]
  if (!idsPlanificados || idsPlanificados.length === 0) {
    return []
  }
  const resultado: Ejercicio[] = []
  for (const id of idsPlanificados) {
    const esRutina = rutinas.value.find(r => r.id === id)
    if (esRutina) {
      for (const idEj of esRutina.idsEjercicios) {
        const ej = ejercicios.value.find(e => e.id === idEj)
        if (ej) {
          resultado.push({ ...ej, id: Date.now() + Math.random() * 10000 + resultado.length })
        }
      }
    } else {
      const ej = ejercicios.value.find(e => e.id === id)
      if (ej) {
        resultado.push(ej)
      }
    }
  }
  return resultado
})

// Solo mostramos los primeros 4 ejercicios de hoy
const ejerciciosVisibles = computed(() => ejerciciosDeHoy.value.slice(0, 4))

/* -------------------------------------------------------------------------- */
/*  Diálogo para agregar ejercicio                                            */
/* -------------------------------------------------------------------------- */

const dialogoAgregarAbierto = ref(false)
const dialogoNombreEjercicio = ref('')
const dialogoGrupoMuscular = ref('Pectoral')
const dialogoTipoEjercicio = ref<'fuerza' | 'resistencia'>('fuerza')

const gruposMusculares = ['Pectoral', 'Dorsal', 'Piernas', 'Hombros', 'Cardio', 'Core', 'Bíceps', 'Tríceps', 'Glúteos', 'Abdomen', 'Espalda', 'Gemelo']

function abrirDialogoAgregar() {
  dialogoNombreEjercicio.value = ''
  dialogoGrupoMuscular.value = 'Pectoral'
  dialogoTipoEjercicio.value = 'fuerza'
  dialogoAgregarAbierto.value = true
}

async function confirmarDialogoAgregar() {
  if (!dialogoNombreEjercicio.value.trim()) return
  const saved = await fitnessStore.addExercise(
    currentUser.value!.id!,
    dialogoNombreEjercicio.value.trim(),
    dialogoTipoEjercicio.value,
    dialogoGrupoMuscular.value,
  )
  if (saved) {
    ejercicios.value.push({
      id: saved.id!,
      nombre: saved.name,
      icono: themeIcons.gym.light,
      grupoMuscular: dialogoGrupoMuscular.value,
      tipo: saved.type,
    })
  }
  dialogoAgregarAbierto.value = false
}

function cancelarDialogoAgregar() {
  dialogoAgregarAbierto.value = false
}

/* -------------------------------------------------------------------------- */
/*  Selector de ejercicios para Hoy                                           */
/* -------------------------------------------------------------------------- */

const dialogoAgregarHoyAbierto = ref(false)
const ejerciciosSeleccionadosHoy = ref<number[]>([])

function abrirSelectorHoy() {
  const hoyIdx = (new Date().getDay() + 6) % 7
  ejerciciosSeleccionadosHoy.value = [...(planificacionSemanal.value[hoyIdx] || [])]
  dialogoAgregarHoyAbierto.value = true
}

function toggleEjercicioHoy(id: number) {
  const idx = ejerciciosSeleccionadosHoy.value.indexOf(id)
  if (idx >= 0) {
    ejerciciosSeleccionadosHoy.value.splice(idx, 1)
  } else {
    ejerciciosSeleccionadosHoy.value.push(id)
  }
}

function confirmarSelectorHoy() {
  const hoyIdx = (new Date().getDay() + 6) % 7
  planificacionSemanal.value[hoyIdx] = [...ejerciciosSeleccionadosHoy.value]
  dialogoAgregarHoyAbierto.value = false
}

function cancelarSelectorHoy() {
  dialogoAgregarHoyAbierto.value = false
}

function limpiarEjerciciosHoy() {
  const hoyIdx = (new Date().getDay() + 6) % 7
  delete planificacionSemanal.value[hoyIdx]
}

function abrirContextoEjercicio(ejercicio: Ejercicio, evento: MouseEvent | TouchEvent) {
  const esOriginal = ejercicios.value.some(e => e.id === ejercicio.id)
  if (!esOriginal) return
  iniciarPulsacion(evento, [
    {
      icon: themeIcons.check.light,
      label: 'Editar',
      action: () => {
        tituloPanel.value = `Editar ${ejercicio.nombre}`
        idEjercicioEditando.value = ejercicio.id
        panelEditarAbierto.value = true
      },
    },
    {
      icon: themeIcons.delete.light,
      label: 'Eliminar',
      action: () => { fitnessStore.deleteExercise(ejercicio.id); ejercicios.value = ejercicios.value.filter(e => e.id !== ejercicio.id) },
    },
  ])
}

/* -------------------------------------------------------------------------- */
/*  Mediciones corporales (solo las definidas en BodyMeasurement)             */
/* -------------------------------------------------------------------------- */

const medicionesCorporales = ref({
  altura: 0,
  peso: 0,
  grasaCorporal: 0,
  pecho: 0,
  cintura: 0,
  muslo: 0,
})

function loadBodyMeasurements() {
  const latest = fitnessStore.latestBodyMeasurement
  if (latest) {
    medicionesCorporales.value = {
      altura: latest.height_cm || 0,
      peso: latest.weight_kg || 0,
      grasaCorporal: latest.body_fat_percent || 0,
      pecho: latest.chest_cm || 0,
      cintura: latest.waist_cm || 0,
      muslo: latest.thigh_cm || 0,
    }
  }
}

const claveMedicionEditando = ref<string | null>(null)
const valorMedicionEditando = ref('')

function iniciarEdicionMedicion(clave: string) {
  claveMedicionEditando.value = clave
  valorMedicionEditando.value = String((medicionesCorporales.value as any)[clave] ?? '')
  nextTick(() => {
    const elemento = document.querySelector('.entrada-medicion') as HTMLInputElement
    if (elemento) elemento.focus()
  })
}

async function guardarEdicionMedicion() {
  if (!claveMedicionEditando.value) return
  const valor = parseFloat(valorMedicionEditando.value)
  if (!isNaN(valor) && valor > 0) {
    (medicionesCorporales.value as any)[claveMedicionEditando.value] = valor
    const m = medicionesCorporales.value
    await fitnessStore.saveBodyMeasurement({
      user_id: currentUser.value!.id!,
      date: new Date().toISOString().slice(0, 10),
      weight_kg: m.peso,
      height_cm: m.altura,
      body_fat_percent: m.grasaCorporal,
      chest_cm: m.pecho,
      waist_cm: m.cintura,
      thigh_cm: m.muslo,
    })
  }
  claveMedicionEditando.value = null
}

interface EtiquetaCorporal {
  id: number
  clave: string
  etiqueta: string
  valor: string
  unidad: string
  lado: 'izquierda' | 'derecha' | 'inferior'
  desplazamiento: number
}

const etiquetasCorporales = computed<EtiquetaCorporal[]>(() => {
  const m = medicionesCorporales.value
  const imc = m.altura ? (m.peso / ((m.altura / 100) ** 2)).toFixed(1) : '--'
  return [
    { id: 1, clave: 'altura', etiqueta: 'Altura', valor: String(m.altura), unidad: 'cm', lado: 'izquierda', desplazamiento: 10 },
    { id: 2, clave: 'peso', etiqueta: 'Peso', valor: String(m.peso), unidad: 'kg', lado: 'izquierda', desplazamiento: 30 },
    { id: 3, clave: 'imc', etiqueta: 'IMC', valor: imc, unidad: '', lado: 'izquierda', desplazamiento: 50 },
    { id: 4, clave: 'grasaCorporal', etiqueta: 'Grasa', valor: String(m.grasaCorporal), unidad: '%', lado: 'izquierda', desplazamiento: 70 },
    { id: 5, clave: 'pecho', etiqueta: 'Pecho', valor: String(m.pecho), unidad: 'cm', lado: 'derecha', desplazamiento: 20 },
    { id: 6, clave: 'cintura', etiqueta: 'Cintura', valor: String(m.cintura), unidad: 'cm', lado: 'derecha', desplazamiento: 50 },
    { id: 7, clave: 'muslo', etiqueta: 'Muslo', valor: String(m.muslo), unidad: 'cm', lado: 'inferior', desplazamiento: 50 },
  ]
})

onMounted(async () => {
  await fitnessStore.loadAll(currentUser.value!.id!)
  initFromStore()
  loadBodyMeasurements()
})
</script>

<template>
  <RoutinePlanner
    v-if="modoRutinaPlanificador"
    :exercises="ejercicios.map(e => ({ id: e.id, name: e.nombre, icon: e.icono }))"
    :existing="modoRutinaPlanificador === 'editar' && rutinaEditando ? { id: rutinaEditando.id, name: rutinaEditando.nombre, exerciseIds: rutinaEditando.idsEjercicios } : undefined"
    @save="alGuardarRutina"
    @cancel="alCancelarRutina"
  />
  <WeekPlanner
    v-else-if="modoPlanificacion"
    :items="elementosPlanificador"
    :title="tituloPlanificacion"
    @confirm="alConfirmarPlan"
    @cancel="alCancelarPlan"
    @edit="alEditarPlan"
    @delete="alEliminarPlan"
  />
  <div v-else class="pagina-fitness" :style="{ backgroundColor: colorFondo }">
    <!-- Gráficos de fuerza y resistencia -->
    <div class="fila-graficos">
      <div class="caja-grafico" :style="{ backgroundColor: colorSuperficie }">
        <span class="titulo-grafico" :style="{ color: colorTexto }">Fuerza</span>
        <GenericChart
          :series="seriesFuerza"
          :view-mode="modoVista"
          :yFormat="(v: number) => v + '%'"
          :show-legend="true"
          :chart-height="140"
          :dark-mode="isDark"
          @update:view-mode="modoVista = $event"
        />
      </div>

      <div class="caja-grafico" :style="{ backgroundColor: colorSuperficie }">
        <span class="titulo-grafico" :style="{ color: colorTexto }">Resistencia</span>
        <GenericChart
          :series="seriesResistencia"
          :view-mode="modoVista"
          :yFormat="(v: number) => v + '%'"
          :show-legend="true"
          :chart-height="140"
          :dark-mode="isDark"
          @update:view-mode="modoVista = $event"
        />
      </div>
    </div>

    <!-- Sección inferior: avatar + ejercicios de hoy -->
    <div class="seccion-inferior">
      <div class="panel-izquierdo">
        <div class="espacio-cuerpo">
          <BodyAvatar
            gender="male"
            :weight-kg="medicionesCorporales.peso"
            :height-cm="medicionesCorporales.altura"
            :body-fat-percent="medicionesCorporales.grasaCorporal"
            :chest-cm="medicionesCorporales.pecho"
            :waist-cm="medicionesCorporales.cintura"
            :thigh-cm="medicionesCorporales.muslo"
          />
          <!-- Etiquetas izquierda -->
          <div class="etiquetas-izquierda">
            <div
              v-for="etq in etiquetasCorporales.filter(x => x.lado === 'izquierda')"
              :key="etq.id"
              class="etiqueta-corporal"
              :style="{ top: etq.desplazamiento + '%', backgroundColor: colorSuperficie }"
            >
              <span class="nombre-etiqueta" :style="{ color: colorTexto }">{{ etq.etiqueta }}</span>
              <input
                v-if="claveMedicionEditando === etq.clave"
                v-model="valorMedicionEditando"
                type="number"
                class="entrada-medicion"
                :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorPrimario }"
                step="any"
                @blur="guardarEdicionMedicion"
                @keydown.enter="guardarEdicionMedicion"
                @keydown.escape="claveMedicionEditando = null"
              />
              <span v-else class="valor-etiqueta" :style="{ color: colorTextoSecundario }" @click="iniciarEdicionMedicion(etq.clave)">{{ etq.valor }}{{ etq.unidad }}</span>
            </div>
          </div>
          <!-- Etiquetas derecha -->
          <div class="etiquetas-derecha">
            <div
              v-for="etq in etiquetasCorporales.filter(x => x.lado === 'derecha')"
              :key="etq.id"
              class="etiqueta-corporal"
              :style="{ top: etq.desplazamiento + '%', backgroundColor: colorSuperficie }"
            >
              <span class="nombre-etiqueta" :style="{ color: colorTexto }">{{ etq.etiqueta }}</span>
              <input
                v-if="claveMedicionEditando === etq.clave"
                v-model="valorMedicionEditando"
                type="number"
                class="entrada-medicion"
                :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorPrimario }"
                step="any"
                @blur="guardarEdicionMedicion"
                @keydown.enter="guardarEdicionMedicion"
                @keydown.escape="claveMedicionEditando = null"
              />
              <span v-else class="valor-etiqueta" :style="{ color: colorTextoSecundario }" @click="iniciarEdicionMedicion(etq.clave)">{{ etq.valor }}{{ etq.unidad }}</span>
            </div>
          </div>
          <!-- Etiquetas inferiores -->
          <div class="etiquetas-inferiores">
            <div
              v-for="etq in etiquetasCorporales.filter(x => x.lado === 'inferior')"
              :key="etq.id"
              class="etiqueta-corporal etq-inferior"
              :style="{ left: etq.desplazamiento + '%', backgroundColor: colorSuperficie }"
            >
              <span class="nombre-etiqueta" :style="{ color: colorTexto }">{{ etq.etiqueta }}</span>
              <input
                v-if="claveMedicionEditando === etq.clave"
                v-model="valorMedicionEditando"
                type="number"
                class="entrada-medicion"
                :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorPrimario }"
                step="any"
                @blur="guardarEdicionMedicion"
                @keydown.enter="guardarEdicionMedicion"
                @keydown.escape="claveMedicionEditando = null"
              />
              <span v-else class="valor-etiqueta" :style="{ color: colorTextoSecundario }" @click="iniciarEdicionMedicion(etq.clave)">{{ etq.valor }}{{ etq.unidad }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho: ejercicios de hoy -->
      <div class="panel-derecho" :style="{ backgroundColor: colorSuperficie }">
        <h3 class="titulo-hoy" :style="{ color: colorTexto }">Hoy - Ejercicios</h3>
        <div class="lista-hoy">
          <div
            v-for="ej in ejerciciosVisibles"
            :key="ej.id"
            class="item-hoy"
            :style="{ backgroundColor: colorSuperficie }"
            @pointerdown="abrirContextoEjercicio(ej, $event)"
            @pointerup="cancelarPulsacion"
            @pointerleave="cancelarPulsacion"
          >
            <span class="icono-ejercicio">{{ ej.icono }}</span>
            <div class="info-ejercicio">
              <span class="nombre-ejercicio" :style="{ color: colorTexto }">{{ ej.nombre }}</span>
              <span class="grupo-ejercicio" :style="{ color: colorTextoSecundario }">{{ ej.grupoMuscular }}</span>
            </div>

          </div>
          <button class="boton-agregar-ejercicio" @click="abrirSelectorHoy">
            <svg class="icono-agregar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>Elegir ejercicios</span>
          </button>
          <button v-if="ejerciciosVisibles.length > 0" class="boton-limpiar-hoy" @click="limpiarEjerciciosHoy" :style="{ color: colorTextoSecundario }">
            Quitar todos
          </button>
          <div v-if="ejerciciosVisibles.length === 0" class="hoy-vacio" :style="{ color: colorTextoSecundario }">
            <p>Sin ejercicios para hoy</p>
            <p class="hoy-vacio-sub">Toca "Elegir ejercicios" para seleccionar de tu lista</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo para agregar ejercicio -->
    <Teleport to="body">
      <div v-if="dialogoAgregarAbierto" class="fondo-dialogo" @click.self="cancelarDialogoAgregar">
        <div class="dialogo-agregar" :style="{ backgroundColor: colorSuperficie }">
          <h3 class="titulo-dialogo" :style="{ color: colorTexto }">Nuevo ejercicio</h3>

          <label class="campo-dialogo">
            <span class="etiqueta-campo" :style="{ color: colorTextoSecundario }">Nombre</span>
            <input v-model="dialogoNombreEjercicio" type="text" class="entrada-dialogo" placeholder="Ej: Press banca" :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorBorde }" />
          </label>

          <label class="campo-dialogo">
            <span class="etiqueta-campo" :style="{ color: colorTextoSecundario }">Grupo muscular</span>
            <select v-model="dialogoGrupoMuscular" class="select-dialogo" :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorBorde }">
              <option v-for="g in gruposMusculares" :key="g" :value="g">{{ g }}</option>
            </select>
          </label>

          <label class="campo-dialogo">
            <span class="etiqueta-campo" :style="{ color: colorTextoSecundario }">Tipo</span>
            <div class="botones-tipo">
              <button
                :class="{ activo: dialogoTipoEjercicio === 'fuerza' }"
                :style="dialogoTipoEjercicio === 'fuerza' ? { backgroundColor: colorPrimario, color: 'white', borderColor: colorPrimario } : { backgroundColor: colorFondoInput, color: colorTextoSecundario, borderColor: colorBorde }"
                @click="dialogoTipoEjercicio = 'fuerza'"
              >Fuerza</button>
              <button
                :class="{ activo: dialogoTipoEjercicio === 'resistencia' }"
                :style="dialogoTipoEjercicio === 'resistencia' ? { backgroundColor: colorPrimario, color: 'white', borderColor: colorPrimario } : { backgroundColor: colorFondoInput, color: colorTextoSecundario, borderColor: colorBorde }"
                @click="dialogoTipoEjercicio = 'resistencia'"
              >Resistencia</button>
            </div>
          </label>



          <div class="acciones-dialogo">
            <button class="boton-dialogo cancelar" :style="{ backgroundColor: colorBorde, color: colorTexto }" @click="cancelarDialogoAgregar">Cancelar</button>
            <button class="boton-dialogo confirmar" :style="{ backgroundColor: colorPrimario, color: 'white' }" @click="confirmarDialogoAgregar" :disabled="!dialogoNombreEjercicio.trim()">Añadir</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Diálogo para elegir ejercicios de Hoy -->
    <Teleport to="body">
      <div v-if="dialogoAgregarHoyAbierto" class="fondo-dialogo" @click.self="cancelarSelectorHoy">
        <div class="dialogo-agregar" :style="{ backgroundColor: colorSuperficie }">
          <h3 class="titulo-dialogo" :style="{ color: colorTexto }">Elegir ejercicios para hoy</h3>
          <div v-if="ejercicios.length === 0" class="hoy-vacio" :style="{ color: colorTextoSecundario }">
            No hay ejercicios. Crea uno nuevo con el botón +.
          </div>
          <div v-else class="lista-selector-hoy">
            <div
              v-for="ej in ejercicios"
              :key="ej.id"
              class="item-selector-hoy"
              :class="{ seleccionado: ejerciciosSeleccionadosHoy.includes(ej.id) }"
              :style="{ borderColor: colorBorde, backgroundColor: colorFondoInput }"
              @click="toggleEjercicioHoy(ej.id)"
            >
              <span class="check-selector" :style="ejerciciosSeleccionadosHoy.includes(ej.id) ? { backgroundColor: colorPrimario, borderColor: colorPrimario } : { borderColor: colorBorde }">
                <svg v-if="ejerciciosSeleccionadosHoy.includes(ej.id)" viewBox="0 0 24 24" class="svg-check-selector">
                  <path d="M6 14l3 3 9-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="icono-ejercicio">{{ ej.icono }}</span>
              <div class="info-ejercicio">
                <span class="nombre-ejercicio" :style="{ color: colorTexto }">{{ ej.nombre }}</span>
                <span class="grupo-ejercicio" :style="{ color: colorTextoSecundario }">{{ ej.grupoMuscular }}</span>
              </div>
            </div>
          </div>
          <div class="acciones-dialogo">
            <button class="boton-dialogo cancelar" :style="{ backgroundColor: colorBorde, color: colorTexto }" @click="cancelarSelectorHoy">Cancelar</button>
            <button class="boton-dialogo confirmar" :style="{ backgroundColor: colorPrimario, color: 'white' }" @click="confirmarSelectorHoy">Aceptar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Menú contextual, FAB y panel deslizante -->
    <ContextMenu
      :visible="contextoVisible ?? false"
      :items="contextoItems ?? []"
      :x="contextoX ?? 0"
      :y="contextoY ?? 0"
      @close="cerrarContexto"
    />

    <FloatingActionButton :actions="accionesFab" />

    <SlidePanel :open="panelEditarAbierto" :title="tituloPanel" side="right" @close="panelEditarAbierto = false; idEjercicioEditando = null">
      <template v-if="idEjercicioEditando !== null">
        <div class="formulario-editar">
          <div v-for="ej in ejercicios.filter(e => e.id === idEjercicioEditando)" :key="ej.id" class="campos-editar">
            <label class="campo-dialogo">
              <span class="etiqueta-campo" :style="{ color: colorTextoSecundario }">Nombre</span>
              <input v-model="ej.nombre" type="text" class="entrada-dialogo" :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorBorde }" />
            </label>
            <label class="campo-dialogo">
              <span class="etiqueta-campo" :style="{ color: colorTextoSecundario }">Grupo muscular</span>
              <select v-model="ej.grupoMuscular" class="select-dialogo" :style="{ backgroundColor: colorFondoInput, color: colorTexto, borderColor: colorBorde }">
                <option v-for="g in gruposMusculares" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="campo-dialogo">
              <span class="etiqueta-campo" :style="{ color: colorTextoSecundario }">Tipo</span>
              <div class="botones-tipo">
                <button :class="{ activo: ej.tipo === 'fuerza' }" :style="ej.tipo === 'fuerza' ? { backgroundColor: colorPrimario, color: 'white', borderColor: colorPrimario } : { backgroundColor: colorFondoInput, color: colorTextoSecundario, borderColor: colorBorde }" @click="ej.tipo = 'fuerza'">Fuerza</button>
                <button :class="{ activo: ej.tipo === 'resistencia' }" :style="ej.tipo === 'resistencia' ? { backgroundColor: colorPrimario, color: 'white', borderColor: colorPrimario } : { backgroundColor: colorFondoInput, color: colorTextoSecundario, borderColor: colorBorde }" @click="ej.tipo = 'resistencia'">Resistencia</button>
              </div>
            </label>

          </div>
        </div>
      </template>
      <p v-else class="texto-placeholder" :style="{ color: colorTextoSecundario }">Selecciona un ejercicio para editar</p>
    </SlidePanel>
  </div>
</template>

<style scoped>
.pagina-fitness {
  --borde: #e8e8e8;
  --sombra: 0px 2px 4px rgba(0,0,0,0.05), 0px 6px 12px rgba(0,0,0,0.1);
  --sombra-item: 0px 1px 3px rgba(0,0,0,0.04);

  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

:root.dark .pagina-fitness {
  --borde: #333;
  --sombra: 0px 2px 4px rgba(0,0,0,0.2), 0px 6px 12px rgba(0,0,0,0.3);
  --sombra-item: 0px 1px 3px rgba(0,0,0,0.2);
}

.fila-graficos {
  display: flex;
  gap: 12px;
  padding: 16px 16px 10px;
  flex-shrink: 0;
}

.caja-grafico {
  flex: 1;
  border-radius: 12px;
  padding: 10px;
  box-shadow: var(--sombra);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.titulo-grafico {
  font-size: 13px;
  font-weight: 700;
}

.seccion-inferior {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  padding: 0 16px 10px;
  gap: 12px;
}

.panel-izquierdo {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.espacio-cuerpo {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 280px;
}

.etiquetas-izquierda {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.etiquetas-derecha {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.etiquetas-inferiores {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 0 6px;
}

.etiqueta-corporal {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  z-index: 1;
  transform: translateY(-50%);
}

.etq-inferior {
  transform: none;
}

.valor-etiqueta {
  font-size: 9px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: opacity 0.15s;
}

.valor-etiqueta:hover {
  opacity: 0.7;
}

.nombre-etiqueta {
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
}

.entrada-medicion {
  width: 48px;
  padding: 1px 4px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  font-family: inherit;
  outline: none;
}

.etiquetas-izquierda .etiqueta-corporal {
  left: 4px;
  align-items: flex-start;
}

.etiquetas-derecha .etiqueta-corporal {
  right: 4px;
  align-items: flex-end;
}

.etiquetas-inferiores .etiqueta-corporal {
  bottom: 4px;
  align-items: center;
}

.panel-derecho {
  flex: 1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  max-width: 27.5%;
}

.titulo-hoy {
  margin: 0;
  padding: 12px 12px 8px;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.lista-hoy {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lista-hoy::-webkit-scrollbar {
  width: 5px;
}
.lista-hoy::-webkit-scrollbar-track {
  background: var(--borde);
  border-radius: 3px;
}
.lista-hoy::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}
.lista-hoy {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--borde);
}

.item-hoy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  box-shadow: var(--sombra-item);
}

.icono-ejercicio {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.svg-ejercicio {
  width: 18px;
  height: 18px;
  display: block;
  color: currentColor;
}

.info-ejercicio {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.nombre-ejercicio {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grupo-ejercicio {
  font-size: 9px;
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 2px;
}

.series-ejercicio {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.fila-serie {
  display: flex;
  align-items: center;
  gap: 2px;
}

.etiqueta-serie {
  font-size: 9px;
  font-weight: 600;
  min-width: 12px;
}

.contenedor-valor {
  flex-shrink: 0;
}

.entrada-valor {
  width: 46px;
  padding: 3px 4px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.envoltura-check {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.entrada-check {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.circulo-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-sizing: border-box;
}

.svg-check {
  width: 16px;
  height: 16px;
}

.boton-agregar-ejercicio {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 1px dashed;
  border-radius: 8px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.icono-agregar {
  width: 18px;
  height: 18px;
  color: inherit;
  opacity: 0.8;
}

.hoy-vacio {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
}

.hoy-vacio-sub {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.boton-limpiar-hoy {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
  text-align: center;
}

.lista-selector-hoy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.item-selector-hoy {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.item-selector-hoy.seleccionado {
  border-color: var(--color-primary);
  opacity: 1;
}

.check-selector {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.svg-check-selector {
  width: 14px;
  height: 14px;
}

/* Diálogo para agregar ejercicio */
.fondo-dialogo {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialogo-agregar {
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.titulo-dialogo {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.campo-dialogo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.etiqueta-campo {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.entrada-dialogo {
  padding: 8px 10px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.entrada-dialogo:focus {
  border-color: var(--color-primary);
}

.select-dialogo {
  padding: 8px 10px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  appearance: auto;
}

.select-dialogo:focus {
  border-color: var(--color-primary);
}

.botones-tipo {
  display: flex;
  gap: 4px;
}

.botones-tipo button {
  flex: 1;
  padding: 8px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.incrementador {
  display: flex;
  align-items: center;
  gap: 8px;
}

.boton-paso {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid;
  background: transparent;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: all 0.15s;
}

.boton-paso:disabled {
  opacity: 0.4;
  cursor: default;
}

.valor-paso {
  font-size: 18px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.lista-repeticiones {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fila-repeticion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.etiqueta-repeticion {
  font-size: 13px;
  font-weight: 500;
  min-width: 48px;
}

.entrada-repeticion {
  width: 64px;
}

.unidad-repeticion {
  font-size: 12px;
}

.acciones-dialogo {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.boton-dialogo {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.boton-dialogo.cancelar:hover {
  opacity: 0.8;
}

.boton-dialogo.confirmar:hover:not(:disabled) {
  opacity: 0.85;
}

.boton-dialogo.confirmar:disabled {
  opacity: 0.4;
  cursor: default;
}

/* Formulario de edición en panel deslizante */
.formulario-editar {
  padding: 0 4px 20px;
}

.campos-editar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.series-editar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fila-editar-serie {
  display: flex;
  align-items: center;
  gap: 6px;
}

.campo-editar-serie {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
}

.campo-editar-serie .entrada-repeticion {
  width: 48px;
}

.boton-eliminar-serie {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.boton-eliminar-serie:hover {
  background: rgba(229,57,53,0.1);
}

.boton-agregar-serie {
  padding: 6px;
  border: 1px dashed;
  border-radius: 8px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.texto-placeholder {
  text-align: center;
  margin-top: 40px;
}

@media (max-width: 640px) {
  .fila-graficos {
    flex-direction: column;
    padding: 10px;
    gap: 8px;
  }
  .caja-grafico {
    padding: 8px;
  }
  .seccion-inferior {
    flex-direction: column;
    padding: 0 10px 8px;
    gap: 8px;
  }
  .panel-derecho {
    max-width: 100%;
  }
  .panel-izquierdo {
    min-height: 180px;
  }
  .espacio-cuerpo {
    min-height: 160px;
  }
  .titulo-hoy {
    font-size: 12px;
    padding: 8px 10px 4px;
  }
  .lista-hoy {
    padding: 0 10px 8px;
  }
  .entrada-valor {
    width: 40px;
    font-size: 11px;
  }
}
</style>