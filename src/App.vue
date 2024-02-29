<script setup>
  import { ref, watch } from 'vue'
  import vueScopeComponent from '@knowlearning/agents/vue/3/components/scope.vue'
  import TagViewer from './tag-viewer.vue'
  import TagMatches from './tag-matches.vue'

  const matchingTags = ref([])
  const tagSearch = ref('')
  const selectedTags = ref({})
  const fetchingTags = ref(false)
  const viewTag = ref(null)
  const showArchived = ref(false)

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

  searchTags('')

  watch(showArchived, () => searchTags(''))


  async function searchTags(query) {
    fetchingTags.value = true
    if (query === '') {
      if (showArchived.value) {
        matchingTags.value = await Agent.query('my-archived-tags')
      }
      else {
        matchingTags.value = await Agent.query('my-tags')
      }
    }
    else {
      matchingTags.value = await Agent.query('search', [query])
    }
    fetchingTags.value = false
  }

  async function create() {
    const name = tagSearch.value.trim()
    if (!name) alert('Please enter name')

    const id = await Agent.create({
      active_type: 'application/json;type=tag-type',
      active: { name, description: 'A new tag' }
    })

    viewTag.value = id
  }
</script>

<template>
  <div id="main-page">
    <div id="available-tags">
      <div v-for="v, id in selectedTags">
        <vueScopeComponent :id="id" :path="['name']" />
        <button @click="delete selectedTags[id]">X</button>
      </div>
      <div>
        <input
          v-model="tagSearch"
          placeholder="search"
          @keypress.enter="searchTags(tagSearch)"
        />
        <button @click="searchTags(tagSearch)">search</button>
        <button @click="create">create</button>
        <input type="checkbox" v-model="showArchived" id="show-archived" >
        <label for="show-archived">show archived</label>
      </div>
      <div
        v-for="{ id } in matchingTags"
        @click="selectedTags[id] ? delete selectedTags[id] : selectedTags[id] = true"
        :class="{
          tag: true,
          selected: !!selectedTags[id]
        }"
      >
        <vueScopeComponent :id="id" :path="['name']" />
        <button @click.stop="viewTag = id">
          view
        </button>
      </div>
    </div>
    <div
      v-if="viewTag"
      :key="viewTag"
      id="edit-tag-wrapper"
    >
      <TagViewer
        :id="viewTag"
        @close="viewTag = null"
      />
    </div>
    <div
      v-else
      id="matching-content"
    >
      <TagMatches
        :key="Object.keys(selectedTags).join(',')"
        :ids="Object.keys(selectedTags)"
      />
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
