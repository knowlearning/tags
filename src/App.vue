<script setup>
  import { ref } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'

  const allTags = ref([])
  const tagSearch = ref('')
  const selectedTags = ref({})
  const fetchingTags = ref(false)
  const activeUsers = ref({})
  const activeUserTags = ref({})
  const myTags = ref(null)

  if (!Set.prototype.difference) {
    Set.prototype.difference = function(otherSet) {
        if (!(otherSet instanceof Set)) {
            throw new TypeError('Provided argument must be a Set');
        }

        const differenceSet = new Set();

        for (const element of this) {
            if (!otherSet.has(element)) {
                differenceSet.add(element);
            }
        }

        return differenceSet;
    }
  }

  Agent.state('tags').then(state => myTags.value = state)

  function addedKeys(o1, o2) {
    const s1 = new Set(Object.keys(o1))
    const s2 = new Set(Object.keys(o2))
    return s2.difference(s1)
  }

  function removedKeys(o1, o2) {
    const s1 = new Set(Object.keys(o1))
    const s2 = new Set(Object.keys(o2))
    return s1.difference(s2)
  }

  Agent
    .watch(
      'active-users',
      ({ state }) => {
        const removedUsers = removedKeys(activeUsers.value, state)
        const addedUsers = addedKeys(activeUsers.value, state)

        addedUsers.forEach(user => {
          activeUserTags.value[user] = {}
          Agent
            .watch(
              'tags',
              ({ state }) => activeUserTags.value[user] = state,
              user
            )
        })

        activeUsers.value = state
      },
      window.location.host
    )

  fetchAllTags()

  async function fetchAllTags() {
    fetchingTags.value = true
    allTags.value = await Agent.query('tags')
    fetchingTags.value = false
  }

  async function create() {
    const name = tagSearch.value.trim()
    if (!name) alert('Please enter name')

    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })

    myTags.value[id] = {}

    await Agent.synced()
    fetchAllTags()
  }

  async function archive(id) {
    console.log('tag type', id)
    const tagType = await Agent.state(id)
    tagType.archived = true
  }
</script>

<template>
  <div id="main-page">
    <div id="available-tags">
      <div
        v-for="v, id in selectedTags"
        @click="delete selectedTags[id]"
      >
        <vueScopeComponent :id="id" :path="['name']" />
      </div>
      <div>
        <input v-model="tagSearch" placeholder="search" />
        <button @click="search">search</button>
        <button @click="create">create</button>
      </div>
      <div
        v-for="{ id } in allTags"
        @click="selectedTags[id] ? delete selectedTags[id] : selectedTags[id] = true"
        :class="{
          tag: true,
          selected: !!selectedTags[id]
        }"
      >
        <vueScopeComponent :id="id" :path="['name']" />
        <input
          @keypress.enter="event => {
            if (!myTags[id]) myTags[id] = {}
            myTags[id][event.target.value] = true
            event.target.value = ''
          }" />
      </div>
    </div>
    <div id="matching-content">
      <div>
        <pre>{{ activeUsers }}</pre>
        <pre>{{ activeUserTags }}</pre>
      </div>
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

  .tag
  {
    cursor: pointer;
  }

  .tag.selected
  {
    background: chartreuse;
  }

</style>
