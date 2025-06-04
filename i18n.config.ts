export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'auto',
  fallbackLocale: 'en',
  messages: {},
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
  sync: true,
  strategy: 'prefix',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root',
    alwaysRedirect: true,
    fallbackLocale: 'en'
  }
})) 