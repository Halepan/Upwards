// auth_store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'
import { User } from '../domain/user'
import { UserRepository } from '../repository/user_repository'

export const useAuthStore = defineStore('auth', () => {
  const userRepo = new UserRepository(db.users)

  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ================================================================
  // LOGIN
  // ================================================================
  async function login(email: string, password: string): Promise<boolean> {
    let idusernum : number = 0 
    isLoading.value = true
    error.value = null
    try {
      let localUser = await userRepo.findByEmail(email)
      if (!navigator.onLine && !localUser) {
        error.value = 'auth.error.noConnection'
        return false
      }else if(!navigator.onLine && localUser) {
        currentUser.value = localUser
        isAuthenticated.value = true
        return true 
      }

      if (localUser && localUser.id) idusernum = localUser.id

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (idusernum) userRepo.delete(idusernum)
        error.value = 'auth.error.invalidCredentials'
        return false
      }

      // Validar que el email esté confirmado
      if (!data.user?.email_confirmed_at) {
        error.value = 'auth.error.emailNotConfirmed'
        return false
      }

      const supabaseUuid = data.user.id
      if (!supabaseUuid) {
        error.value = 'auth.error.invalidCredentials'
        return false
      }

      localUser = await userRepo.findByUuid(supabaseUuid)
      
      //crear usuario local si no existe 
      if (!localUser) {
        const name = data.user?.user_metadata?.name || email.split('@')[0]
        const now = new Date().toISOString()
        localUser = new User(
          undefined,
          supabaseUuid,
          now,
          now,
          name,
          email,
          'email',
          undefined
        )
        await userRepo.save(localUser)
      }

      currentUser.value = localUser
      isAuthenticated.value = true
      return true
    } catch (cause) {
      console.error('[Auth] Error en login:', cause)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ================================================================
  // REGISTER (NO hace login automático)
  // ================================================================
  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      // Validaciones locales
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

      if (!navigator.onLine) {
        error.value = 'auth.error.noConnection'
        return false
      }

      const remoteNameExists = await checkRemoteNameExists(name)
      if (remoteNameExists) {
        error.value = 'auth.username.taken'
        return false
      }

      // Crear usuario en Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (signUpError) {
        error.value = signUpError.message || 'auth.error.generic'
        return false
      }

      const supabaseUuid = data.user?.id
      if (!supabaseUuid) {
        error.value = 'auth.error.noUuid'
        return false
      }

      // Guardar usuario en Dexie (local) pero NO hacer login
      const now = new Date().toISOString()
      const user = new User(
        undefined,
        supabaseUuid,
        now,
        now,
        name,
        email,
        'email',
        undefined
      )
      await userRepo.save(user)

      // ⚠️ NO establecemos currentUser ni isAuthenticated
      // El usuario debe confirmar el email antes de poder iniciar sesión

      return true
    } catch (cause) {
      console.error('[Auth] Error en registro:', cause)
      error.value = 'auth.error.generic'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ================================================================
  // VERIFICAR NOMBRE REMOTO
  // ================================================================
  async function checkRemoteNameExists(name: string): Promise<boolean> {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id')
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

  // ================================================================
  // LOGOUT
  // ================================================================
  function logout(): void {
    currentUser.value = null
    isAuthenticated.value = false
    error.value = null
    supabase.auth.signOut()
  }

  function clearError(): void {
    error.value = null
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