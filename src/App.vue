<template>
  <div v-if="!auth?.provider">loading...</div>
  <div v-else-if="auth?.provider === 'anonymous'">
    <v-btn
      prepend-icon="fa-solid fa-right-to-bracket"
      @click="login"
    >
      login
    </v-btn>
  </div>
  <div v-else>
    <v-toolbar
      color="primary"
    >
      <PartitionSwitcher
        class="ms-2"
        @select="name => {
          if (name) $router.push(`/${name}`)
          else $router.push('/')
        }"
      />

      <v-btn v-if="partition" @click="openTargetDialog" append-icon="fa-solid fa-bullseye">
        Target
      </v-btn>

      <v-toolbar-title>
        <router-link v-if="partition" :to="`/${partition}`">{{ partition }}</router-link>
        <span v-if="tag">
          / <vueScopeComponent :id="tag" :path="['name']" />
        </span>
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        @click="logout"
        append-icon="fa-solid fa-arrow-right-from-bracket"
      >
        Logout
      </v-btn>
      <v-avatar
        class="ms-4 me-4"
        :image="auth.info.picture"
      />
    </v-toolbar>

    <!-- Target mode view -->
    <v-container v-if="targetValue">
      <v-card class="ma-4 pa-4" elevation="3">
        <h3 class="text-h6 mb-3">Target Mode</h3>
        <p>Current target: <strong>{{ targetValue }}</strong></p>
        <v-btn
          color="error"
          class="mt-3"
          @click="targetValue = ''"
          prepend-icon="fa-solid fa-xmark"
        >
          Clear Target
        </v-btn>
      </v-card>
    </v-container>

    <!-- Normal router view when no target -->
    <v-container v-else-if="partition" :key="partition">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </v-container>

    <!-- Target input dialog -->
    <v-dialog v-model="targetDialog" persistent max-width="400">
      <v-card>
        <v-card-title>Enter Target</v-card-title>
        <v-card-text>
          <v-text-field
            label="Target name"
            v-model="targetInput"
            autofocus
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="targetDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="setTarget">Set Target</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { vueScopeComponent } from '@knowlearning/agents/vue.js'
import PartitionSwitcher from './partition-switcher.vue'

// expose components for template
// (script-setup auto-registers variables used in template)
const auth = ref(null)

const targetDialog = ref(false)
const targetInput = ref('')
const targetValue = ref('')

const login = () => Agent.login()
const logout = () => Agent.logout()

const openTargetDialog = () => {
  targetDialog.value = true
  targetInput.value = ''
}

const setTarget = () => {
  const v = targetInput.value.trim()
  if (v) {
    targetValue.value = v
    targetDialog.value = false
  }
}

// route-derived state
const route = useRoute()
const partition = computed(() => route.params?.partition)
const tag = computed(() => route.params?.tag)

onMounted(async () => {
  const { auth: a } = await Agent.environment()
  auth.value = a
})
</script>
