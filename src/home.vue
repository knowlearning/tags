<script setup>
  import { ref, reactive, watch, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Filters as TagFilters } from '@knowlearning/tags'

  const router = useRouter()
  const route = useRoute()
  const props = defineProps({ partition: String })
  const domain = ref(window.location.host)

  const availableTags = ref([])

  const queryTags = computed(() => {
    const { tags } = route.query
    if (Array.isArray(tags)) return tags
    else if (tags) return [tags]
    else return []
  })

  const selectedTagIds = ref([...queryTags.value])

  Agent
    .query(
      'top-level-tags',
      [props.partition]
    )
    .then(r => availableTags.value = r.map(({ tag }) => tag))

  watch(selectedTagIds, updateParams)

  function updateParams() {
    router.push({
      name: route.name,
      params: route.params,
      query: { ...route.query, tags: selectedTagIds.value }
    })
  }
</script>

<template>
  <v-container>
    <TagFilters
      editable
      :partition="props.partition"
      :roots="availableTags"
      :domain="domain"
      v-model="selectedTagIds"
    />
    <div v-if="selectedTagIds.length === 1">
      <TagViewer
        :key="selectedTagIds.join(',')"
        :partition="props.partition"
        :tag="selectedTagIds[0]"
      />
    </div>
    <div v-else-if="selectedTagIds.length > 1">
      <div class="text-h3 mb-4 mt-4">Taggings</div>
      <TagMatches
        :key="selectedTagIds.join(',')"
        :partition="props.partition"
        :ids="selectedTagIds"
      />
    </div>
  </v-container>
</template>
