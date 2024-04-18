<template>
  <v-list-group
    v-if="hasChildren"
    no-action
    :value="true"
  >
    <template v-slot:activator>
      <v-list-item>
        <v-list-item-title>
          <vueScopeComponent :id="nodeTitle" :path="['name']" />
        </v-list-item-title>
      </v-list-item>
    </template>
    <v-list-item
      v-for="(child, name) in node[nodeTitle]"
      :key="name"
    >
      <tree-node :node="child" :level="nextLevel" />
    </v-list-item>
  </v-list-group>

  <v-list-item v-else>
    <v-list-item-title>
      <vueScopeComponent :id="nodeTitle" :path="['name']" />
    </v-list-item-title>
  </v-list-item>
</template>

<script setup>
  import { computed, defineProps } from 'vue'
  import { vueScopeComponent } from '@knowlearning/agents/vue.js'
  import TreeNode from './ancestor-tree-node.vue'

  const props = defineProps({
    node: Object,
    level: Number
  });

  const nodeTitle = computed(() => Object.keys(props.node)[0] || 'Node');
  const hasChildren = computed(() => Object.keys(props.node[nodeTitle.value] || {}).length > 0);
  const nextLevel = computed(() => props.level + 1);
</script>
