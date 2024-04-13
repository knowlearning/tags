<template>
  <v-chip
    variant="outlined"
    draggable
    @dragstart="$event.dataTransfer.setData('text', props.tag)"
    @drop.prevent="e => handleDrop(e, props.tag)"
    @dragover.prevent
    filter
  >
      <vueScopeComponent
        :id="props.tag"
        :path="['name']"
      />
      <template v-slot:append>
        <v-menu v-model="open">
          <template v-slot:activator="{ props }">
            <v-icon
              class="ml-2"
              v-bind="props"
              style="
                margin-right: -12px;
                padding-right: 8px;
                margin-left: -4px;
                padding-left: 4px;
              "
              :icon="`fa-solid fa-chevron-${open ? 'down' : 'right'}`"
              @click.stop
              @dblclick.stop
            />
          </template>
          <TagTaggingsList
            :tag="props.tag"
            :partition="props.partition"
            @select="tag => emit('select', tag)"
          />
        </v-menu>
      </template>
  </v-chip>
</template>

<script setup>
  import { ref } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagTaggingsList from './tag-taggings-list.vue'

  const emit = defineEmits(['select'])
  const props = defineProps(['partition', 'tag'])
  const myTags = ref(null)

  Agent.state('tags').then(state => myTags.value = state)

  const open = ref(false)

  function handleDrop(event) {
    const target = event.dataTransfer.getData('text')
    addTag(props.partition, props.tag, target)
  }

  function addTag(partition, tag, target) {
    if (!myTags.value[tag]) myTags.value[tag] = {}
    myTags.value[tag][target] = { value: true, partition }
  }
</script>