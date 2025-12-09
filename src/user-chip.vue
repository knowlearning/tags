<script setup>
  import { ref } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'

  const props = defineProps({ id: String })

  const loading = ref(true)
  const contributorInfo = ref(null)

  Agent
    .state('user-info', props.id)
    .then(state => {
      contributorInfo.value = state
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
    @dragstart="$event.dataTransfer.setData('text', props.id)"
  >
    <v-avatar
      class="mr-2"
      style="margin-left: -8px"
    >
      <v-img :src="contributorInfo.picture" />
    </v-avatar>
    {{ contributorInfo.name || props.id }}
  </v-chip>
  <span v-else> - </span>
</template>

<style scoped>
</style>
.vue