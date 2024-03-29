<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import tagMatches from './tag-matches.vue'

  const router = useRouter()

  const props = defineProps({ partition: String, tag: String })

  const tagType = ref(null)
  const tagTypeMetadata = ref(null)
  const environment = ref(null)
  const editing = ref(false)
  const myTags = ref(null)
  const newTaggingContent = ref('')

  Agent.state('tags').then(state => myTags.value = state)
  Agent.state(props.tag).then(state => tagType.value = state)
  Agent.metadata(props.tag).then(md => tagTypeMetadata.value = md)
  Agent.environment().then(env => environment.value = env)

  const userIsOwner = computed(() => environment.value.auth.user === tagTypeMetadata.value.owner)

  const lastAdd = ref(null)

  function addTag(partition, tag, target) {
    if (!myTags.value[tag]) myTags.value[tag] = {}
    myTags.value[tag][target] = { value: true, partition }
    lastAdd.value = Date.now()
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
        <span class="text-h3">
          <v-icon
            icon="fa-solid fa-chevron-left"
            size="x-small"
            @click="router.go(-1)"
          />
          {{ tagType.name }}
        </span>
        <button
          :disabled="!userIsOwner"
          @click="editing = true"
        >Edit</button>
        <button @click="$emit('close')">Close</button>
      </div>
      <p>tag id:{{ props.tag }}</p>
      <p>{{ tagType.description }}</p>
      <tagMatches
        :key="lastAdd"
        :partition="props.partition"
        :id="props.tag"
      />

      <v-text-field
        label="New Tagging"
        placeholder="Enter New Target"
        v-model="newTaggingContent"
        @keypress.enter="() => {
          addTag(props.partition, props.tag, newTaggingContent)
          newTaggingContent = ''
        }"
      />
    </div>
  </div>
  <div v-else>loading...</div>
</template>

<style scoped>
</style>
