<template>
  <span @dblclick="open()">
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
      {{ name }}
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
      {{ name }}
    </v-chip>
    <v-chip
      v-else-if="type.startsWith('application/json;type=sequence')"
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
      {{ name }}
    </v-chip>
    <UserChip
      v-else-if="type.startsWith('application/json;type=user')"
      :id="props.id"
    />
    <v-chip
      v-else-if="name"
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
      {{ name }}
    </v-chip>

    <span v-else>
      {{ type }}
      {{ props.id }}
    </span>
  </span>
</template>

<script setup>
  import { ref } from 'vue'
  import { validate as isUUID } from 'uuid'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import UserChip from './user-chip.vue'

  const props = defineProps({ id: String })

  const TRANSLATION_DOMAIN = 'translations.pilaproject.org'
  const type = ref(null)
  const domain = ref(null)
  const typeIconSrc = ref(null)
  const name = ref(null)
  Agent
    .metadata(props.id)
    .then(md => {
      type.value = md.active_type
      domain.value = md.domain
      typeIconSrc.value = `${window.location.protocol}//${md.domain}/favicon.png`
    })

  Agent
    .state(props.id)
    .then(async state => {
      if (isUUID(state.name)) {
        const { source_string } = await Agent.state(state.name)
        if (source_string) name.value = source_string
      }
      else if (state.name) name.value = state.name
      else {
        const translations = await Agent.query('translate-item', [props.id, ['en']], TRANSLATION_DOMAIN)
        const [nameTranslation] = translations.filter(({path}) => path.length === 2 && path[1] === 'name')
        if (nameTranslation) name.value = nameTranslation.value
      }
    })

  function open() {
    if (type.value === 'application/json;type=tag-type') return

    window.open(`https://${domain.value}/${props.id}`, '_blank')
  }
</script>