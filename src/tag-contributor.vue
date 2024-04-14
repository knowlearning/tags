<script setup>
  import { ref, watch } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'

  const { partition, tag, target } = defineProps({
    partition: String,
    tag: String,
    target: String
  })

  const contributorId = ref(null)
  const loading = ref(true)
  const contributorInfo = ref(null)

  Agent
    .query('tagging-contributor', [partition, tag, target])
    .then(async response => {
      contributorId.value = response[0]?.contributor
      if (contributorId.value) {
        contributorInfo.value = await Agent.state('user-info', contributorId.value)
      }
      loading.value = false
    })

</script>

<template>
  <v-progress-circular
    v-if="loading"
    indeterminate
  />
  <v-chip
    v-else-if="contributorInfo"
    class="mr-2 mt-1 mb-1"
    draggable
    @dragstart="$event.dataTransfer.setData('text', contributorId)"
  >
    <v-avatar
      class="mr-2"
      style="margin-left: -8px"
    >
      <v-img :src="contributorInfo.picture" />
    </v-avatar>
    {{ contributorInfo.name }}
  </v-chip>
  <span v-else> - </span>
</template>

<style scoped>
</style>
.vue