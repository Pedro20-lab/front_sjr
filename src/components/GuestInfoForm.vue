<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  room: {
    type: Object,
    required: true
  }
})

const guestCount = ref(1)
const guests = ref([])
const bookingStatus = ref('')
const bookingError = ref('')
const bookingLoading = ref(false)
const guestLookupError = ref('')

const authStore = useAuthStore()

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
    bookingStatus.value = ''
    bookingError.value = ''
  },
  { immediate: true }
)

async function submitBooking() {
  bookingStatus.value = ''
  bookingError.value = ''

  if (!authStore.user) {
    bookingError.value = 'Please log in before submitting a booking.'
    return
  }

  bookingLoading.value = true

  const bookingPayload = {
    empleado_id: authStore.user.id_empleado,
    habitacion_id: props.room.id_habitacion,
    check_in: props.checkIn,
    check_out: props.checkOut,
    guests: guests.value
  }

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(bookingPayload)
    })

    if (!response.ok) {
      throw new Error(`Booking failed with status ${response.status}`)
    }

    bookingStatus.value = 'Booking submitted successfully.'
  } catch (error) {
    bookingError.value = error?.message || 'Unable to submit booking right now.'
  } finally {
    bookingLoading.value = false
  }
}

function clearGuestAutofillFields(guest) {
  guest.name = ''
  guest.lastname = ''
  guest.nacionality = ''
  guest.phoneNumber = ''
}

async function lookupGuestByDocument(guest) {
  guestLookupError.value = ''
  const documentNumber = guest.documentNumber?.trim()

  if (!documentNumber) {
    return
  }

  try {
    const response = await fetch(`/api/huesped/find?num_doc_huesped=${encodeURIComponent(documentNumber)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json'
      }
    })

    if (response.status === 404) {
      clearGuestAutofillFields(guest)
      return
    }

    if (!response.ok) {
      throw new Error(`Guest lookup failed with status ${response.status}`)
    }

    const payload = await response.json()
    const guestData = payload?.data ?? payload

    if (!guestData) {
      clearGuestAutofillFields(guest)
      return
    }

    guest.name = guestData.nombre_huesped ?? ''
    guest.lastname = guestData.apellido_huesped ?? ''
    guest.nacionality = guestData.nacionalidad_huesped ?? ''
    guest.phoneNumber = guestData.telefono_huesped ?? ''
    guest.documentType = guestData.tipo_doc_huesped ?? ''
  } catch (error) {
    guestLookupError.value = error?.message || 'Unable to lookup guest by document.'
  }
}
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
          <input v-model="guest.documentNumber" type="text" @blur="lookupGuestByDocument(guest)"/>
        </label>

        <label>
          Telephone number
          <input v-model="guest.phoneNumber" type="tel" />
        </label>
      </div>
    </div>
    <button class="submit-booking" type="button" :disabled="bookingLoading" @click="submitBooking">
      {{ bookingLoading ? 'Submitting booking...' : 'Submit booking' }}
    </button>

    <p v-if="bookingStatus" class="booking-status">{{ bookingStatus }}</p>
    <p v-if="bookingError" class="booking-error">{{ bookingError }}</p>
    <p v-if="guestLookupError" class="booking-error">{{ guestLookupError }}</p>
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

input,
.submit-booking  {
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.65rem;
  font: inherit;
}

.submit-booking {
  margin-top: 0.5rem;
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  cursor: pointer;
}

.submit-booking:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.booking-status {
  margin-top: 0.6rem;
  color: #166534;
}

.booking-error {
  margin-top: 0.6rem;
  color: #b91c1c;
}
</style>