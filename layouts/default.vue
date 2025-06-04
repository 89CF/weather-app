<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    
    <main class="flex-1">
      <slot />
    </main>
    
    <AppFooter class="mt-auto" />
  </div>
</template>

<script setup lang="ts">
// Components are auto-imported by Nuxt
</script>

<style>
/* Layout styles are handled by theme.css */
</style> 