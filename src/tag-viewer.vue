<script setup>
  import { ref, computed } from 'vue'
  import tagMatches from './tag-matches.vue'

  const { id } = defineProps({
    id: String
  })

  const tagType = ref(null)
  const tagTypeMetadata = ref(null)
  const environment = ref(null)
  const editing = ref(false)

  Agent.state(id).then(state => tagType.value = state)
  Agent.metadata(id).then(md => tagTypeMetadata.value = md)
  Agent.environment().then(env => environment.value = env)

  const userIsOwner = computed(() => environment.value.auth.user === tagTypeMetadata.value.owner)

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
      <h1>
        {{ tagType.name }}
        <button
          :disabled="!userIsOwner"
          @click="editing = true"
        >Edit</button>
      </h1>
      <p>{{ tagType.description }}</p>
      <tagMatches :id="id" />
    </div>
  </div>
  <div v-else>loading...</div>
</template>

<style scoped>
</style>
