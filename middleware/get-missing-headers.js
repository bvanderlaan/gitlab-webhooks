module.exports = getMissingHeaders

const WEBHOOK_HEADERS = [
  'x-gitlab-event',
  'x-gitlab-token'
]

// https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#events
function getMissingHeaders (request) {
  return WEBHOOK_HEADERS.filter(header => !(header in request.headers))
}
