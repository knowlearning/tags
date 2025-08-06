<script setup>
  const props = defineProps({
    tag: String,
    orderTag: String,
    partition: String
  })

  const taggings = await Agent.query('taggings-targeting-taggings', [props.partition, props.orderTag, props.tag])
</script>

<template>
  <pre>
    {{taggings}}
  </pre>
</template>
