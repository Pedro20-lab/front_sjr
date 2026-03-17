<script setup>
defineProps({
  room: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="room-card">
    <h3>Room {{ room.numero_habitacion }}</h3>
    <p><strong>Type:</strong> {{ room.tipo_habitacion }}</p>
    <p><strong>Price:</strong> ${{ room.precio_habitacion }} / night</p>
    <p><strong>Capacity:</strong> {{ room.capacidad_habitacion }} guests</p>
  </article>
</template>

<style scoped>
.room-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.room-card h3 {
  margin: 0 0 0.75rem;
  color: #0f172a;
}

.room-card p {
  margin: 0.35rem 0;
  color: #334155;
}
</style>