<template>
  <v-container>
    <v-list>
      <tree-node
        v-for="(node, id) in tree"
        :key="id"
        :id="id"
        :leaf="props.tag"
        :node="node"
        :level="0"
      />
    </v-list>
  </v-container>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TreeNode from './ancestor-tree-node.vue'

  const props = defineProps({ partition: String, tag: String })

  const ancestorPaths = ref([])

  Agent
    .query('tag-ancestor-paths', [props.partition, props.tag])
    .then(r => {
      console.log('ap', r)
      ancestorPaths.value = r.map(
        ({ path }) => [...path, props.tag] //  add tag to end of each path to render it
      )
    })

  const tree = computed(() => {
    const root = {}
    ancestorPaths.value.forEach(path => {
      let current = root
      path.forEach(id => current = current[id] = current[id] || {})
    })
    return root
  })
</script>
