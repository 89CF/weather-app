import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  // Ana sayfaya gelen istekleri kontrol et
  if (to.path === '/') {
    // Sunucu tarafında çalışıyorsa varsayılan dile yönlendir
    if (process.server) {
      return navigateTo('/en')
    }

    // İstemci tarafında çalışıyorsa tarayıcı dilini kontrol et
    if (process.client) {
      // Tarayıcı dilini al
      const browserLang = navigator.language.split('-')[0]
      
      // Desteklenen diller listesi
      const supportedLocales = ['en', 'tr', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'zh', 'ar', 'ko', 'hi', 'sv', 'nl', 'pl', 'uk', 'da', 'fi', 'no', 'el', 'cs', 'he', 'id', 'ms', 'th', 'hu', 'vi']
      
      // Desteklenen diller listesinde tarayıcı dili var mı kontrol et
      if (supportedLocales.includes(browserLang)) {
        // Eğer desteklenen bir dil ise, o dile yönlendir
        return navigateTo(`/${browserLang}`)
      }
    }

    // Varsayılan dile yönlendir
    return navigateTo('/en')
  }
}) 