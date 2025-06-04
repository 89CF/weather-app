declare module '#imports' {
  export const useColorMode: () => {
    value: 'light' | 'dark' | 'system'
    preference: 'light' | 'dark' | 'system'
    force: boolean
    system: boolean
    set: (value: 'light' | 'dark' | 'system') => void
    toggle: () => void
  }
} 