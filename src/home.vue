<script setup>
  import { ref, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()
  const props = defineProps({ partition: String })

  const tagCounts = ref([])
  const tagSelection= ref([])
  const matchingTags = ref([])
  const fetchingTags = ref(false)
  const showArchived = ref(false)
  const tagAppState = ref(null)
  const tagSearch = ref('')

  const matchingTagIds = computed(() => tagSelection.value.map(index => tagCounts.value[index].tag))

  Agent
    .state('application')
    .then(async state => {
      if (!state.tagSearch) state.tagSearch = ''
      if (!state.selected) state.selected = []
      tagAppState.value = state

      watch(() => tagAppState.value.tagSearch, () => searchTags(tagAppState.value.tagSearch))
      watch(showArchived, () => searchTags(''))
      watch(() => tagAppState.value.selected, () => {
        const selected = tagAppState.value.selected
        if (selected.length && !isUUID(selected[selected.length - 1])) {
          selected.pop()
        }
      })
    })

  searchTags('')

  Agent
    .query(
      'tags-with-tagging-counts',
      [props.partition]
    )
    .then(r => tagCounts.value = r)

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
    const tag = encodeURIComponent(id)
    router.push(`/${props.partition}/${tag}`)
  }

  async function searchTags(query) {
    fetchingTags.value = true

    if (query !== '') matchingTags.value = await Agent.query('search', [query])
    else if (showArchived.value) matchingTags.value = await Agent.query('my-archived-tags')
    else matchingTags.value = await Agent.query('my-tags')

    fetchingTags.value = false
  }

  async function createTag(name) {
    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })

    tagSearch.value = ''
  }
</script>

<template>
  <v-container v-if="tagAppState">
    <div>
      <v-chip-group
        v-model="tagSelection"
        column
        multiple
      >
        <v-chip
          v-for="{ tag, count } in tagCounts"
          variant="outlined"
          filter
        >
          
            <vueScopeComponent
              :id="tag"
              :path="['name']"
            />
            <template v-slot:append>
              <v-avatar
                class="ml-2"
                color="surface-variant"
              >
                {{ count }}
              </v-avatar>
            </template>
        </v-chip>
        <v-chip @click.prevent="console.log('woooo!')">+</v-chip>
      </v-chip-group>
    </div>
    <v-text-field
      label="Search tags"
      v-model="tagSearch"
    >
      <template v-slot:append-inner>
        <v-btn @click="createTag(tagSearch)">Create</v-btn>
      </template>
    </v-text-field>
    <div>
      <div class="text-h3 mb-4 mt-4">Taggings</div>
      <TagMatches
        v-if="matchingTagIds && matchingTagIds.length"
        :key="matchingTagIds.join(',')"
        :partition="props.partition"
        :ids="matchingTagIds"
      />
    </div>
  </v-container>
</template>

<style scoped>
</style>
