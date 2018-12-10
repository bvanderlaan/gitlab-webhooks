const EventEmitter = require('events')
const Buffer = require('buffer').Buffer

const test = require('tap').test
const simple = require('simple-mock')

const createMiddleware = require('../../middleware')

const headers = {
  'x-request-id': '123e4567-e89b-12d3-a456-426655440000',
  'x-gitlab-event': 'push',
  'x-gitlab-token': 'mysecret'
}

test('Invalid payload', t => {
  const requestMock = new EventEmitter()
  requestMock.method = 'POST'
  requestMock.headers = headers
  requestMock.url = '/'

  const responseMock = {
    end: simple.spy()
  }

  const middleware = createMiddleware({ secret: 'mysecret' })
  middleware(requestMock, responseMock)

    .then(() => {
      t.is(responseMock.statusCode, 400)
      t.is(responseMock.end.lastCall.arg, 'SyntaxError: Invalid JSON')
      t.end()
    })

  requestMock.emit('data', Buffer.from('foo'))
  requestMock.emit('end')
})

test('request error', t => {
  const requestMock = new EventEmitter()
  requestMock.method = 'POST'
  requestMock.headers = headers
  requestMock.url = '/'

  const responseMock = {
    end: simple.spy()
  }

  const middleware = createMiddleware({ secret: 'mysecret' })
  middleware(requestMock, responseMock)

    .then(() => {
      t.is(responseMock.statusCode, 500)
      t.is(responseMock.end.lastCall.arg, 'Error: oops')

      t.end()
    })

  const error = new Error('oops')
  requestMock.emit('error', error)
})
