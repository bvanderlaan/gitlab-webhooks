module.exports = receiverOn

const webhookNames = require('../lib/webhook-names.json')

function receiverOn (state, webhookNameOrNames, handler) {
  if (Array.isArray(webhookNameOrNames)) {
    webhookNameOrNames.forEach(webhookName => receiverOn(state, webhookName, handler))
    return
  }

  let webhookName = webhookNameOrNames.toLowerCase()

  if (webhookNames.indexOf(webhookName) === -1) {
    if (webhookNames.indexOf(`${webhookName} hook`) !== -1) {
      webhookName = `${webhookName} hook`
    } else if (webhookNames.indexOf(webhookName.replace('.', ' hook.')) !== -1) {
      webhookName = webhookName.replace('.', ' hook.')
    } else {
      console.warn(`"${webhookNameOrNames}" is not a known webhook name (https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#events)`)
    }
  }

  if (!state.hooks[webhookName]) {
    state.hooks[webhookName] = []
  }

  state.hooks[webhookName].push(handler)
}
