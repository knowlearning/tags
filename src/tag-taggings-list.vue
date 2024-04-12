<template>
  <v-list>
    <TagTaggingsListItem
      v-for="({ target }, index) in tagTaggings"
      :key="index"
      :tag="target"
      :depth="props.depth"
      :partition="props.partition"
      @select="tag => emit('select', tag)"
    />
  </v-list>
</template>

<script setup>
  import { ref } from 'vue'
  import TagTaggingsListItem from './tag-taggings-list-item.vue'

  const emit = defineEmits(['select'])
  const props = defineProps({
    tag: String,
    partition: String,
    depth: {
      type: Number,
      default: 0
    }
  })
  const tagTaggings = ref([])
  const loading = ref(true)

  Agent
    .query('taggings-targeting-tags', [props.partition, props.tag])
    .then(r => {
      tagTaggings.value = r
      loading.value = false
    })
</script>