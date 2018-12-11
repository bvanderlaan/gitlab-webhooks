const test = require('tap').test

const EventHandler = require('../../event-handler')
const pushEventPayload = require('../fixtures/push-payload')
const mergeRequestPayload = require('../fixtures/merge-request-payload')

test('events', t => {
  t.plan(6)

  const eventHandler = new EventHandler()

  const hooksCalled = []
  function hook1 () {
    return Promise.resolve()

      .then(() => {
        hooksCalled.push('hook1')
      })
  }
  function hook2 () {
    hooksCalled.push('hook2')
  }
  function hook3 () {
    hooksCalled.push('hook3')
  }
  function hook4 () {
    hooksCalled.push('hook4')
  }
  function hook5 () {
    hooksCalled.push('hook5')
  }
  function hook6 () {
    hooksCalled.push('Merge Request Hook')
  }
  function hook7 (event) {
    hooksCalled.push(`* (${event.name})`)
  }
  function hook8 () {
    hooksCalled.push('hook8')
  }
  function hook9 () {
    hooksCalled.push('hook9')
  }

  eventHandler.on('push hook', hook1)
  eventHandler.on('Push Hook', hook2)
  eventHandler.on('push hook', hook3)
  eventHandler.on(['push hook'], hook4)
  eventHandler.on('push', hook5)
  eventHandler.on('merge request hook', hook6)
  eventHandler.on('*', hook7)
  eventHandler.on('merge request hook.open', hook8)
  eventHandler.on('merge request.open', hook9)

  eventHandler.removeListener('push hook', hook3)
  eventHandler.removeListener(['push hook'], hook4)
  eventHandler.removeListener('unknown', () => {})

  eventHandler.receive({
    id: '123',
    name: 'Push Hook',
    payload: pushEventPayload
  })

    .then(() => {
      return eventHandler.receive({
        id: '456',
        name: 'Merge Request Hook',
        payload: mergeRequestPayload
      })
    })

    .then(() => {
      t.deepEqual(hooksCalled, ['hook2', 'hook5', '* (push hook)', 'hook1', 'hook8', 'hook9', 'Merge Request Hook', '* (merge request hook)'])

      eventHandler.on('error', (error) => {
        t.ok(error.event.payload)
        t.pass('error event triggered')
        t.is(error.message, 'oops')
      })

      eventHandler.on('push hook', () => {
        throw new Error('oops')
      })

      return eventHandler.receive({
        id: '123',
        name: 'Push Hook',
        payload: pushEventPayload
      })
    })

    .catch(error => {
      t.is(error.errors.length, 1)
      t.is(error.errors[0].message, 'oops')
    })

    .catch(t.error)
})

test('options.transform', t => {
  t.plan(2)

  const eventHandler = EventHandler({
    transform: (event) => {
      t.is(event.id, '123')
      return 'funky'
    }
  })

  eventHandler.on('push hook', (event) => {
    t.is(event, 'funky')
  })

  eventHandler.receive({
    id: '123',
    name: 'Push Hook',
    payload: pushEventPayload
  })
})

test('async options.transform', t => {
  const eventHandler = EventHandler({
    transform: (event) => {
      return Promise.resolve('funky')
    }
  })

  eventHandler.on('push hook', (event) => {
    t.is(event, 'funky')
    t.end()
  })

  eventHandler.receive({
    id: '123',
    name: 'Push Hook',
    payload: pushEventPayload
  })
})
