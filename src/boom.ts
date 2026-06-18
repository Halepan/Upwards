// utils/clearDatabase.ts

import { db } from './lib/db'                // Tu instancia de Dexie
import { supabase } from './lib/supabase'    // Tu instancia de Supabase
import { habitStore, fitnessStore, financeStore, useAuthStore } from './store'

// Lista de tablas de dominio (ajusta según tu esquema)
const DOMAIN_TABLES = [
  'users',
  'accounts',
  'income_entries',
  'expense_entries',
  'auto_percent_rules',
  'habits',
  'habit_logs',
  'weeks',
  'habit_week_plans',
  'exercises',
  'routines',
  'routine_exercises',
  'routine_logs',
  'routine_log_details',
  'body_measurements',
  'biometric_metrics',
]

// Tablas de sincronización (solo Dexie)
const SYNC_TABLES = ['sync_queue', 'sync_metadata']

export async function clearAllData(): Promise<void> {
  if (!confirm('¿Estás seguro de borrar TODOS los datos? ¡Esta acción no se puede deshacer!')) {
    return
  }

  const authStore = useAuthStore()
  const userId = authStore.currentUser?.id

  console.warn('🧹 Iniciando limpieza total de datos...')

  // ----------------------------------------------------------------
  // 1. Limpiar datos locales (Dexie)
  // ----------------------------------------------------------------
  try {
    // Limpiar tablas de dominio
    for (const tableName of DOMAIN_TABLES) {
      try {
        // Obtener la tabla usando db.table() (más seguro que db[tableName])
        const table = db.table(tableName)
        if (table) {
          await table.clear()
          console.log(`✅ Tabla local ${tableName} limpiada`)
        } else {
          console.warn(`⚠️ Tabla ${tableName} no encontrada en Dexie`)
        }
      } catch (err) {
        console.warn(`⚠️ Error al limpiar ${tableName}:`, err)
      }
    }

    // Limpiar tablas de sincronización
    for (const tableName of SYNC_TABLES) {
      try {
        const table = db.table(tableName)
        if (table) {
          await table.clear()
          console.log(`✅ Tabla local ${tableName} limpiada`)
        }
      } catch (err) {
        console.warn(`⚠️ Error al limpiar ${tableName}:`, err)
      }
    }

    console.log('✅ Datos locales eliminados correctamente')
  } catch (error) {
    console.error('❌ Error al limpiar Dexie:', error)
  }

  // ----------------------------------------------------------------
  // 2. Limpiar datos remotos (Supabase) - solo del usuario actual
  // ----------------------------------------------------------------
  if (userId && navigator.onLine) {
    try {
      for (const tableName of DOMAIN_TABLES) {
        if (tableName === 'users') continue // Opcional: no borrar el perfil del usuario

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('user_id', userId)

        if (error) {
          console.warn(`⚠️ No se pudo borrar ${tableName} en Supabase:`, error.message)
        } else {
          console.log(`✅ Tabla remota ${tableName} limpiada para user ${userId}`)
        }
      }
      console.log('✅ Datos remotos eliminados correctamente')
    } catch (error) {
      console.error('❌ Error al limpiar Supabase:', error)
    }
  } else {
    console.warn('⚠️ No se pudo conectar a Supabase o no hay usuario autenticado. Solo se limpiaron datos locales.')
  }

  // ----------------------------------------------------------------
  // 3. Reiniciar stores (limpiar estado en memoria)
  // ----------------------------------------------------------------
  try {
    habitStore.reset()
    fitnessStore.reset()
    financeStore.reset()

    // Limpiar estados específicos de habitStore
    habitStore.plannedForToday.value = []
    habitStore.allLogs.value = []
    habitStore.logs.value = []
    habitStore.selectedHabit.value = null
    habitStore.weeklyProgress.value = null

    console.log('✅ Stores reiniciados')
  } catch (error) {
    console.warn('⚠️ Error al reiniciar stores:', error)
  }

  // ----------------------------------------------------------------
  // 4. Cerrar sesión
  // ----------------------------------------------------------------
  try {
    await supabase.auth.signOut()
    authStore.logout()
    console.log('✅ Sesión cerrada')
  } catch (error) {
    console.warn('⚠️ Error al cerrar sesión:', error)
  }

  console.warn('🧹 Limpieza completada. La base de datos está vacía.')

  // ----------------------------------------------------------------
  // (OPCIONAL) Borrar toda la base de datos IndexedDB
  // ----------------------------------------------------------------
  // Si quieres eliminar completamente la base de datos (no solo vaciar tablas):
  // await db.delete()
  // console.log('🗑️ Base de datos IndexedDB eliminada por completo')
}