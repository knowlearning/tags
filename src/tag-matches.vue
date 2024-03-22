<script setup>
  import { ref, watch } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagMatch from './tag-match.vue'

  const props = defineProps({ ids: Array })

  const matches = ref([])
  const loading = ref(true)
  let lastPromise = null

  update()
  watch(() => props.ids, () => update())

  async function update() {
    loading.value = true
    const thisPromise = new Promise(r => setTimeout(r, 300))
    lastPromise = thisPromise
    await thisPromise

    if (thisPromise !== lastPromise) return

    matches.value = (
      await Agent.query('taggings', [ props.ids ])
    ).map(({ content_id: id }) => ({ name: id, owner: id, tags: id }))
    loading.value = false
  }

</script>

<template>
  <v-data-table
    sticky
    :items="matches"
    :loading="loading"
  >
    <template v-slot:item.id="data">
      <vueScopeComponent
        :id="data.value"
        metadata
        :path="['name']"
      />
    </template>
    <template v-slot:item.owner="data">
      <vueScopeComponent
        :id="data.value"
        metadata
        :path="['owner']"
      />
    </template>
    <template v-slot:item.tags="data">
      <TagMatch :id="data.value" />
    </template>
  </v-data-table>
</template>

<style scoped>
</style>
