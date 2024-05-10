<script setup>
  import { ref, reactive, watch, computed } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import { validate as isUUID } from 'uuid'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'
  import { useRouter, useRoute } from 'vue-router'
  import TopLevelTagChip from './top-level-tag-chip.vue'

  const router = useRouter()
  const route = useRoute()
  const props = defineProps({ partition: String })

  const availableTags = ref([])
  const newTagName = ref('')
  const fetchingTags = ref(false)

  const queryTags = computed(() => {
    const { tags } = route.query
    if (Array.isArray(tags)) return tags
    else if (tags) return [tags]
    else return []
  })

  const selectedTagIds = reactive([...queryTags.value])

  Agent
    .query(
      'top-level-tags',
      [props.partition]
    )
    .then(r => availableTags.value = r.map(({ tag }) => tag))

  async function createTag(name) {
    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })
    newTagName.value = ''
    availableTags.value.push(id)
    selectSingleTag(id)
  }

  function selectSingleTag(tag) {
    while (selectedTagIds.length) selectedTagIds.pop()
    selectedTagIds.push(tag)
    updateParams()
  }

  function toggleTag(tag) {
    const index = selectedTagIds.findIndex(id => id === tag)

    if (index > -1) selectedTagIds.splice(index, 1)
    else selectedTagIds.push(tag)

    updateParams()
  }

  function updateParams() {
    router.push({
      name: route.name,
      params: route.params,
      query: { ...route.query, tags: selectedTagIds }
    })
  }
</script>

<template>
  <v-container>
    <div>
      <TopLevelTagChip
        v-for="tag in availableTags"
        :key="tag"
        :tag="tag"
        :partition="props.partition"
        :selected="selectedTagIds"
        @click="toggleTag(tag)"
        @dblclick="selectSingleTag(tag)"
        @select="toggleTag"
      />
      <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
          <v-chip v-bind="activatorProps">+ Create Tag</v-chip>
        </template>
        <template v-slot:default="{ isActive }">
          <v-card title="New Tag">
            <v-card-text>
              <v-text-field
                autofocus
                v-model="newTagName"
                label="Name"
                @keypress.enter="() => {
                  createTag(newTagName)
                  isActive.value = false
                }"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                text="Add"
                @click="() => {
                  createTag(newTagName)
                  isActive.value = false
                }"
              ></v-btn>
              <v-btn
                text="Cancel"
                @click="isActive.value = false"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <br/>
      <br/>
      <h3 v-if="selectedTagIds.length">
        Active Tag Filter{{ selectedTagIds.length > 1 ? 's' : '' }}:
      </h3>
      <v-chip
        v-for="tag in selectedTagIds"
        :key="tag"
        class="mr-2 mb-2"
        @click:close="toggleTag(tag)"
        color="primary"
        closable
      >
        <vueScopeComponent :id="tag" :path="['name']" />
      </v-chip>
    </div>
    <div v-if="selectedTagIds.length === 0">
      Select tags above to filter by
    </div>
    <div v-else-if="selectedTagIds.length === 1">
      <TagViewer
        :key="selectedTagIds.join(',')"
        :partition="props.partition"
        :tag="selectedTagIds[0]"
      />
    </div>
    <div v-else>
      <div class="text-h3 mb-4 mt-4">Taggings</div>
      <TagMatches
        :key="selectedTagIds.join(',')"
        :partition="props.partition"
        :ids="selectedTagIds"
      />
    </div>
  </v-container>
</template>

<style scoped>
</style>
