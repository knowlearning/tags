<script setup>
  import { computed, ref, watch } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import { format as datefnsFormat } from 'date-fns'
  import TagContributor from './tag-contributor.vue'
  import ContentName from './content-name.vue'
  import { mutateTag } from './tag-mutations.js'

  const props = defineProps({
    partition: String,
    id: String,
    ids: Array,
    optimisticTargets: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['untag'])

  const matches = ref([])
  const loading = ref(true)

  let lastPromise = null

  const displayedMatches = computed(() => {
    const knownTargets = new Set(
      matches.value.map(match => match.target)
    )

    const optimisticMatches = props.optimisticTargets
      .filter(target => !knownTargets.has(target))
      .map(target => ({
        id: target,
        remove: target,
        target,
        contributor: {
          tag: props.id,
          partition: props.partition,
          target
        },
        value: true,
        timestamp: Date.now()
      }))

    return [
      ...matches.value,
      ...optimisticMatches
    ]
  })

  const headers = ref([
    { key: 'target', title: 'Target' }
  ])

  if (props.id) {
    headers.value.unshift({
      key: 'remove',
      title: ''
    })

    headers.value.push(
      { key: 'contributor', title: 'Contributor' },
      { key: 'value', title: 'Value' },
      { key: 'timestamp', title: 'Timestamp' }
    )
  }

  update()

  watch(
    () => props.ids,
    () => update()
  )

  async function update() {
    loading.value = true

    const thisPromise = new Promise(
      resolve => setTimeout(resolve, 300)
    )

    lastPromise = thisPromise
    await thisPromise

    if (thisPromise !== lastPromise) return

    const query = () => {
      if (props.id) {
        return Agent.query(
          'taggings-for-tag',
          [props.partition, props.id]
        )
      }

      return Agent.query(
        'taggings-intersection',
        [props.partition, props.ids]
      )
    }

    matches.value = (await query()).map(
      ({ target, value, timestamp }) => ({
        id: target,
        remove: target,
        target,
        contributor: {
          tag: props.id,
          partition: props.partition,
          target
        },
        value,
        timestamp
      })
    )

    loading.value = false
  }

  async function removeTagging(target) {
    matches.value = matches.value.filter(
      match => match.target !== target
    )

    await mutateTag({
      partition: props.partition,
      tag: props.id,
      target,
      value: null,
      onConfirmed: update,
      onFailed: update
    })

    emit('untag', props.id, target)
  }

  function formatDateTime(timestamp) {
    return datefnsFormat(timestamp, 'MMM d, yyyy H:mm')
  }
</script>

<template>
  <v-data-table
    sticky
    :items="displayedMatches"
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

    <template
      v-slot:item.contributor="{
        value: { tag, partition, target }
      }"
    >
      <TagContributor
        :tag="tag"
        :partition="partition"
        :target="target"
      />
    </template>

    <template v-slot:item.target="{ value: target }">
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