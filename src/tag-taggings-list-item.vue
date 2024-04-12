<template>
  <v-list-item>
    <template v-slot:prepend>
      <v-icon
        :style="{ marginLeft: `${ depth * 48 }px`}"
        @click.stop="open = !open"
        :icon="`fa-solid fa-chevron-${ open ? 'down' : 'right'}`"
      />
    </template>
    <v-list-item-title
      draggable
      @click="emit('select', props.tag)"
      @dragstart="$event.dataTransfer.setData('text', props.tag)"
      @dragover.prevent
    >
      <vueScopeComponent :id="props.tag" :path="['name']" />
    </v-list-item-title>
  </v-list-item>
  <TagTaggingsList
    v-if="open"
    :tag="props.tag"
    :partition="props.partition"
    :depth="props.depth + 1"
    @select="tag => emit('select', tag)"
  />
</template>

<script setup>
  import { ref } from 'vue'
  import TagTaggingsList from './tag-taggings-list.vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'

  const emit = defineEmits(['select'])

  const props = defineProps({
    tag: String,
    partition: String,
    depth: {
      type: Number,
      default: 0
    }
  })
  const open = ref(false)
</script>

<style scoped>
  .sub-list
  {
    margin-left: 32px;
  }
</style>