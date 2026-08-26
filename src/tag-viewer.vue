<script setup>
  import { ref, computed } from 'vue'
  import { validate as isUUID } from 'uuid'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TagMatches from './tag-matches.vue'
  import AncestorTree from './tag-ancestor-tree.vue'
  import UserChip from './user-chip.vue'
  import { mutateTag } from './tag-mutations.js'

  const props = defineProps({ partition: String, tag: String })
  const emit = defineEmits(['tag', 'untag'])

  const tagType = ref(null)
  const tagTypeMetadata = ref(null)
  const environment = ref(null)
  const editing = ref(false)
  const newTaggingContent = ref('')
  const optimisticTargets = ref([])
  const matchesVersion = ref(0)

  Agent.state(props.tag).then(state => tagType.value = state)
  Agent.metadata(props.tag).then(md => tagTypeMetadata.value = md)
  Agent.environment().then(env => environment.value = env)

  const userIsOwner = computed(
    () => environment.value.auth.user === tagTypeMetadata.value.owner
  )

  async function addTag(partition, tag, target) {
    if (!isUUID(target)) target = await createTag(target)

    if (!optimisticTargets.value.includes(target)) {
      optimisticTargets.value.push(target)
    }

    const refreshMatches = () => {
      optimisticTargets.value = optimisticTargets.value.filter(
        id => id !== target
      )
      matchesVersion.value++
    }

    await mutateTag({
      partition,
      tag,
      target,
      value: true,
      onConfirmed: refreshMatches,
      onFailed: refreshMatches
    })

    emit('tag')
  }

  function createTag(name) {
    return Agent.create({
      active_type: 'application/json;type=tag-type',
      active: {
        name,
        description: 'A new tag',
        translations: {
          source_language: 'en-us',
          paths: [
            ['name'],
            ['description']
          ]
        }
      }
    })
  }

  function rehabToMakeTranslatable() {
    tagType.value.translations = {
      source_language: 'en-us',
      paths: [
        ['name'],
        ['description']
      ]
    }
  }
</script>

<template>
  <div v-if="tagType && tagTypeMetadata && environment">
    <div v-if="userIsOwner && editing">
      <v-text-field
        v-model="tagType.name"
        label="Name"
        placeholder="Enter Tag Name"
      />

      <v-textarea
        v-model="tagType.description"
        label="Description"
        placeholder="Enter Tag Description"
      />

      <v-text-field
        v-model="tagType.icon"
        :prepend-icon="tagType.icon"
        label="Icon"
        placeholder="Enter Icon Reference"
      />

      <v-btn @click="editing = false">
        Done
      </v-btn>

      <v-btn
        v-if="tagType.archived"
        label="unarchive"
        @click="delete tagType.archived"
      >
        unarchive
      </v-btn>

      <v-btn
        v-else
        @click="tagType.archived = true"
      >
        archive
      </v-btn>
    </div>

    <div v-else>
      <div>
        <span class="text-h3">
          {{ tagType.name }}
        </span>

        <v-btn
          :disabled="!userIsOwner"
          @click="editing = true"
        >
          Edit
        </v-btn>

        <v-btn
          v-if="tagType && !tagType.translations"
          @click="rehabToMakeTranslatable"
        >
          Make Old Tag Translatable
        </v-btn>
      </div>

      <h3>ID</h3>
      <p>{{ props.tag }}</p>

      <h3 v-if="tagType.icon">Icon</h3>
      <v-icon
        v-if="tagType.icon"
        :icon="tagType.icon"
      />

      <h3>Owner</h3>
      <p>
        <UserChip :id="tagTypeMetadata.owner" />
      </p>

      <h3>Description</h3>
      <p>{{ tagType.description }}</p>

      <AncestorTree
        :partition="props.partition"
        :target="props.tag"
      />

      <TagMatches
        :key="matchesVersion"
        :partition="props.partition"
        :id="props.tag"
        :optimistic-targets="optimisticTargets"
        @untag="(id, target) => {
          optimisticTargets = optimisticTargets.filter(
            item => item !== target
          )
          emit('untag', id)
        }"
      />

      <v-text-field
        v-model="newTaggingContent"
        label="New Tagging"
        placeholder="Enter New Target"
        @keypress.enter="async () => {
          if (!isUUID(newTaggingContent)) {
            newTaggingContent = await createTag(newTaggingContent)
          }

          addTag(props.partition, props.tag, newTaggingContent)
          newTaggingContent = ''
        }"
      />
    </div>
  </div>

  <div v-else>
    loading...
  </div>
</template>

<style scoped>
</style>