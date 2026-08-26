<template>
  <div v-if="!auth?.provider">
    loading...
  </div>

  <div v-else-if="auth?.provider === 'anonymous'">
    <v-btn
      prepend-icon="fa-solid fa-right-to-bracket"
      @click="login"
    >
      login
    </v-btn>
  </div>

  <div v-else>
    <v-toolbar color="primary">
      <PartitionSwitcher
        class="ms-2"
        @select="name => {
          if (name) $router.push(`/${name}`)
          else $router.push('/')
        }"
      />

      <v-toolbar-title>
        <router-link
          v-if="partition"
          :to="`/${partition}`"
        >
          {{ partition }}
        </router-link>

        <span v-if="tag">
          / <vueScopeComponent :id="tag" :path="['name']" />
        </span>
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        append-icon="fa-solid fa-arrow-right-from-bracket"
        @click="logout"
      >
        Logout
      </v-btn>

      <v-avatar
        class="ms-4 me-4"
        :image="auth.info.picture"
      />
    </v-toolbar>

    <v-container
      v-if="partition"
      :key="partition"
    >
      <router-view v-slot="{ Component, route }">
        <component
          :is="Component"
          :key="route.path"
        />
      </router-view>
    </v-container>
  </div>

  <v-snackbar
    v-model="tagMutationError"
    color="error"
    timeout="-1"
  >
    {{ tagMutationError }}

    <template v-slot:actions>
      <v-btn @click="tagMutationError = null">
        Dismiss
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { vueScopeComponent } from '@knowlearning/agents/vue.js'
import PartitionSwitcher from './partition-switcher.vue'

export default {
  components: {
    vueScopeComponent,
    PartitionSwitcher
  },

  data() {
    return {
      auth: null,
      tagMutationError: null
    }
  },

  async created() {
    window.addEventListener(
      'tag-mutation-failed',
      this.showTagMutationError
    )

    const { auth } = await Agent.environment()
    this.auth = auth
  },

  beforeUnmount() {
    window.removeEventListener(
      'tag-mutation-failed',
      this.showTagMutationError
    )
  },

  methods: {
    login() {
      Agent.login()
    },

    logout() {
      Agent.logout()
    },

    showTagMutationError(event) {
      this.tagMutationError = event.detail.message
    }
  },

  computed: {
    partition() {
      return this.$router.currentRoute.value?.params?.partition
    },

    tag() {
      return this.$router.currentRoute.value?.params?.tag
    }
  }
}
</script>