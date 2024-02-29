<script setup>
  import { ref, watch } from 'vue'
  import TagMatch from './tag-match.vue'

  const { ids } = defineProps({ ids: Array })

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
        <th>Tags</th>
      </tr>
    </thead>
    <tbody>
      <TagMatch
        v-for="{ content_id, } in matches"
        :id="content_id"
      />
    </tbody>
  </table>
</template>

<style scoped>
</style>
