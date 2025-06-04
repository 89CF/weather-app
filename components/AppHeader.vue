<template>
  <header class="header">
    <div class="header-content container mx-auto">
      <nav class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <NuxtLink to="/" class="header-text text-xl font-comic font-bold">
            {{ t('header.title') }}
          </NuxtLink>
        </div>
        
        <div class="flex items-center space-x-4">
          <button 
            @click="toggleColorMode" 
            class="theme-toggle-btn"
            :title="t('header.toggleTheme')"
          >
            <div class="theme-toggle-inner">
              <i :class="isDark ? 'fas fa-sun sun-icon' : 'fas fa-moon moon-icon'" class="theme-icon"></i>
              <div class="toggle-bg"></div>
            </div>
          </button>
          
          <LanguageSwitcher />
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useColorMode } from '#imports'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');

.font-comic {
  font-family: 'Comic Neue', cursive;
}

.theme-toggle-btn {
  position: relative;
  width: 60px;
  height: 32px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.theme-toggle-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-bg {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.theme-icon {
  position: relative;
  z-index: 2;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #2d3748;
}

.moon-icon {
  transform: translateX(-8px);
}

.sun-icon {
  transform: translateX(8px);
  color: #fbbf24;
}

/* Dark mode styles */
.dark .theme-toggle-btn {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .theme-toggle-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.dark .toggle-bg {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: translateX(30px);
}

/* Animation for smooth transition */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.theme-toggle-btn {
  animation: slideIn 0.3s ease-out;
}

/* Pulse effect on click */
.theme-toggle-btn:active {
  transform: translateY(-1px) scale(0.98);
}

/* Add a subtle glow effect */
.theme-toggle-btn::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 22px;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-toggle-btn:hover::before {
  opacity: 1;
}

.header-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.dark .header-button {
  background: rgba(17, 24, 39, 0.2);
  border-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text-light);
}

.dark .header-button:hover {
  background: rgba(17, 24, 39, 0.3);
}

.language-switcher {
  position: relative;
}

.language-switcher :deep(select) {
  max-height: 300px;
  overflow-y: auto;
}

select.header-button {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>