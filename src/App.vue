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
      <v-toolbar-title>
        <router-link v-if="partition" :to="`/${partition}`">{{ partition }}</router-link>
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
    <v-container v-if="partition" :key="partition">
      <router-view v-slot="{ Component, route }">
        <Suspense>
          <component :is="Component" :key="route.path" />
        </Suspense>
      </router-view>
    </v-container>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid'
import { vueScopeComponent } from '@knowlearning/agents/vue.js'
import PartitionSwitcher from './partition-switcher.vue'

export default {
  components: {
    vueScopeComponent,
    PartitionSwitcher
  },
  data() {
    return {
      auth: null
    }
  },
  async created() {
    const { auth } = await Agent.environment()

    this.auth = auth
  },
  methods: {
    login() { Agent.login() },
    logout() { Agent.logout() },
  },
  computed: {
    partition() {
      return this.$router.currentRoute.value?.params?.partition
    }
  }
}

</script>