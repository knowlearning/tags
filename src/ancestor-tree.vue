<template>
  <v-container>
    {{ tree }}
    <v-list dense>
      <template v-for="(root, index) in tree" :key="index">
        <tree-node :node="root" :level="0" />
      </template>
    </v-list>
  </v-container>
</template>

<script setup>
  import { computed } from 'vue';
  import TreeNode from './ancestor-tree-node.vue';

  const props = defineProps({
    paths: {
      type: Array,
      default: () => []
    }
  });

  const tree = computed(() => {
    let root = {}
    props.paths.forEach(path => {
      let current = root
      path.forEach(id => {
        if (!current[id]) {
          current[id] = {}
        }
        current = current[id]
      })
    })
    return root
  })
</script>
