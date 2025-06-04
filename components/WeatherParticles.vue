<template>
  <ClientOnly>
    <div ref="container" class="weather-particles-container"></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Scene, PerspectiveCamera, WebGLRenderer, Points, Material, BufferGeometry, PointsMaterial, TextureLoader } from 'three'

const props = defineProps<{
  weatherType: 'rain' | 'snow' | 'mist'
  intensity?: number // 0-1 arası
  size?: 'sm' | 'md' | 'lg'
}>()

const container = ref<HTMLElement | null>(null)
let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer
let particles: Points
let animationFrameId: number
let THREE: any

// Parçacık sistemi için gerekli değişkenler
const PARTICLE_COUNT = {
  rain: 1000,
  snow: 500,
  mist: 2000
}

const PARTICLE_SPEED = {
  rain: 0.5,
  snow: 0.2,
  mist: 0.1
}

const PARTICLE_SIZE = {
  rain: 0.1,
  snow: 0.2,
  mist: 0.05
}

// Container boyutlarını hesapla
const getContainerSize = () => {
  if (!container.value) return { width: 0, height: 0 }
  const size = container.value.getBoundingClientRect()
  return {
    width: size.width,
    height: size.height
  }
}

// Parçacık geometrisi oluştur
const createParticleGeometry = () => {
  if (!THREE) return null
  
  const count = PARTICLE_COUNT[props.weatherType]
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // Rastgele pozisyonlar
    positions[i * 3] = (Math.random() - 0.5) * 2
    positions[i * 3 + 1] = Math.random() * 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2

    // Renkler
    if (props.weatherType === 'rain') {
      colors[i * 3] = 0.5     // R
      colors[i * 3 + 1] = 0.7 // G
      colors[i * 3 + 2] = 1.0 // B
    } else if (props.weatherType === 'snow') {
      colors[i * 3] = 0.9     // R
      colors[i * 3 + 1] = 0.9 // G
      colors[i * 3 + 2] = 1.0 // B
    } else {
      colors[i * 3] = 0.8     // R
      colors[i * 3 + 1] = 0.8 // G
      colors[i * 3 + 2] = 0.8 // B
    }

    // Boyutlar
    sizes[i] = PARTICLE_SIZE[props.weatherType] * (0.5 + Math.random() * 0.5)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  return geometry
}

// Parçacık materyali oluştur
const createParticleMaterial = () => {
  if (!THREE) return null

  const textureLoader = new THREE.TextureLoader()
  let texture

  if (props.weatherType === 'rain') {
    texture = textureLoader.load('/textures/raindrop.png')
  } else if (props.weatherType === 'snow') {
    texture = textureLoader.load('/textures/snowflake.png')
  } else {
    texture = textureLoader.load('/textures/mist.png')
  }

  return new THREE.PointsMaterial({
    size: PARTICLE_SIZE[props.weatherType],
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  })
}

// Three.js sahnesini başlat
const initThree = async () => {
  if (!container.value) return

  try {
    // Three.js'i dinamik olarak yükle
    THREE = await import('three')
    
    const { width, height } = getContainerSize()
    
    // Sahne oluştur
    scene = new THREE.Scene()
    
    // Kamera oluştur
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 2
    
    // Renderer oluştur
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.value.appendChild(renderer.domElement)
    
    // Parçacık sistemi oluştur
    const geometry = createParticleGeometry()
    const material = createParticleMaterial()
    
    if (geometry && material) {
      particles = new THREE.Points(geometry, material)
      scene.add(particles)
    }
  } catch (error) {
    console.error('Three.js yüklenirken hata oluştu:', error)
  }
}

// Animasyon döngüsü
const animate = () => {
  if (!particles || !renderer || !scene || !camera) return

  const positions = particles.geometry.attributes.position.array as Float32Array
  const speed = PARTICLE_SPEED[props.weatherType] * (props.intensity || 1)

  for (let i = 0; i < positions.length; i += 3) {
    // Parçacıkları hareket ettir
    positions[i + 1] -= speed

    // Ekranın altına düşen parçacıkları tekrar yukarı al
    if (positions[i + 1] < -1) {
      positions[i + 1] = 1
      positions[i] = (Math.random() - 0.5) * 2
      positions[i + 2] = (Math.random() - 0.5) * 2
    }
  }

  particles.geometry.attributes.position.needsUpdate = true
  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

// Pencere boyutu değiştiğinde
const handleResize = () => {
  if (!container.value || !camera || !renderer) return

  const { width, height } = getContainerSize()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Props değiştiğinde
watch(() => props.weatherType, async () => {
  if (!THREE) {
    await initThree()
    return
  }

  if (particles) {
    scene.remove(particles)
    particles.geometry.dispose()
    ;(particles.material as Material).dispose()
  }

  const geometry = createParticleGeometry()
  const material = createParticleMaterial()
  
  if (geometry && material) {
    particles = new THREE.Points(geometry, material)
    scene.add(particles)
  }
})

// Component mount olduğunda
onMounted(async () => {
  await initThree()
  animate()
  window.addEventListener('resize', handleResize)
})

// Component unmount olduğunda
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  
  if (particles) {
    particles.geometry.dispose()
    ;(particles.material as Material).dispose()
  }
  
  if (renderer) {
    renderer.dispose()
    container.value?.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.weather-particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.weather-particles-container canvas {
  width: 100% !important;
  height: 100% !important;
}
</style> 