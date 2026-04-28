<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

function getCookie(name) {
  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  try {
    // 1) Fetch CSRF cookie
    const csrfResponse = await fetch('/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include'
    })

    if (!csrfResponse.ok) {
      console.log('Error here')
      throw new Error('Could not initialize CSRF cookie.')
    }

    // 2) Submit login credentials
    const loginResponse = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    if (!loginResponse.ok) {
      throw new Error('Invalid login credentials.')
    }

    const payload = await loginResponse.json()
    const user = payload?.user ?? payload

    if (!user || typeof user !== 'object') {
      throw new Error('Login succeeded but no user payload was returned.')
    }

    // 3) Store user and navigate to search page
    authStore.setUser(user)
    await router.push({ name: 'search' })
  } catch (error) {
    errorMessage.value = error?.message || 'Unable to log in. Please try again.'
  } finally {
    loading.value = false
  }    

}

console.log(authStore.user)
</script>

<template>
  <section class="login-form-wrapper">
    <h1>Login</h1>

    <form class="login-form" @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" required />
      </label>

      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
.login-form-wrapper {
  max-width: 420px;
  margin: 3rem auto;
  padding: 1.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.login-form {
  display: grid;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

input,
button {
  min-height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font: inherit;
}

button {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  cursor: pointer;
}

button:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.error-message {
  margin-top: 0.75rem;
  color: #b91c1c;
}
</style>