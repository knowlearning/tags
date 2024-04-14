<template>
  <span>
    <span v-if="type === null">Loading...</span>
    <v-chip
      v-else-if="type === 'application/json;type=tag-type'"
      draggable
      @dragstart="$event.dataTransfer.setData('text', props.id)"
    >
      <template v-slot:prepend>
        <v-icon
          icon="fa-solid fa-tag"
          class="mr-2"
          style="margin-left: -2px"
        />
      </template>
      <vueScopeComponent
        :id="props.id"
        :path="['name']"
      />
    </v-chip>
    <v-chip
      v-else-if="
        type.startsWith('application/json;type=karel-task')
        || type.startsWith('application/json;type=karel-map')
      "
      draggable
      @dragstart="$event.dataTransfer.setData('text', props.id)"
    >
      <template v-slot:prepend>
        <img
          :src="typeIconSrc"
          class="mr-2"
          style="width: 21px;"
        />
      </template>
      <vueScopeComponent
        :id="props.id"
        :path="['name', 'source_string']"
      />
    </v-chip>
    <span v-else>
      {{ type }}
      {{ props.id }}
    </span>
  </span>
</template>

<script setup>
  import { ref } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'

  const props = defineProps({ id: String })

  const type = ref(null)
  const domain = ref(null)
  const typeIconSrc = ref(null)

  Agent
    .metadata(props.id)
    .then(md => {
      type.value = md.active_type
      domain.value = md.domain
      typeIconSrc.value = `${window.location.protocol}//${md.domain}/favicon.svg`
    })
</script>