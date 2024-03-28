<script setup>
  import { ref, computed } from 'vue'
  import tagMatches from './tag-matches.vue'

  const props = defineProps({ partition: String, id: String })

  const tagType = ref(null)
  const tagTypeMetadata = ref(null)
  const environment = ref(null)
  const editing = ref(false)
  const myTags = ref(null)
  const newTaggingContent = ref('')

  Agent.state('tags').then(state => myTags.value = state)
  Agent.state(props.id).then(state => tagType.value = state)
  Agent.metadata(props.id).then(md => tagTypeMetadata.value = md)
  Agent.environment().then(env => environment.value = env)

  const userIsOwner = computed(() => environment.value.auth.user === tagTypeMetadata.value.owner)

  function addTag(partition, tag, target) {
    if (!myTags.value[tag]) myTags.value[tag] = {}
    myTags.value[tag][target] = { value: true, partition }
  }

</script>

<template>
  <div v-if="tagType && tagTypeMetadata && environment">
    <div v-if="environment.auth.user === tagTypeMetadata.owner && editing">
      <input v-model="tagType.name" />
      <textarea v-model="tagType.description"></textarea>
      <button @click="editing = false">save</button>
      <button
        v-if="tagType.archived"
        @click="delete tagType.archived"
      >unarchive</button>
      <button
        v-else
        @click="tagType.archived = true"
      >archive</button>
    </div>
    <div v-else>
      <div>
        <span class="text-h3">{{ tagType.name }}</span>
        <button
          :disabled="!userIsOwner"
          @click="editing = true"
        >Edit</button>
        <button @click="$emit('close')">Close</button>
      </div>
      <p>tag id:{{ props.id }}</p>
      <p>{{ tagType.description }}</p>
      <tagMatches
        :partition="props.partition"
        :id="props.id"
      />

      <v-text-field
        label="New Tagging"
        placeholder="Enter New Target"
        v-model="newTaggingContent"
        @keypress.enter="() => {
          addTag(props.partition, props.id, newTaggingContent)
          newTaggingContent = ''
        }"
      />
    </div>
  </div>
  <div v-else>loading...</div>
</template>

<style scoped>
</style>
