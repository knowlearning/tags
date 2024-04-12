<script setup>
  import { ref, reactive, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'
  import TagTaggingsList from './tag-taggings-list.vue'
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()
  const props = defineProps({ partition: String })

  const tagCounts = ref([])
  const matchingTags = ref([])
  const newTagName = ref('')
  const fetchingTags = ref(false)
  const myTags = ref(null)

  Agent.state('tags').then(state => myTags.value = state)

  const matchingTagIds = computed(() => tagSelection.value.map(index => tagCounts.value[index]?.tag).filter(v => v))

  Agent
    .query(
      'tags-with-tagging-counts',
      [props.partition]
    )
    .then(r => {
      tagCounts.value = r
      availableTags
        .value
        .forEach(id => {
          if (!r.find(({ tag }) => tag === id)) {
            tagCounts.value.push({ tag: id, count: 0 })
          }
        })
    })

  const availableTags = computed(() => {
    const { tags } = route.query
    if (Array.isArray(tags)) return tags
    else if (tags) return [tags]
    else return []
  })

  const tagSelection = computed({
    get() {
      return availableTags.value.map(tag => tagCounts.value.findIndex(tagCount => tag === tagCount.tag))
    },
    set(value) {
      const tags = value.map(index => tagCounts.value[index]?.tag).filter(v => v)
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
    tagCounts.value.push({ tag: id, count: 0 })
    selectSingleTag(id)
  }

  function selectSingleTag(tag) {
    tagSelection.value = [tagCounts.value.findIndex(tagCount => tag === tagCount.tag)]
  }

  function tagCountData(id) {
    return tagCounts.value.find(({ tag }) => tag === id)
  }

  function addTag(partition, tag, target) {
    if (!myTags.value[tag]) myTags.value[tag] = {}
    myTags.value[tag][target] = { value: true, partition }
    tagCountData(tag).count += 1
  }

  function handleDrop(event, tag) {
    const target = event.dataTransfer.getData('text')
    addTag(props.partition, tag, target)
  }

  function addTagToCounts(tag) {
    let tagCountIndex = tagCounts.value.findIndex(v => v.tag === tag)
    if (tagCountIndex === -1) {
      //  TODO: actually get tag count
      tagCounts.value.push({ count: 0, tag })
      tagCountIndex = tagCounts.value.length - 1
    }
    if (!tagSelection.value.includes(tagCountIndex)) {
      tagSelection.value = [...tagSelection.value, tagCountIndex]
    }
  }
</script>

<template>
  <v-container>
    <div>
      <v-chip-group
        v-model="tagSelection"
        column
        multiple
      >
        <v-chip
          v-for="{ tag, count } in tagCounts"
          variant="outlined"
          @dblclick="selectSingleTag(tag)"
          draggable
          @dragstart="$event.dataTransfer.setData('text', tag)"
          @drop.prevent="e => handleDrop(e, tag)"
          @dragover.prevent
          filter
        >
            <vueScopeComponent
              :id="tag"
              :path="['name']"
            />
            <template v-slot:append>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-icon
                    class="ml-2"
                    v-bind="props"
                    :icon="`fa-solid fa-tag`"
                  />
                </template>
                <TagTaggingsList
                  :tag="tag"
                  :partition="props.partition"
                  @select="addTagToCounts"
                />
              </v-menu>
              <v-avatar
                class="ml-2"
                color="surface-variant"
                style="margin-right: -8px"
              >
                {{ count }}
              </v-avatar>
            </template>
        </v-chip>
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
        @tag="tagCountData(matchingTagIds[0]).count += 1"
        @untag="id => tagCountData(id).count -= 1"
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
