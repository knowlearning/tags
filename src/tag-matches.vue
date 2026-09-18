<script setup>
  import { ref, watch, onUnmounted } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagContributor from './tag-contributor.vue'
  import ContentName from './content-name.vue'
  import { format as datefnsFormat } from 'date-fns';

  const props = defineProps({ partition: String, id: String, ids: Array })
  const emit = defineEmits(['untag'])

  const matches = ref([])
  const loading = ref(true)
  const editingTagging = ref(null)
  const now = ref(Date.now())
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  let lastPromise = null

  const clockTimer = setInterval(() => now.value = Date.now(), 30000)
  onUnmounted(() => {
    clearInterval(clockTimer)
    lastPromise = null
  })

  const headers = ref([
    { key: 'target', title: 'Target' }
  ])

  if (props.id) {
    headers.value.unshift({ key: 'remove', title: '' })
    headers.value.push(
      { key: 'contributor', title: 'Contributor' },
      { key: 'value', title: 'Value' },
      { key: 'valid_start', title: 'Valid start' },
      { key: 'valid_end', title: 'Valid end' },
      { key: 'timestamp', title: 'Timestamp' },
    )
  }

  update()
  watch(() => props.ids, () => update())

  async function update() {
    loading.value = true

    const thisPromise = new Promise(resolve => setTimeout(resolve, 300))
    lastPromise = thisPromise
    await thisPromise

    if (thisPromise !== lastPromise) return

    const query = () => {
      if (props.id) return Agent.query('taggings-for-tag', [props.partition, props.id])
      else return Agent.query('taggings-intersection', [props.partition, props.ids])
    }

    const rows = await query()
    if (thisPromise !== lastPromise) return

    matches.value = rows.map(row => ({
      ...row,
      id: row.tagging || row.target,
      remove: row.target,
      contributor: {
        tag: props.id,
        partition: props.partition,
        target: row.target
      }
    }))

    loading.value = false
  }

  //  TODO: move this to a store so store manages user tags state centrally
  async function writeTagging(item) {
    const { target, value, context = null, valid_start, valid_end } = item
    const tags = await Agent.state('tags')
    if (!tags[props.id]) tags[props.id] = {}
    tags[props.id][target] = { partition: props.partition, value, context, valid_start, valid_end }
    update()
    if (value === null) emit('untag', props.id)
  }

  function formatDateTime(timestamp) {
    return timestamp == null ? '—' : datefnsFormat(new Date(timestamp), 'MMM d, yyyy H:mm')
  }

  function validityColor(item, field) {
    if (
      field === 'valid_end'
      && item.valid_end != null
      && new Date(item.valid_end).getTime() < now.value
    ) return 'text-error'

    if (
      item.value === true
      && (item.valid_start == null || new Date(item.valid_start).getTime() <= now.value)
      && (item.valid_end == null || new Date(item.valid_end).getTime() >= now.value)
    ) return 'text-success'

    return ''
  }

  function formatInput(value) {
    return value == null ? '' : datefnsFormat(new Date(value), "yyyy-MM-dd'T'HH:mm:ss.SSS")
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
        @click="writeTagging({ ...data.item, value: null })"
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
    <template
      v-for="field in ['valid_start', 'valid_end']"
      :key="field"
      v-slot:[`item.${field}`]="{ item, value }"
    >
      <v-btn
        variant="text"
        size="small"
        class="text-none"
        :class="validityColor(item, field)"
        :aria-label="`Edit ${field === 'valid_start' ? 'valid start' : 'valid end'} for ${item.target}`"
        @click="editingTagging = { ...item }"
      >
        {{ value == null ? (field === 'valid_start' ? 'No start' : 'No end') : formatDateTime(value) }}
      </v-btn>
    </template>
  </v-data-table>

  <v-dialog
    v-if="editingTagging"
    :model-value="true"
    max-width="540"
    @update:model-value="value => { if (!value) editingTagging = null }"
  >
    <v-card title="Edit tagging validity">
      <form @submit.prevent="writeTagging(editingTagging); editingTagging = null">
        <v-card-text>
          <p class="mb-4">Times use {{ timezone }}. Clear a field to leave that end open.</p>
          <v-text-field
            v-for="field in ['valid_start', 'valid_end']"
            :key="field"
            :model-value="formatInput(editingTagging[field])"
            :label="field === 'valid_start' ? 'Valid start' : 'Valid end'"
            type="datetime-local"
            step="0.001"
            clearable
            :min="field === 'valid_end' ? formatInput(editingTagging.valid_start) || undefined : undefined"
            :max="field === 'valid_start' ? formatInput(editingTagging.valid_end) || undefined : undefined"
            @update:model-value="value => editingTagging[field] = value ? new Date(value).toISOString() : null"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="editingTagging = null">Cancel</v-btn>
          <v-btn type="submit" color="primary">Save</v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
