<script setup>
  import { ref } from 'vue'
  const tags = ref([])
  const tagSearch = ref('')
  const selectedTags = ref({})
  const fetchingTags = ref(false)
  const activeUsers = ref({})

  Agent
    .watch(
      'active-users',
      ({ state }) => {
        activeUsers.value = state
        console.log(state)
      },
      window.location.host
    )

  fetchTags()

  function fetchTags() {
    fetchingTags.value = true
    tags.value = []
    fetchingTags.value = false
  }

  async function create() {
    const name = tagSearch.value.trim()
    if (!name) alert('Please enter name')
    Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: '' }
    })
    await Agent.synced()
    fetchTags()
  }

  async function archive(id) {
    console.log('tag type', id)
    const tagType = await Agent.state(id)
    tagType.archived = true
  }
</script>

<template>
  <div id="main-page">
    {{ activeUsers }}
    <div id="available-tags">
      <div>
        <input v-model="tagSearch" placeholder="search" />
        <button @click="search">search</button>
        <button @click="create">create</button>
      </div>
      <div
        v-for="{ id, name, description } in tags"
        :key="id"
      >
        <h2>
          <input
            type="checkbox"
            v-model="selectedTags[id]"
            :id="id"
          />
          <label :for="id">{{ name }}</label>
        </h2>
        <p>{{ description }}</p> 
        <button @click="archive(id)">Archive</button>
      </div>
    </div>
    <div id="matching-content">
      {{ selectedTags }}
    </div>
  </div>
</template>

<style scoped>

  #main-page
  {
    top: 0;
    left: 0;
    position: absolute;
    overflow: scroll;
    width: 100vw;
    height: 100vh;
    -ms-overflow-style: none;
    scrollbar-width: none;
    display: flex;
  }

  #main-page::-webkit-scrollbar {
    display: none;
  }

  #matching-content
  {
    flex-grow: 1;
  }

</style>
