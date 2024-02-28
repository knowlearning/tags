<script setup>
  import { ref, watch } from 'vue'

  const { id } = defineProps({ id: String })

  const myTags = ref(null)
  const matches = ref([])
  const fetching = ref(false)

  Agent.state('tags').then(state => myTags.value = state)
  async function update() {
    fetching.value = true
    await new Promise(r => setTimeout(r, 300))
    matches.value = await Agent.query('taggings', [ [id] ])
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
      <tr>
        <td>
          <span v-if="fetching">updating...</span>
          <input
            v-else
            placeholder="Add tag"
            @keypress.enter="event => {
              if (!myTags[id]) myTags[id] = {}
              myTags[id][event.target.value] = true
              event.target.value = ''
              update()
            }"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>
