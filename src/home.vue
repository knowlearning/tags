<script setup>
  import { ref, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'
  import { useRouter, useRoute } from 'vue-router'
  import { QSelect } from 'quasar'

  const router = useRouter()
  const route = useRoute()

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

  const partition = computed({
    get() { return route.params?.partition },
    set(value) { router.push(`/${value ? encodeURIComponent(value) : ''}`) }
  })

  const selectedTags = computed({
    get() {
      if (!route.query.tags) return []
      else if (Array.isArray(route.query.tags)) return route.query.tags
      else return [route.query.tags]
    },
    set(value) {
      router.push({
        name: route.name,
        params: route.params,
        query: { ...route.query, tags: value }
      })
    }
  })

  function selectTag(id) {
    const partition = encodeURIComponent(route.params.partition)
    const tag = encodeURIComponent(id)
    router.push(`/${partition}/${tag}`)
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
    selectedTags.push(id)
  }
</script>

<template>
  <QSelect
    v-if="partition && tagAppState?.partitions"
    label="partition"
    :options="tagAppState.partitions"
    filled
    v-model="partition"
    clearable
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    @new-value="(val, done) => {
      if (val.length > 0) {
        if (!tagAppState.partitions.includes(val)) {
          tagAppState.partitions.push(val)
        }
        done(val, 'toggle')
      }
    }"
  />
  <v-container v-if="tagAppState && tagAppState.partitions">
    <div
      v-if="partition"
      :key="partition"
    >
      <v-combobox
        v-model="selectedTags"
        v-model:search="tagAppState.tagSearch"
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
                :icon="`fa-regular fa-square${ selectedTags.includes(data.item.value) ? '-check' : '' }`"
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
      <div>
        <div class="text-h3 mb-4 mt-4">Taggings</div>
        <TagMatches
          v-if="selectedTags && selectedTags.length"
          :key="selectedTags.join(',')"
          :partition="partition"
          :ids="selectedTags"
        />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
</style>
