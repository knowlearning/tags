<script setup>
  import { ref, reactive, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'
  import { useRouter, useRoute } from 'vue-router'
  import TopLevelTagChip from './top-level-tag-chip.vue'

  const router = useRouter()
  const route = useRoute()
  const props = defineProps({ partition: String })

  const selectedTags = ref([])
  const newTagName = ref('')
  const fetchingTags = ref(false)

  const matchingTagIds = computed(() => selectedTagIndexes.value.map(index => selectedTags.value[index]).filter(v => v))

  Agent
    .query(
      'top-level-tags',
      [props.partition]
    )
    .then(r => {
      console.log('TOP LEVEL TAGS', r)
      selectedTags.value = r.map(({ tag }) => tag)
      availableTags
        .value
        .forEach(id => {
          if (!r.find(({ tag }) => tag === id)) {
            selectedTags.value.push(id)
          }
        })
    })

  const availableTags = computed(() => {
    const { tags } = route.query
    if (Array.isArray(tags)) return tags
    else if (tags) return [tags]
    else return []
  })

  const selectedTagIndexes = computed({
    get() {
      return availableTags.value.map(tag => selectedTags.value.findIndex(t => tag === t))
    },
    set(value) {
      const tags = value.map(index => selectedTags.value[index]).filter(v => v)
      router.push({
        name: route.name,
        params: route.params,
        query: { ...route.query, tags }
      })
    }
  })

  async function createTag(name) {
    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })
    newTagName.value = ''
    selectedTags.value.push(id)
    selectSingleTag(id)
  }

  function selectSingleTag(tag) {
    selectedTagIndexes.value = [selectedTags.value.findIndex(t => tag === t)]
  }

  function addTagToSelection(tag) {
    let tagCountIndex = selectedTags.value.findIndex(t => t === tag)
    if (tagCountIndex === -1) {
      //  TODO: actually get tag count
      selectedTags.value.push(tag)
      tagCountIndex = selectedTags.value.length - 1
    }
    if (!selectedTagIndexes.value.includes(tagCountIndex)) {
      selectedTagIndexes.value = [...selectedTagIndexes.value, tagCountIndex]
    }
  }

  function removeTagFromSelection(tag) {
    const index = selectedTags.value.findIndex(t => t === tag)
    if (index > -1) {
      selectedTagIndexes.value = [
        ...[...selectedTagIndexes.value].splice(index, 1)
      ]
    }
  }
</script>

<template>
  <v-container>
    <div>
      <v-chip-group
        v-model="selectedTagIndexes"
        column
        multiple
      >
        <TopLevelTagChip
          v-for="tag in selectedTags"
          :key="tag"
          :tag="tag"
          :partition="props.partition"
          :selected="matchingTagIds"
          @dblclick="selectSingleTag(tag)"
          @select="tag => {
            if (matchingTagIds.includes(tag)) {
              removeTagFromSelection(tag)
            }
            else addTagToSelection(tag)
          }"
        />
      </v-chip-group>
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
    </div>
    <div v-if="matchingTagIds.length === 0">
      Select tags above to filter by
    </div>
    <div v-else-if="matchingTagIds.length === 1">
      <TagViewer
        :key="matchingTagIds.join(',')"
        :partition="props.partition"
        :tag="matchingTagIds[0]"
      />
    </div>
    <div v-else>
      <div class="text-h3 mb-4 mt-4">Taggings</div>
      <TagMatches
        :key="matchingTagIds.join(',')"
        :partition="props.partition"
        :ids="matchingTagIds"
      />
    </div>
  </v-container>
</template>

<style scoped>
</style>
