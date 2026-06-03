// ============================================================================
// CONFIGURACIÓN CENTRALIZADA DE TEMA E ICONOS DE UPWARDS
// ============================================================================

// --- Iconos del logo (U de Upwards) ---
import lightIcon from '../assets/icons/lighticon.svg'
import darkIcon from '../assets/icons/blackicon.svg'

// --- Iconos de autenticación ---
import emailLight from '../assets/icons/clarity--email-dark.svg'
import emailDark from '../assets/icons/clarity--email-light.svg'
import lockLight from '../assets/icons/material-symbols-light--lock-outline.svg'
import lockDark from '../assets/icons/material-symbols-light--lock.svg'
import eyeOnLight from '../assets/icons/mdi--eye-outline.svg'
import eyeOnDark from '../assets/icons/mdi--eye.svg'
import eyeOffLight from '../assets/icons/mdi--eye-off-outline.svg'
import eyeOffDark from '../assets/icons/mdi--eye-off.svg'
import userLight from '../assets/icons/mdi--account-outline.svg'
import userDark from '../assets/icons/mdi--account.svg'

// --- Iconos del ThemeToggle ---
import darksunIcon from '../assets/icons/tabler--sun-high-filled.svg'
import darkmoonIcon from '../assets/icons/stash--moon-solid.svg'
import lightmoonIcon from '../assets/icons/stash--moon-light.svg'
import lightsunIcon from '../assets/icons/tabler--sun-high.svg'

// --- Iconos de navegación y acciones ---
import homeOutline from '../assets/icons/famicons--home-outline.svg'
import homeFill from '../assets/icons/famicons--home.svg'
import gymOutline from '../assets/icons/healthicons--gym-outline.svg'
import gymFill from '../assets/icons/healthicons--gym.svg'
import legOutline from '../assets/icons/healthicons--leg-outline.svg'
import legFill from '../assets/icons/healthicons--leg.svg'
import sixPack from '../assets/icons/hugeicons--body-part-six-pack.svg'
import leftBarOutline from '../assets/icons/icon-park-outline--left-bar.svg'
import leftBarSolid from '../assets/icons/icon-park-solid--left-bar.svg'
import checkBold from '../assets/icons/mdi--check-bold.svg'
import checkOutline from '../assets/icons/mdi--check-outline.svg'
import armFlexOutline from '../assets/icons/mdi--arm-flex-outline.svg'
import armFlexFill from '../assets/icons/mdi--arm-flex.svg'
import foodOutline from '../assets/icons/mdi--food-outline.svg'
import foodFill from '../assets/icons/mdi--food.svg'
import walletBifoldOutline from '../assets/icons/mdi--wallet-bifold-outline.svg'
import walletBifoldFill from '../assets/icons/mdi--wallet-bifold.svg'
import glassCupFill from '../assets/icons/mingcute--glass-cup-fill.svg'
import glassCupLine from '../assets/icons/mingcute--glass-cup-line.svg'
import trainFill from '../assets/icons/ph--train-fill.svg'
import trainLight from '../assets/icons/ph--train-light.svg'
import bookFill from '../assets/icons/si--book-fill.svg'
import bookLine from '../assets/icons/si--book-line.svg'
import worldDark from '../assets/icons/subway--world-dark.svg'
import worldLight from '../assets/icons/subway--world-light.svg'
import deleteBold from '../assets/icons/streamline-ultimate--delete-bold.svg'
import deleteFilled from '../assets/icons/weui--delete-filled.svg'
import deleteOutlined from '../assets/icons/weui--delete-outlined.svg'

// --- Siluetas corporales (no varían con el tema, se dejan fijas) ---
import bodyAvatarMusc from '../assets/icons/body-avatar-muscl.svg'
import bodyAvatarNorm from '../assets/icons/body-avatar-norm.svg'
import bodyAvatarObeso from '../assets/icons/body-avatar-obeso.svg'

// ============================================================================
// MAPEO DE ICONOS POR TEMA (INVERTIDO para corregir inversión previa)
// ============================================================================

export const themeIcons = {
  // Logo
  logo: {
    light: lightIcon,   // antes light: lightIcon
    dark: darkIcon,   // antes dark: darkIcon
  },
  // Campos de formulario
  email: {
    light: emailDark,
    dark: emailLight,
  },
  lock: {
    light: lockDark,
    dark: lockLight,
  },
  eyeOn: {
    light: eyeOnDark,
    dark: eyeOnLight,
  },
  eyeOff: {
    light: eyeOffDark,
    dark: eyeOffLight,
  },
  user: {
    light: userDark,
    dark: userLight,
  },
  // ThemeToggle (sol y luna)
  sun: {
    light: darksunIcon,
    dark: lightsunIcon,
  },
  moon: {
    light: darkmoonIcon,
    dark: lightmoonIcon,
  },
  // Navegación
  home: {
    light: homeFill,    // antes light: homeOutline
    dark: homeOutline,  // antes dark: homeFill
  },
  gym: {
    light: gymFill,
    dark: gymOutline,
  },
  leg: {
    light: legFill,
    dark: legOutline,
  },
  // Varios
  sixPack: {
    light: sixPack,
    dark: sixPack,
  },
  leftBar: {
    light: leftBarSolid,
    dark: leftBarOutline,
  },
  check: {
    light: checkBold,
    dark: checkOutline,
  },
  armFlex: {
    light: armFlexFill,
    dark: armFlexOutline,
  },
  food: {
    light: foodFill,
    dark: foodOutline,
  },
  wallet: {
    light: walletBifoldFill,
    dark: walletBifoldOutline,
  },
  glassCup: {
    light: glassCupFill,
    dark: glassCupLine,
  },
  train: {
    light: trainFill,
    dark: trainLight,
  },
  book: {
    light: bookFill,
    dark: bookLine,
  },
  world: {
    light: worldDark,
    dark: worldLight,
  },
  delete: {
    light: deleteFilled,
    dark: deleteOutlined,
  },
  deleteAlt: {
    light: deleteBold,
    dark: deleteBold,
  },
  // Siluetas corporales (sin cambio de tema)
  bodyMusc: {
    light: bodyAvatarMusc,
    dark: bodyAvatarMusc,
  },
  bodyNorm: {
    light: bodyAvatarNorm,
    dark: bodyAvatarNorm,
  },
  bodyObeso: {
    light: bodyAvatarObeso,
    dark: bodyAvatarObeso,
  },
}

// ============================================================================
// COLORES DE TEMA (modo claro / oscuro)
// ============================================================================

export const themeColors = {
  light: {
    primary: '#7CB342',       // Verde hoja unificado (mismo que el roadmap)
    primaryAlpha: 'rgba(124, 179, 66, 0.2)',
    background: '#e9e9e9ff',
    surface: '#FFFFFF',
    text: '#1a1a1a',
    textSecondary: '#888',
    border: '#e8e8e8',
    inputBg: '#e9e9e9f9',
    hover: 'rgba(0, 0, 0, 0.04)',
  },
  dark: {
    primary: '#FFD700',
    primaryAlpha: 'rgba(255, 215, 0, 0.2)',
    background: 'rgba(1, 1, 1, 1)',
    surface: '#121212',
    text: '#E0E0E0',
    textSecondary: '#999',
    border: '#333',
    inputBg: '#1212',
    hover: 'rgba(255, 255, 255, 0.04)',
  },
}