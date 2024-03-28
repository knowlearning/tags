<script setup>
  import { ref, watch } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'

  const props = defineProps({ partition: String, id: String, ignore: Array })

  const matches = ref([])
  const fetching = ref(false)
  const myTags = ref(null)

  Agent.state('tags').then(state => myTags.value = state)

  async function update() {
    fetching.value = true
    await new Promise(r => setTimeout(r, 300))
    matches.value = (
      await Agent.query('taggings-for-target', [ props.partition, props.id ])
    ).filter(({ tag }) => !props.ignore.includes(tag))
    fetching.value = false
  }

  update()
</script>

<template>
  <v-progress-circular
    v-if="fetching"
    indeterminate
  />
  <v-chip
    v-else
    v-for="{ tag } in matches"
    class="mr-2 mt-1 mb-1"
    size="small"
    @click="() => {
      if (!myTags[tag]) myTags[tag] = {}
      myTags[tag][props.id] = { value: null }
      update()
    }"
  >
    <vueScopeComponent :id="tag" :path="['name']" />
  </v-chip>
</template>

<style scoped>
</style>
