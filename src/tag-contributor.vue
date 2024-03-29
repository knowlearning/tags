<script setup>
  import { ref, watch } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'

  const { partition, tag, target } = defineProps({
    partition: String,
    tag: String,
    target: String
  })

  const contributor = ref(null)
  const loading = ref(true)

  Agent
    .query('tagging-contributor', [partition, tag, target])
    .then(response => {
      contributor.value = response[0]?.contributor || null
      loading.value = false
    })

</script>

<template>
  <v-progress-circular
    v-if="loading"
    indeterminate
  />
  <v-chip
    v-else-if="contributor"
    class="mr-2 mt-1 mb-1"
    size="small"
  >
    {{ contributor }}
  </v-chip>
  <span v-else> - </span>
</template>

<style scoped>
</style>
.vue