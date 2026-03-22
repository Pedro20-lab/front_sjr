<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const guestCount = ref(1)
const guests = ref([])

const maxGuests = computed(() => {
  const capacity = Number(props.room?.capacidad_habitacion)
  return Number.isFinite(capacity) && capacity > 0 ? capacity : 6
})

function createEmptyGuest() {
  return {
    name: '',
    lastname: '',
    nacionality: '',
    documentType: '',
    documentNumber: '',
    phoneNumber: ''
  }
}

function syncGuests(nextCount) {
  const desiredLength = Math.max(1, Number(nextCount) || 1)

  if (guests.value.length > desiredLength) {
    guests.value = guests.value.slice(0, desiredLength)
    return
  }

  while (guests.value.length < desiredLength) {
    guests.value.push(createEmptyGuest())
  }
}

watch(guestCount, (nextValue) => {
  if (nextValue > maxGuests.value) {
    guestCount.value = maxGuests.value
    return
  }

  syncGuests(nextValue)
})

watch(
  () => props.room,
  () => {
    guestCount.value = 1
    guests.value = [createEmptyGuest()]
  },
  { immediate: true }
)
</script>

<template>
  <section class="guest-form">
    <h2>Guest information for room {{ room.numero_habitacion }}</h2>

    <label>
      Number of guests
      <input v-model.number="guestCount" type="number" min="1" :max="maxGuests" />
    </label>

    <p class="capacity-note">Maximum guests allowed: {{ maxGuests }}</p>

    <div v-for="(guest, index) in guests" :key="index" class="guest-card">
      <h3>Guest {{ index + 1 }}</h3>

      <div class="guest-grid">
        <label>
          Name
          <input v-model="guest.name" type="text" />
        </label>

        <label>
          Lastname
          <input v-model="guest.lastname" type="text" />
        </label>

        <label>
          Nacionality
          <input v-model="guest.nacionality" type="text" />
        </label>

        <label>
          Type of document
          <input v-model="guest.documentType" type="text" />
        </label>

        <label>
          Number of document
          <input v-model="guest.documentNumber" type="text" />
        </label>

        <label>
          Telephone number
          <input v-model="guest.phoneNumber" type="tel" />
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.guest-form {
  margin-top: 1.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  background: #f8fafc;
}

.guest-form h2 {
  margin-top: 0;
}

.capacity-note {
  margin: 0.5rem 0 1rem;
  color: #475569;
}

.guest-card {
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem;
  background: #fff;
}

.guest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

input {
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.65rem;
  font: inherit;
}
</style>