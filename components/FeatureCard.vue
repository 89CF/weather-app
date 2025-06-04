<template>
  <div class="card card-hover animate-fade-in">
    <h2 class="heading-3 text-primary-600 mb-2">
      {{ title }}
    </h2>
    <p class="body-text">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script> 