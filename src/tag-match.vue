<script setup>
  import { ref, watch } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'

  const { id } = defineProps({ id: String })

  const matches = ref([])
  const fetching = ref(false)
  const myTags = ref(null)

  Agent.state('tags').then(state => myTags.value = state)

  async function update() {
    fetching.value = true
    await new Promise(r => setTimeout(r, 300))
    matches.value = await Agent.query('tags-for-content', [ id ])
    fetching.value = false
  }

  update()
</script>

<template>
  <tr>
    <td>{{ id }}</td>
    <td>
      <span
        v-for="{ tag_id } in matches"
        class="match"
        @click="() => {
          if (!myTags[tag_id]) myTags[tag_id] = {}
          console.log('CLICKED!!!!', myTags)
          myTags[tag_id][id] = false
        }"
      >
        <vueScopeComponent :id="tag_id" :path="['name']" />
      </span>
    </td>
  </tr>
</template>

<style scoped>
  .match
  {
    margin-right: 4px;
    padding: 4px;
    white-space: nowrap;
    background: chartreuse;
  }
</style>
