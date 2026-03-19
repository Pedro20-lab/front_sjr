<script setup>
    import { ref } from 'vue';
    const checkin = ref()
    const checkout = ref()
</script>

<template>
  <label for="checkin">Entrada</label>
  <input id="checkin" name="checkin" type="date" value="{{ checkin }}">

  <label for="checkout">Salida</label>
  <input name="checkout" type="date" value="{{ checkout }}" >

</template>