<script setup>
  import { ref, watch } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagMatch from './tag-match.vue'
  import TagContributor from './tag-contributor.vue'

  const props = defineProps({ partition: String, id: String, ids: Array })

  const matches = ref([])
  const loading = ref(true)
  let lastPromise = null

  const headers = ref([
    { key: 'target', title: 'Target' }
  ])

  if (props.id) {
    headers.value.unshift({ key: 'remove', title: '' })
    headers.value.push(
      { key: 'contributor', title: 'Contributor' },
      { key: 'value', title: 'Value' }
    )
  }
  else {
    headers.value.push({
      key: 'other_tags',
      title: 'Other Tags'
    })
  }

  update()
  watch(() => props.ids, () => update())

  async function update() {
    loading.value = true

    const thisPromise = new Promise(r => setTimeout(r, 300))
    lastPromise = thisPromise
    await thisPromise

    if (thisPromise !== lastPromise) return

    const query = () => {
      if (props.id) return Agent.query('taggings-for-tag', [props.id, props.partition])
      else return Agent.query('taggings-intersection', [props.ids, props.partition])
    }

    matches.value = (await query()).map(
      ({ partition, target, value }) => {
        const rowData = {
          remove: target,
          target,
          contributor: { tag: props.id, partition, target },
          other_tags: target,
          value
        }

        return rowData
      }
    )

    loading.value = false
  }

  //  TODO: move this to a store so store manages user tags state centrally
  async function removeTagging(target) {
    const tags = await Agent.state('tags')
    tags[props.id][target] = { value: null }
    console.log('REMOVING!!!!', tags, props.id, target)
  }

</script>

<template>
  <v-data-table
    sticky
    :items="matches"
    :loading="loading"
    :headers="headers"
  >
    <template v-slot:item.id="data">
      <vueScopeComponent
        :id="data.value"
        metadata
        :path="['name']"
      />
    </template>
    <template v-slot:item.remove="data">
      <v-btn
        variant="plain"
        icon="fa-solid fa-remove"
        @click="removeTagging(data.value)"
      />
    </template>
    <template v-slot:item.owner="data">
      <vueScopeComponent
        :id="data.value"
        metadata
        :path="['owner']"
      />
    </template>
    <template v-slot:item.contributor="{ value: { tag, partition, target } }">
      <TagContributor
        :tag="tag"
        :partition="partition"
        :target="target"
      />
    </template>
    <template v-slot:item.other_tags="data">
      <TagMatch :id="data.value" />
    </template>
    <template v-slot:item.value="data">
      <pre>{{ data.value }}</pre>
    </template>
  </v-data-table>
</template>

<style scoped>
</style>
