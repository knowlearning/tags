<script setup>
  import { ref, watch } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'
  import UserChip from './user-chip.vue'

  const { partition, tag, target } = defineProps({
    partition: String,
    tag: String,
    target: String
  })

  const contributorId = ref(null)
  const loading = ref(true)

  Agent
    .query('tagging-contributor', [partition, tag, target])
    .then(async response => {
      contributorId.value = response[0]?.contributor
      loading.value = false
    })

</script>

<template>
  <v-progress-circular
    v-if="loading"
    indeterminate
  />
  <UserChip
    v-if="contributorId"
    :id="contributorId"
  />
  <span v-else> - </span>
</template>

<style scoped>
</style>
.vue