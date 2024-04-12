<template>
  <v-list>
    <v-list-item
      v-for="({ target }, index) in tagTaggings"
      :key="index"
      :value="index"
    >
      <v-list-item-title
        draggable
        @click="emit('select', target)"
        @dragstart="$event.dataTransfer.setData('text', tag)"
        @drop.prevent="e => handleDrop(e, tag)"
        @dragover.prevent
      >
        <vueScopeComponent :id="target" :path="['name']" />
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup>
  import { ref } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'

  const emit = defineEmits(['select'])
  const props = defineProps(['tag', 'partition'])

  const tagTaggings = ref([])
  const loading = ref(true)

  Agent
    .query('taggings-targeting-tags', [props.partition, props.tag])
    .then(r => {
      tagTaggings.value = r
      loading.value = false
    })
</script>