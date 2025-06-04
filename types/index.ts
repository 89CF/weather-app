export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface Feature {
  id: string
  title: string
  description: string
  icon?: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface AppConfig {
  theme: Theme
  language: string
  features: Feature[]
} 