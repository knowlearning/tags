<template>
  <v-chip
    class="mr-2 mb-2"
    draggable
    variant="outlined"
    :prepend-icon="tag.icon"
    :color="selected.includes(props.tag) ? 'primary' : ''"
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
        <v-menu
          v-model="open"
          v-if="childTags.length"
        >
          <template v-slot:activator="{ props }">
            <v-icon
              class="ml-2"
              v-bind="props"
              style="
                margin-right: -12px;
                padding-right: 12px;
                margin-left: -4px;
                padding-left: 4px;
              "
              :icon="`fa-solid fa-chevron-${open ? 'down' : 'right'}`"
              @click.stop
              @dblclick.stop
            />
          </template>
          <TagTaggingsList
            :tags="childTags"
            :partition="props.partition"
            :selected="props.selected"
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
  const props = defineProps(['partition', 'tag', 'selected', 'leaf-selection-only'])
  const myTags = ref(null)
  const childTags = ref([])
  const tag = ref({})

  Agent
    .state('tags')
    .then(state => myTags.value = state)

  Agent
    .watch(props.tag, ({ state }) => {
      tag.value = state
      updateChildTags()
    })

  const open = ref(false)

  function updateChildTags() {
    Agent
      .query('taggings-targeting-tags', [props.partition, props.tag])
      .then(r => childTags.value = r.map(t => t.target))
  }

  function handleDrop(event) {
    const target = event.dataTransfer.getData('text')
    addTag(props.partition, props.tag, target)
  }

  function addTag(partition, tag, target) {
    if (!myTags.value[tag]) myTags.value[tag] = {}
    myTags.value[tag][target] = { value: true, partition }
  }
</script>