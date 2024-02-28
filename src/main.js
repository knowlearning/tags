import Agent from '@knowlearning/agents/browser.js'
import { createApp } from 'vue'
import './style.css'

import App from './App.vue'

window.Agent = Agent

Agent
  .environment()
  .then(({ auth: { provider } }) => {
    if (provider !== 'google') Agent.login()
  })

createApp(App).mount('#app')
