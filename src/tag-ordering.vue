<script setup>
  const props = defineProps({
    tag: String,
    orderTag: String,
    partition: String
  })

  const taggings = await Agent.query('taggings-targeting-taggings', [props.partition, props.orderTag, props.tag])

  async function order(target_tagging) {
    const tags = await Agent.state('tags')
    if (!tags[props.orderTag]) tags[props.orderTag] = {}
    tags[props.orderTag][target_tagging] = { partition: props.partition, value: { woo: '?' } }
  }

</script>

<template>
  <div v-for="tagging in taggings">
    {{ tagging }}
    <v-btn @click="order(tagging.target_tagging)">add tagging for thing</v-btn>
  </div>
</template>
