import Agent from '@knowlearning/agents/browser.js'
import { createApp } from 'vue'
import './style.css'

import 'vuetify/styles'
import '@fortawesome/fontawesome-free/css/all.css'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'
import vuetifyKnowLearningTheme from './vuetify-knowlearning-theme.js'

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

Agent
  .environment()
  .then(({ auth: { provider } }) => {
    if (provider !== 'google') Agent.login()
  })

createApp(App)
  .use(vuetify)
  .mount('#app')
