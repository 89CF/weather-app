// @ts-ignore
import { defineNuxtPlugin } from '#imports'
import type { NuxtApp } from 'nuxt/app'
import { useGeolocation } from '../composables/useGeolocation'
import { useGeocoding } from '../composables/useGeocoding'
import type { I18n } from 'vue-i18n'
import type { WritableComputedRef } from 'vue'

// Type declarations
type CountryCode = string
type LanguageCode = 
  | 'en' | 'de' | 'fr' | 'it' | 'es' | 'ru' | 'pl' | 'uk' | 'nl' | 'tr'  // Mevcut diller
  | 'ar' | 'zh' | 'ja' | 'ko' | 'pt' | 'sv' | 'hi'  // Yeni eklenen diller
  | 'he' | 'hu' | 'ms' | 'th' | 'vi' | 'id' | 'cs' | 'el' | 'fi' | 'da' | 'no'  // Diğer diller

// Map of country codes to primary language codes
const countryToPrimaryLanguage: Record<CountryCode, LanguageCode> = {
  // English-speaking countries
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en',
  // German-speaking countries
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  // French-speaking countries
  'FR': 'fr', 'LU': 'fr',
  // Italian-speaking countries
  'IT': 'it', 'SM': 'it', 'VA': 'it',
  // Spanish-speaking countries
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CL': 'es', 'CO': 'es', 'PE': 'es',
  // Russian-speaking countries
  'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru',
  // Polish-speaking countries
  'PL': 'pl',
  // Ukrainian-speaking countries
  'UA': 'uk',
  // Dutch-speaking countries
  'NL': 'nl',
  // Turkish-speaking countries
  'TR': 'tr', 'CY': 'tr',
  // Arabic-speaking countries
  'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'QA': 'ar', 'KW': 'ar', 'BH': 'ar', 'OM': 'ar',
  // Chinese-speaking countries
  'CN': 'zh', 'HK': 'zh', 'TW': 'zh', 'SG': 'zh',
  // Japanese-speaking countries
  'JP': 'ja',
  // Korean-speaking countries
  'KR': 'ko', 'KP': 'ko',
  // Portuguese-speaking countries
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
  // Swedish-speaking countries
  'SE': 'sv',
  // Hindi-speaking countries
  'IN': 'hi',
  // Hebrew-speaking countries
  'IL': 'he',
  // Hungarian-speaking countries
  'HU': 'hu',
  // Malay-speaking countries
  'MY': 'ms', 'BN': 'ms',
  // Thai-speaking countries
  'TH': 'th',
  // Vietnamese-speaking countries
  'VN': 'vi',
  // Indonesian-speaking countries
  'ID': 'id',
  // Czech-speaking countries
  'CZ': 'cs',
  // Greek-speaking countries
  'GR': 'el',
  // Finnish-speaking countries
  'FI': 'fi',
  // Danish-speaking countries
  'DK': 'da',
  // Norwegian-speaking countries
  'NO': 'no'
}

// Map of country codes to additional language codes
const countryToAdditionalLanguages: Record<CountryCode, LanguageCode[]> = {
  'BE': ['nl', 'fr'], // Belgium: Dutch and French
  'CH': ['de', 'fr', 'it'], // Switzerland: German, French, and Italian
  'CA': ['fr'], // Canada: French
  'SG': ['en', 'zh', 'ms'], // Singapore: English, Chinese, and Malay
  'ZA': ['en'], // South Africa: English (removed 'af' as it's not in LanguageCode)
  'IN': ['en', 'hi'], // India: English and Hindi
  'MY': ['en', 'ms', 'zh'], // Malaysia: English, Malay, and Chinese
  'AE': ['en', 'ar'], // UAE: English and Arabic
  'HK': ['en', 'zh'], // Hong Kong: English and Chinese
  'IL': ['en', 'he', 'ar'] // Israel: English, Hebrew, and Arabic
}

// Available languages in our app
const availableLanguages: LanguageCode[] = [
  'en', 'de', 'fr', 'it', 'es', 'ru', 'pl', 'uk', 'nl', 'tr',  // Mevcut diller
  'ar', 'zh', 'ja', 'ko', 'pt', 'sv', 'hi',  // Yeni eklenen diller
  'he', 'hu', 'ms', 'th', 'vi', 'id', 'cs', 'el', 'fi', 'da', 'no'  // Diğer diller
]

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  const { getCurrentPosition } = useGeolocation()
  const { getCityFromCoordinates } = useGeocoding()
  
  // Get i18n instance
  const i18n = nuxtApp.$i18n as unknown as I18n
  
  // Ensure i18n is properly initialized
  if (!i18n?.global?.locale) {
    console.warn('i18n not properly initialized')
    return
  }
  
  const locale = i18n.global.locale as WritableComputedRef<string>

  // Function to get language from browser
  const getBrowserLanguage = (): LanguageCode | null => {
    // Check if we're in a browser environment
    if (process.server || typeof navigator === 'undefined') {
      return null // Return null on server-side to trigger location-based detection
    }
    
    const browserLang = navigator.language.split('-')[0] as LanguageCode
    return availableLanguages.includes(browserLang) ? browserLang : null
  }

  // Function to get language from location
  const getLocationLanguage = async (): Promise<LanguageCode | null> => {
    // Skip location-based detection on server-side
    if (process.server) {
      return null
    }

    try {
      const position = await getCurrentPosition()
      const { coords } = position
      if (!coords.latitude || !coords.longitude) return null

      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
      )

      if (!response.ok) return null

      const data = await response.json()
      const countryCode = data.countryCode?.toUpperCase() as CountryCode
      
      if (!countryCode) return null

      // Check for additional languages first (more specific)
      if (countryToAdditionalLanguages[countryCode]) {
        const browserLang = navigator.language.split('-')[0] as LanguageCode
        const additionalLangs = countryToAdditionalLanguages[countryCode]
        if (additionalLangs.includes(browserLang)) {
          return browserLang
        }
      }

      // Fall back to primary language
      const primaryLang = countryToPrimaryLanguage[countryCode]
      return primaryLang && availableLanguages.includes(primaryLang) ? primaryLang : null
    } catch (error) {
      console.error('Error getting location language:', error)
      return null
    }
  }

  // Function to determine the best language
  const determineBestLanguage = async (): Promise<LanguageCode> => {
    // Skip language detection on server-side
    if (process.server) {
      return 'en'
    }

    try {
      // First try to get language from cookie
      const savedLocale = localStorage.getItem('i18n_redirected')
      if (savedLocale && availableLanguages.includes(savedLocale as LanguageCode)) {
        console.log('Using saved locale:', savedLocale)
        return savedLocale as LanguageCode
      }

      // Then try location-based detection
      const locationLang = await getLocationLanguage()
      if (locationLang) {
        console.log('Location-based language detected:', locationLang)
        return locationLang
      }

      // Then try browser language
      const browserLang = getBrowserLanguage()
      if (browserLang) {
        console.log('Browser language detected:', browserLang)
        return browserLang
      }

      // Finally, try IP-based detection
      try {
        const response = await fetch('https://ipapi.co/json/')
        if (response.ok) {
          const data = await response.json()
          const countryCode = data.country_code?.toUpperCase() as CountryCode
          
          if (countryCode) {
            // Check primary language
            const primaryLang = countryToPrimaryLanguage[countryCode]
            if (primaryLang && availableLanguages.includes(primaryLang)) {
              console.log('IP-based language detected:', primaryLang)
              return primaryLang
            }
            
            // Check additional languages
            const additionalLangs = countryToAdditionalLanguages[countryCode]
            if (additionalLangs && additionalLangs.length > 0) {
              const browserLang = navigator.language.split('-')[0] as LanguageCode
              if (additionalLangs.includes(browserLang)) {
                console.log('Additional language detected:', browserLang)
                return browserLang
              }
              console.log('First additional language used:', additionalLangs[0])
              return additionalLangs[0]
            }
          }
        }
      } catch (error) {
        console.error('Error getting IP-based language:', error)
      }
    } catch (error) {
      console.error('Error in language detection:', error)
    }

    // Fallback to English
    console.log('Using default language: en')
    return 'en'
  }

  // Only run language detection on client-side
  if (!process.server) {
    try {
      // Set initial locale
      const initialLocale = await determineBestLanguage()
      if (locale) {
        locale.value = initialLocale
        localStorage.setItem('i18n_redirected', initialLocale)

        // Watch for locale changes
        watch(() => locale.value, (newLocale) => {
          localStorage.setItem('i18n_redirected', newLocale)
        })
      }
    } catch (error) {
      console.error('Error setting initial locale:', error)
      if (locale) {
        locale.value = 'en'
      }
    }
  }
}) 