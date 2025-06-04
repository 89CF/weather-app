// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineNuxtConfig({
  compatibilityDate: '2025-06-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },
  i18n: {
    vueI18n: './i18n.config.ts',
    langDir: 'i18n/locales',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'tr', iso: 'tr-TR', name: 'Türkçe', file: 'tr.json' },
      { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'fr', iso: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'it', iso: 'it-IT', name: 'Italiano', file: 'it.json' },
      { code: 'pt', iso: 'pt-PT', name: 'Português', file: 'pt.json' },
      { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'ja', iso: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'ar', iso: 'ar-SA', name: 'العربية', file: 'ar.json' },
      { code: 'ko', iso: 'ko-KR', name: '한국어', file: 'ko.json' },
      { code: 'hi', iso: 'hi-IN', name: 'हिन्दी', file: 'hi.json' },
      { code: 'sv', iso: 'sv-SE', name: 'Svenska', file: 'sv.json' },
      { code: 'nl', iso: 'nl-NL', name: 'Nederlands', file: 'nl.json' },
      { code: 'pl', iso: 'pl-PL', name: 'Polski', file: 'pl.json' },
      { code: 'uk', iso: 'uk-UA', name: 'Українська', file: 'uk.json' },
      { code: 'da', iso: 'da-DK', name: 'Dansk', file: 'da.json' },
      { code: 'fi', iso: 'fi-FI', name: 'Suomi', file: 'fi.json' },
      { code: 'no', iso: 'no-NO', name: 'Norsk', file: 'no.json' },
      { code: 'el', iso: 'el-GR', name: 'Ελληνικά', file: 'el.json' },
      { code: 'cs', iso: 'cs-CZ', name: 'Čeština', file: 'cs.json' },
      { code: 'he', iso: 'he-IL', name: 'עברית', file: 'he.json' },
      { code: 'id', iso: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'ms', iso: 'ms-MY', name: 'Bahasa Melayu', file: 'ms.json' },
      { code: 'th', iso: 'th-TH', name: 'ไทย', file: 'th.json' },
      { code: 'hu', iso: 'hu-HU', name: 'Magyar', file: 'hu.json' },
      { code: 'vi', iso: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: true,
      fallbackLocale: 'en'
    }
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'weather-theme',
    dataValue: 'theme',
    disableTransition: false
  },
  app: {
    head: {
      titleTemplate: '%s - Weather Forecast',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real-time weather forecasts and updates for cities worldwide' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#1f2937', media: '(prefers-color-scheme: dark)' }
      ],
      htmlAttrs: {
        lang: 'en',
        class: 'light'
      },
      bodyAttrs: {
        class: 'antialiased'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    weatherApiKey: process.env.WEATHER_API_KEY || '',
    public: {
      apiBase: '/api'
    }
  },
  nitro: {
    routeRules: {
      '/_nuxt/**': { 
        headers: { 
          'cache-control': 'public, max-age=31536000, immutable',
          'vary': 'Accept-Encoding'
        } 
      },
      '/api/**': { 
        cors: process.env.NODE_ENV === 'development',
        headers: {
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://your-domain.com',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    }
  },
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    componentIslands: true,
    typedPages: true
  },
  build: {
    transpile: ['vue-i18n', '@nuxtjs/color-mode', 'three']
  },
  vite: {
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'ui': ['@heroicons/vue', '@fortawesome/vue-fontawesome'],
            'i18n': ['vue-i18n']
          }
        }
      },
      minify: 'esbuild'
    },
    optimizeDeps: {
      exclude: ['vue-demi', 'unhead'],
      include: ['three']
    },
    resolve: {
      alias: {
        '@locales': resolve(__dirname, './i18n/locales'),
        '@i18n': resolve(__dirname, './i18n')
      }
    }
  }
}) 