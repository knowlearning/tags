<script setup>
  import { ref, watch } from 'vue'

  const { ids } = defineProps({ ids: String })

  const matches = ref([])
  const fetching = ref(false)

  async function update() {
    fetching.value = true
    await new Promise(r => setTimeout(r, 300))
    matches.value = await Agent.query('taggings', [ ids ])
    fetching.value = false
  }

  update()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Content</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="{ content_id, } in matches">
        <td>{{ content_id }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>
