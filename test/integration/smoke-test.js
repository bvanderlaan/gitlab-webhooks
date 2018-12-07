const test = require('tap').test

test('@vanderlaan/gitlab-webhooks', (t) => {
  const Webhooks = require('../..')
  const api = new Webhooks({ secret: 'mysecret' })

  t.type(api.sign, 'function')
  t.type(api.verify, 'function')
  t.type(api.on, 'function')
  t.type(api.removeListener, 'function')
  t.type(api.receive, 'function')
  t.type(api.middleware, 'function')
  t.type(api.verifyAndReceive, 'function')

  t.end()
})

test('require("@vanderlaan/gitlab-webhooks/sign")', (t) => {
  t.doesNotThrow(() => {
    require('../../sign')
  })

  t.end()
})

test('require("@vanderlaan/gitlab-webhooks/verify")', (t) => {
  t.doesNotThrow(() => {
    require('../../verify')
  })

  t.end()
})

test('require("@vanderlaan/gitlab-webhooks/event-handler")', (t) => {
  t.doesNotThrow(() => {
    require('../../event-handler')
  })

  t.end()
})

test('require("@vanderlaan/gitlab-webhooks/middleware")', (t) => {
  t.doesNotThrow(() => {
    require('../../middleware')
  })

  t.end()
})
