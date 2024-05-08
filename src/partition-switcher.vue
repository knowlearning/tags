<script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'

  const emit = defineEmits(['select'])

  const router = useRouter()
  const routerPartition = router.currentRoute?.value?.params?.partition

  const partition = ref(routerPartition || null)
  const partitionStates = ref(null)
  const partitionToAdd = ref('')

  Agent.state('partitions').then(state => {
    // add partition to viewed partitions if not present
    if (partition.value && !state[partition.value]) state[partition.value] = true
    partitionStates.value = state
  })

  const partitions = computed(() => Object.keys(partitionStates.value || {}))

  watch(partition, () => emit('select', partition.value))

  function addPartition(name) {
    partitionStates.value[name] = true
    partition.value = name
    emit('select', name)
  }

  function removePartition(name) {
    if (partition.value === name) partition.value = null
    delete partitionStates.value[name]
  }

</script>

<template>
  <div v-if="partitions === null">loading...</div>
  <div
    v-else
    class="d-flex"
  >
    <v-menu label="Selected Partition">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon="fa-solid fa-gear"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="name in partitions"
          :key="name"
          @click="partition = name"
        >
          <v-list-item-title>{{ name }}</v-list-item-title>
          <template v-slot:append>
            <v-btn
              class="cursor-pointer"
              variant="plain"
              size="x-small"
              icon="fa-solid fa-xmark"
              @click.stop="removePartition(name)"
            />
          </template>
        </v-list-item>
        <v-divider class="mt-2"></v-divider>
        <v-dialog max-width="500">
          <template v-slot:activator="{ props: activatorProps }">
            <v-list-item
              title="Add New"
              v-bind="activatorProps"
            />
          </template>
          <template v-slot:default="{ isActive }">
            <v-card title="Add Partition">
              <v-card-text>
                <v-text-field
                  autofocus
                  v-model="partitionToAdd"
                  label="Partition"
                  @keypress.enter="() => {
                    addPartition(partitionToAdd)
                    partitionToAdd = ''
                    isActive.value = false
                  }"
                />
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                  text="Add"
                  @click="() => {
                    addPartition(partitionToAdd)
                    partitionToAdd = ''
                    isActive.value = false
                  }"
                ></v-btn>
                <v-btn
                  text="Cancel"
                  @click="isActive.value = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-list>
    </v-menu>
  </div>
</template>
