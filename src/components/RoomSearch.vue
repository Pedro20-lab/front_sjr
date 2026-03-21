<script setup>
import { ref } from 'vue'
import RoomCard from './RoomCard.vue'

const checkInDate = ref('')
const checkOutDate = ref('')
const availableRooms = ref([])
const loading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

const API_BASE_URL = '/api'

async function searchRooms() {
  errorMessage.value = ''

  if (!checkInDate.value || !checkOutDate.value) {
    errorMessage.value = 'Por favor elija las fechas de check-in y check-out'
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    const query = new URLSearchParams({
      check_in: checkInDate.value,
      check_out: checkOutDate.value
    })

    const response = await fetch(`${API_BASE_URL}/rooms/available?${query.toString()}`)

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    availableRooms.value = Array.isArray(data.habitacionesDisponibles) ? data.habitacionesDisponibles : []
  } catch (error) {
    availableRooms.value = []
    errorMessage.value = 'Unable to load available rooms. Please try again.'
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="room-search">
    <h1>Buscar habitaciones disponibles</h1>

    <form class="search-form" @submit.prevent="searchRooms">
      <label>
        Check-in
        <input v-model="checkInDate" type="date" />
      </label>

      <label>
        Check-out
        <input v-model="checkOutDate" type="date" />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Buscando...' : 'Buscar habitaciones' }}
      </button>
    </form>

    <p v-if="loading" class="status">Cargando habitaciones disponibles...</p>
    <p v-if="errorMessage" class="status error">{{ errorMessage }}</p>
    <p v-else-if="hasSearched && !loading && availableRooms.length === 0" class="status">
      No hay habitaciones disponibles para las fechas seleccionadas
    </p>

    <div v-if="availableRooms.length" class="room-grid">
      <RoomCard 
        v-for="room in availableRooms" 
        :key="room.id_habitacion ?? room.numero_habitacion" 
        :room="room" />
    </div>
  </section>
</template>

<style scoped>
.room-search {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  margin-bottom: 1rem;
  color: #0f172a;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: #1e293b;
}

input,
button {
  min-height: 40px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 0.45rem 0.75rem;
  font: inherit;
}

button {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status {
  margin: 0.75rem 0;
  color: #475569;
}

.status.error {
  color: #b91c1c;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
</style>