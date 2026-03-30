import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  function setUser(nextUser) {
    user.value = nextUser
  }

  function clearUser() {
    user.value = null
  }

  return {
    user,
    setUser,
    clearUser
  }
})
