<template>
  <footer class="footer">
    <div class="footer-content container mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div class="flex items-center space-x-4">
          <a 
            href="https://github.com/89CF" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer-link flex items-center space-x-2"
          >
            <i class="fab fa-github text-xl"></i>
            <span class="footer-text">{{ t('Github') }}</span>
          </a>
        </div>
        
        <div class="flex items-center space-x-4">
          <a 
            href="https://github.com/89CF/weather-app" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer-link"
          >
            <span class="footer-text">{{ t('School Project - OOP') }}</span>
          </a>
          
          <span class="footer-text text-sm">
            &copy; {{ new Date().getFullYear() }} {{ t('footer.copyright') }}
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');

.font-comic {
  font-family: 'Comic Neue', cursive;
}

.footer-link {
  transition: var(--transition-fast);
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-primary);
  transition: var(--transition-fast);
}

.footer-link:hover::after {
  width: 100%;
}

@media (max-width: 640px) {
  .footer-content {
    text-align: center;
  }
}
</style> 