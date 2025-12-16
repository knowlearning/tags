<script setup>
  import { ref, watch } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagContributor from './tag-contributor.vue'
  import ContentName from './content-name.vue'
  import { format as datefnsFormat } from 'date-fns';

  const props = defineProps({ partition: String, id: String, ids: Array })
  const emit = defineEmits(['untag'])

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
      { key: 'value', title: 'Value' },
      { key: 'timestamp', title: 'Timestamp' },
    )
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
      if (props.id) return Agent.query('taggings-for-tag', [props.partition, props.id])
      else return Agent.query('taggings-intersection', [props.partition, props.ids])
    }

    matches.value = (await query()).map(
      ({ target, value, timestamp }) => {
        const rowData = {
          id: target, // default key for rows in v-data-table
          remove: target,
          target,
          contributor: {
            tag: props.id,
            partition: props.partition,
            target
          },
          value,
          timestamp
        }

        return rowData
      }
    )

    loading.value = false
  }

  //  TODO: move this to a store so store manages user tags state centrally
  async function removeTagging(target) {
    const tags = await Agent.state('tags')
    if (!tags[props.id]) tags[props.id] = {}
    tags[props.id][target] = { partition: props.partition, value: null }
    update()
    emit('untag', props.id)
  }

  function formatDateTime(timestamp) {
    console.log(timestamp)
    return datefnsFormat(timestamp, 'MMM d, yyyy H:mm')
  }

</script>

<template>
  <v-data-table
    sticky
    :items="matches"
    :loading="loading"
    :headers="headers"
    item-value="id"
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
    <template v-slot:item.target="{ value:target }">
      <ContentName :id="target" />
    </template>
    <template v-slot:item.value="data">
      <pre>{{ data.value }}</pre>
    </template>
    <template v-slot:item.timestamp="{ value: timestamp }">
      <pre>{{ formatDateTime(timestamp) }}</pre>
    </template>
  </v-data-table>
</template>

<style scoped>
</style>
