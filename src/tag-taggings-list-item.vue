<template>
  <v-list-item
    @click.stop.prevent="emit('select', props.tag)"
    :active="selected.includes(props.tag)"
  >
    <template v-slot:prepend>
      <span :style="`display: block; width: ${depth * 48}px`" />
      <v-icon
        :icon="tag.icon || 'fa-solid fa-ellipsis'"
        :style="tag.icon ? '' : 'opacity: 0.1'"
      />
    </template>
    <v-list-item-title
      draggable
      @dragstart="$event.dataTransfer.setData('text', props.tag)"
      @dragover.prevent
    >
      <vueScopeComponent :id="props.tag" :path="['name']" />
    </v-list-item-title>
    <template v-slot:append>
      <v-icon
        v-if="childTags.length"
        :style="{ marginLeft: `${ depth * 48 }px`}"
        @click.stop="open = !open"
        :icon="`fa-solid fa-chevron-${ open ? 'down' : 'right'}`"
      />
    </template>
  </v-list-item>
  <TagTaggingsList
    v-if="open"
    :tags="childTags"
    :partition="props.partition"
    :selected="props.selected"
    :depth="props.depth + 1"
    @select="tag => emit('select', tag)"
  />
</template>

<script setup>
  import { ref } from 'vue'
  import TagTaggingsList from './tag-taggings-list.vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'

  const emit = defineEmits(['select'])
  const tag = ref({})

  const props = defineProps({
    tag: String,
    partition: String,
    selected: Array,
    depth: {
      type: Number,
      default: 0
    }
  })
  const open = ref(false)
  const childTags = ref([])

  Agent
    .query('taggings-targeting-tags', [props.partition, props.tag])
    .then(r => childTags.value = r.map(t => t.target))

  Agent.watch(props.tag, ({ state }) => tag.value = state)

</script>

<style scoped>
  .sub-list
  {
    margin-left: 32px;
  }
</style>