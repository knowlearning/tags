<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { validate as isUUID } from 'uuid'
  import tagMatches from './tag-matches.vue'

  const router = useRouter()

  const props = defineProps({ partition: String, tag: String })
  const emit = defineEmits(['tag', 'untag'])

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

  async function addTag(partition, tag, target) {
    if (!isUUID(target)) target = await createTag(target)

    if (!myTags.value[tag]) myTags.value[tag] = {}
    myTags.value[tag][target] = { value: true, partition }
    lastAdd.value = Date.now()
    emit('tag')
  }

  function createTag(name) {
    return Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })
  }


</script>

<template>
  <div v-if="tagType && tagTypeMetadata && environment">
    <div v-if="userIsOwner && editing">
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
          Taggings for "{{ tagType.name }}"
        </span>
        <button
          :disabled="!userIsOwner"
          @click="editing = true"
        >Edit</button>
      </div>
      <p>id:{{ props.tag }}</p>
      <p>owner:{{ tagTypeMetadata.owner }}</p>
      <p>{{ tagType.description }}</p>
      <tagMatches
        :key="lastAdd"
        :partition="props.partition"
        :id="props.tag"
        @untag="id => emit('untag', id)"
      />

      <v-text-field
        label="New Tagging"
        placeholder="Enter New Target"
        v-model="newTaggingContent"
        @keypress.enter="async () => {
          if (!isUUID(newTaggingContent)) newTaggingContent = await createTag(newTaggingContent)
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
