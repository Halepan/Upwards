import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'
import { User } from '../domain/user'
import { UserRepository } from '../repository/user_repository'

/* Store de autenticación con Pinia.
   Gestiona el ciclo de vida del usuario: login local/remoto, registro
   con validación de unicidad, y estado de sesión. */
export const useAuthStore = defineStore('auth', () => {
  const userRepo = new UserRepository(db.users)

  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /* Intenta iniciar sesión: primero busca en Dexie local,
     si hay conexión también valida contra Supabase Auth. */
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const localUser = await userRepo.findByEmail(email)

      if (!localUser) {
        error.value = 'auth.error.invalidCredentials'
        return false
      }

      if (localUser.authMethod === 'email') {
        currentUser.value = localUser
        isAuthenticated.value = true

        if (navigator.onLine) {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (authError) {
            console.warn('[Auth] Supabase login failed:', authError.message)
          }
        }

        return true
      }

      error.value = 'auth.error.invalidCredentials'
      return false
    } catch (cause) {
      error.value = 'auth.error.generic'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /* Registra un nuevo usuario: valida unicidad local + remota,
     crea la entidad User y la persiste en Dexie,
     y si hay conexión también crea la cuenta en Supabase Auth. */
  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const localNameExists = await userRepo.nameExists(name)
      if (localNameExists) {
        error.value = 'auth.username.taken'
        return false
      }

      const localEmailExists = await userRepo.emailExists(email)
      if (localEmailExists) {
        error.value = 'auth.error.emailExists'
        return false
      }

      if (navigator.onLine) {
        const remoteNameExists = await checkRemoteNameExists(name)
        if (remoteNameExists) {
          error.value = 'auth.username.taken'
          return false
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (signUpError) {
          error.value = 'auth.error.generic'
          return false
        }
      }

      const now = new Date().toISOString()
      const user = new User(
        undefined, uuidv4(), now, now,
        name, email, 'email', undefined
      )
      const saved = await userRepo.save(user)

      currentUser.value = saved
      isAuthenticated.value = true
      return true
    } catch (cause) {
      error.value = 'auth.error.generic'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /* Verifica si un nombre de usuario ya existe en Supabase. */
  async function checkRemoteNameExists(name: string): Promise<boolean> {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('uuid')
        .eq('name', name)
        .maybeSingle()

      if (queryError) {
        console.warn('[Auth] Remote name check failed:', queryError.message)
        return false
      }
      return data !== null
    } catch {
      return false
    }
  }

  function logout(): void {
    currentUser.value = null
    isAuthenticated.value = false
    error.value = null
    supabase.auth.signOut()
  }

  function clearError(): void {
    error.value = null
  }

  function devBypassLogin(): void {
    const now = new Date().toISOString()
    currentUser.value = new User(
      0, uuidv4(), now, now,
      'Dev', 'dev@upwards.app', 'email', undefined
    )
    isAuthenticated.value = true
    isLoading.value = false
    error.value = null
    console.log('[Auth] Dev bypass — login automático activado')
  }

  if (import.meta.env.DEV) {
    devBypassLogin()
  }

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }
})
