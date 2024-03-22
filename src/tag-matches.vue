<script setup>
  import { ref, watch } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagMatch from './tag-match.vue'
  import TagContributor from './tag-contributor.vue'

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

    matches.value = (await Agent.query('taggings-intersection', [ props.ids ])).map(
      ({ partition, content }) => {
        const rowData = {
          partition,
          name: content
        }

        if (props.ids.length === 1) {
          const tag = props.ids[0]
          rowData.contributor = { tag, partition, content }
        }

        rowData.other_tags = content

        return rowData
      }
    )

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
    <template v-slot:item.contributor="{ value: { tag, partition, content } }">
      <TagContributor
        :tag="tag"
        :partition="partition"
        :content="content"
      />
    </template>
    <template v-slot:item.other_tags="data">
      <TagMatch :id="data.value" />
    </template>
  </v-data-table>
</template>

<style scoped>
</style>
