<script setup lang="ts">
/* Logo de Upwards: letra U + flecha ascendente.
   En modo claro usa #00897B, en modo oscuro usa #FFD700.
   Se controla vía la clase .dark en <html>. */
</script>

<template>
  <svg
    class="logo-upwards"
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Upwards"
  >
    <!-- Letra U -->
    <path
      class="logo-u"
      d="M16 16V48C16 56.8366 23.1634 64 32 64H48C56.8366 64 64 56.8366 64 48V16"
      stroke="currentColor"
      stroke-width="7"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <!-- Flecha ascendente -->
    <path
      class="logo-arrow"
      d="M52 28L64 16L76 28"
      stroke="currentColor"
      stroke-width="7"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <line
      class="logo-arrow"
      x1="64"
      y1="16"
      x2="64"
      y2="46"
      stroke="currentColor"
      stroke-width="7"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.logo-upwards {
  display: block;
}

:root:not(.dark) .logo-upwards {
  color: #00897b;
}

:root.dark .logo-upwards {
  color: #ffd700;
}
</style>
