<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  try {
    const response = await fetch('/api/user', {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })

    if (response.ok) {
      const user = await response.json()
      authStore.setUser(user)
      console.log('User authenticated:', user)
      router.push({ name: 'search' })
    }
  } catch {
    // not authenticated, stay on login
  }
})
</script>

<template>
  <RouterView />
</template>