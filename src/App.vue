<script setup>
  import { ref, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'

  const matchingTags = ref([])
  const tagSearch = ref('')
  const selectedTags = ref([])
  const fetchingTags = ref(false)
  const viewTag = ref(null)
  const showArchived = ref(false)

  const matchingTagIds = computed(() => matchingTags.value.map(({ id }) => id))

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

  watch(tagSearch, () => searchTags(tagSearch.value))
  watch(showArchived, () => searchTags(''))

  watch(selectedTags, () => {
    if (selectedTags.value.length && !isUUID(selectedTags.value[selectedTags.value.length - 1])) {
      selectedTags.value.pop()
    }
  })

  function selectTag(id) {
    viewTag.value = viewTag.value === id ? null : id
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
    const name = tagSearch.value.trim()
    if (!name) alert('Please enter name')

    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })

    viewTag.value = id
  }

  function validateItems(items) {
   items.forEach()
  }
</script>

<template>
  <v-container>
    <v-combobox
      v-model="selectedTags"
      v-model:search="tagSearch"
      :clear-on-select="false"
      :items="matchingTagIds"
      no-filter
      :loading="fetchingTags"
      label="Tags"
      placeholder="Search"
      multiple
    >
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
    </v-combobox>
  </v-container>
  <div
    v-if="viewTag"
    :key="viewTag"
  >
    <TagViewer
      :id="viewTag"
      @close="viewTag = null"
    />
  </div>
  <div v-else>
    <TagMatches
      :key="Object.keys(selectedTags).join(',')"
      :ids="Object.keys(selectedTags)"
    />
  </div>
</template>

<style scoped>
</style>
