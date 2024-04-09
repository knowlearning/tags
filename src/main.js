import Agent from '@knowlearning/agents/browser.js'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'

import 'vuetify/styles'
import '@fortawesome/fontawesome-free/css/all.css'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'
import vuetifyKnowLearningTheme from './vuetify-knowlearning-theme.js'

import Home from './home.vue'
import TagViewer from './tag-viewer.vue'

//  TODO: trim down imports
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


import App from './App.vue'

window.Agent = Agent

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'vuetifyKnowLearningTheme',
    themes: {
      vuetifyKnowLearningTheme,
    },
  },
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: { fa }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/:partition', component: Home, props: true },
    { path: '/:partition/:tag', component: TagViewer, props: true }
  ]
})

router
  .beforeEach((to, from) => {
    const { partition } = to.params
    window.document.title = partition ? `Tags | ${partition}` : 'Tags'
  })


createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
