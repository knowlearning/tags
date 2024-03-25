<script setup>
  import { ref, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'

  const matchingTags = ref([])
  const fetchingTags = ref(false)
  const showArchived = ref(false)
  const tagAppState = ref(null)

  const matchingTagIds = computed(() => matchingTags.value.map(({ id }) => id))

  Agent
    .state('application')
    .then(async state => {
      if (!state.tagSearch) state.tagSearch = ''
      if (!state.selected) state.selected = []
      if (!state.vueTag) state.viewTag = null
      if (!state.partitions) state.partitions = []
      tagAppState.value = state

      Agent.environment().then(({ auth: { user } }) => {
        if (!state.partitions.includes(user)) {
          state.partitions.unshift(user)
        }
      })


      watch(() => tagAppState.value.tagSearch, () => searchTags(tagAppState.value.tagSearch))
      watch(showArchived, () => searchTags(''))
      watch(() => tagAppState.value.selected, () => {
        const selected = tagAppState.value.selected
        if (selected.length && !isUUID(selected[selected.length - 1])) {
          selected.pop()
        }
      })
    })

  if (!Set.prototype.difference) {
    Set.prototype.difference = function(otherSet) {
        if (!(otherSet instanceof Set)) {
            throw new TypeError('Provided argument must be a Set');
        }

        const differenceSet = new Set();

        for (const element of this) {
            if (!otherSet.has(element)) {
                differenceSet.add(element);
            }
        }

        return differenceSet;
    }
  }

  searchTags('')

  function selectTag(id) {
    tagAppState.value.viewTag = tagAppState.value.viewTag === id ? null : id
    tagAppState.value.menuOpen = false
  }

  function addedKeys(o1, o2) {
    const s1 = new Set(Object.keys(o1))
    const s2 = new Set(Object.keys(o2))
    return s2.difference(s1)
  }

  function removedKeys(o1, o2) {
    const s1 = new Set(Object.keys(o1))
    const s2 = new Set(Object.keys(o2))
    return s1.difference(s2)
  }

  async function searchTags(query) {
    fetchingTags.value = true

    if (query !== '') matchingTags.value = await Agent.query('search', [query])
    else if (showArchived.value) matchingTags.value = await Agent.query('my-archived-tags')
    else matchingTags.value = await Agent.query('my-tags')

    fetchingTags.value = false
  }

  async function create() {
    const name = tagAppState.value.tagSearch.trim()

    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })

    tagAppState.value.tagSearch = ''
    tagAppState.value.selected.push(id)
    tagAppState.value.viewTag = id
  }
</script>

<template>
  <v-container v-if="tagAppState && tagAppState.partitions">
    <v-combobox
      :key="JSON.stringify(tagAppState.partitions)"
      v-model="tagAppState.partition"
      :items="tagAppState.partitions"
      label="Partition"
    >
      <template v-slot:append-inner>
        <v-btn
          v-if="!tagAppState.partitions.includes(tagAppState.partition?.trim())"
          @click="tagAppState.partitions.push(tagAppState.partition?.trim())"
        >
          Add Partition
        </v-btn>
      </template>
    </v-combobox>
    <div
      v-if="tagAppState.partition"
      :key="tagAppState.partition"
    >
      <v-combobox
        v-model="tagAppState.selected"
        v-model:search="tagAppState.tagSearch"
        v-model:menu="tagAppState.menuOpen"
        :clear-on-select="false"
        :items="matchingTagIds"
        placeholder="Enter search or new tag name"
        no-filter
        :loading="fetchingTags"
        label="Tags"
        multiple
      >
        <template v-slot:append-inner>
          <v-btn
            v-if="tagAppState.tagSearch.trim()"
            @click="create"
          >
            Create
          </v-btn>
        </template>
        <template v-slot:selection="data">
          <v-chip
            :key="data.item.value"
            v-bind="data.attrs"
            :color="tagAppState.viewTag === data.item.value ? 'primary' : ''"
            :variant="tagAppState.viewTag === data.item.value ? 'flat' : 'tonal'"
            :disabled="data.disabled"
            :model-value="data.selected"
            @click="selectTag(data.item.value)"
          >
            <vueScopeComponent
              :id="data.item.value"
              :path="['name']"
            />
          </v-chip>
        </template>
        <template v-slot:item="data">
          <v-list-item
            v-bind="data.props"
            :key="data.item.value"
          >
            <template v-slot:prepend>
              <v-icon
                :icon="`fa-regular fa-square${ tagAppState.selected.includes(data.item.value) ? '-check' : '' }`"
              />
            </template>
            <template v-slot:title>
              <vueScopeComponent
                :id="data.item.value"
                :path="['name']"
              />
            </template>
          </v-list-item>
        </template>
      </v-combobox>
      <div
        v-if="tagAppState.viewTag"
        :key="tagAppState.viewTag"
      >
        <TagViewer
          :partition="tagAppState.partition"
          :id="tagAppState.viewTag"
          @close="tagAppState.viewTag = null"
        />
      </div>
      <div v-else>
        <TagMatches
          v-if="tagAppState.selected.length"
          :key="tagAppState.selected.join(',')"
          :partition="tagAppState.partition"
          :ids="tagAppState.selected"
        />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
</style>
