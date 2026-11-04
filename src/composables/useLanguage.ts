import { ref } from 'vue'

const LANG_STORAGE_KEY = 'upwards-lang'

export type SupportedLang = 'es' | 'en'

const currentLang = ref<SupportedLang>(
  (localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang) ?? 'es'
)

const translations: Record<string, Record<SupportedLang, string>> = {
  'auth.login.title': { es: 'Iniciar sesión', en: 'Log in' },
  'auth.register.title': { es: 'Crear cuenta', en: 'Create account' },
  'auth.login.button': { es: 'Entrar', en: 'Log in' },
  'auth.register.button': { es: 'Registrarse', en: 'Sign up' },
  'auth.login.noAccount': { es: '¿No tienes cuenta?', en: "Don't have an account?" },
  'auth.login.registerLink': { es: 'Regístrate aquí', en: 'Register here' },
  'auth.register.hasAccount': { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
  'auth.register.loginLink': { es: 'Inicia sesión', en: 'Log in' },
  'auth.register.back': { es: 'Regresar', en: 'Back' },
  'auth.email.label': { es: 'Correo electrónico', en: 'Email' },
  'auth.email.placeholder': { es: 'tucorreo@ejemplo.com', en: 'youremail@example.com' },
  'auth.password.label': { es: 'Contraseña', en: 'Password' },
  'auth.password.placeholder': { es: 'Tu contraseña', en: 'Your password' },
  'auth.password.confirmLabel': { es: 'Confirmar contraseña', en: 'Confirm password' },
  'auth.password.confirmPlaceholder': { es: 'Repite tu contraseña', en: 'Repeat your password' },
  'auth.password.mismatch': { es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
  'auth.username.label': { es: 'Nombre de usuario', en: 'Username' },
  'auth.username.placeholder': { es: 'Tu nombre de usuario', en: 'Your username' },
  'auth.username.taken': { es: 'Este nombre ya está en uso', en: 'This username is already taken' },
  'auth.email.invalid': { es: 'Correo electrónico inválido', en: 'Invalid email address' },
  'auth.password.minLength': { es: 'Mínimo 6 caracteres', en: 'At least 6 characters' },
  'auth.required': { es: 'Campo obligatorio', en: 'This field is required' },
  'auth.error.generic': { es: 'Error al procesar la solicitud', en: 'Error processing request' },
  'auth.error.invalidCredentials': { es: 'Credenciales inválidas', en: 'Invalid credentials' },
  'auth.error.emailExists': { es: 'Este correo ya está registrado', en: 'This email is already registered' },
  'auth.loading': { es: 'Procesando...', en: 'Processing...' },
  'connection.connected': { es: 'Conectado', en: 'Connected' },
  'connection.offline': { es: 'Modo offline', en: 'Offline mode' },
  'language.label': { es: 'Idioma', en: 'Language' },
  'lang.es': { es: 'Español', en: 'Spanish' },
  'lang.en': { es: 'Inglés', en: 'English' },
  'lang.zh': { es: 'Chino', en: 'Chinese' },
  'lang.hi': { es: 'Hindi', en: 'Hindi' },
  'lang.ar': { es: 'Árabe', en: 'Arabic' },
  'lang.pt': { es: 'Portugués', en: 'Portuguese' },
  'lang.bn': { es: 'Bengalí', en: 'Bengali' },
  'lang.ru': { es: 'Ruso', en: 'Russian' },
  'lang.ja': { es: 'Japonés', en: 'Japanese' },
  'lang.pa': { es: 'Punjabi', en: 'Punjabi' },
}

export function useLanguage() {
  function setLang(lang: SupportedLang): void {
    currentLang.value = lang
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  }

  function t(key: string): string {
    return translations[key]?.[currentLang.value] ?? key
  }

  return {
    lang: currentLang,
    setLang,
    t,
  }
}