# @vanderlaan/gitlab-webhooks

> GitLab webhook events toolset for Node.js

[![Build Status](https://travis-ci.org/bvanderlaan/gitlab-webhooks.svg?branch=master)](https://travis-ci.org/bvanderlaan/gitlab-webhook)

---
**THIS IS A FORK OF [@octokit/webhooks](https://github.com/octokit/webhooks.js) WHICH HAS BEEN MODIFIED TO WORK WITH [GitLab](https://about.gitlab.com/)**

**I'VE TRIED TO KEEP IT FEATURE AND API PARITY WITH [@octokit/webhooks](https://github.com/octokit/webhooks.js) SO IT CAN BE USED AS A DROP IN MODULE**

---


`@vanderlaan/gitlab-webhooks` helps to handle webhook events received from GitLab.

## Example

```js
// install with: npm install @vanderlaan/gitlab-webhooks
const WebhooksApi = require('@vanderlaan/gitlab-webhooks')
const webhooks = new WebhooksApi({
  secret: 'mysecret'
})

webhooks.on('*', ({id, name, payload}) => {
  console.log(name, 'event received')
})

require('http').createServer(webhooks.middleware).listen(3000)
// can now receive webhook events at port 3000
```

## Local development

You can receive webhooks on your local machine or even browser using [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) and [smee.io](https://smee.io/).

Go to [smee.io](https://smee.io/) and <kbd>Start a new channel</kbd>. Then copy the "Webhook Proxy URL" and

1. enter it in the GitLab Integration "Webhook URL" input
2. pass it to the [EventSource](https://github.com/EventSource/eventsource) constructor, see below

```js
const webhookProxyUrl = 'https://smee.io/IrqK0nopGAOc847' // replace with your own Webhook Proxy URL
const source = new EventSource(webhookProxyUrl)
source.onmessage = (event) => {
  const webhookEvent = JSON.parse(event.data)
  webhooks.verifyAndReceive({
    id: webhookEvent['x-request-id'],
    name: webhookEvent['x-gitlab-event'],
    signature: webhookEvent['x-gitlab-token'],
    payload: webhookEvent.body
  }).catch(console.error)
}
```

`EventSource` is a native browser API and can be polyfilled for browsers that don’t support it. In node, you can use the [`eventsource`](https://github.com/EventSource/eventsource) package: install with `npm install eventsource`, then `const EventSource = require('eventsource')`

You can get GitLab to send test events, [See testing webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#testing-webhooks)

## API

1. [Constructor](#constructor)
2. [webhooks.sign()](#webhookssign)
3. [webhooks.verify()](#webhooksverify)
4. [webhooks.verifyAndReceive()](#webhooksverifyandreceive)
4. [webhooks.receive()](#webhooksreceive)
5. [webhooks.on()](#webhookson)
6. [webhooks.removeListener()](#webhooksremoveListener)
7. [webhooks.middleware()](#webhooksmiddleware)
8. [Webhook events](#webhook-events)
9. [Special events](#special-events)
   1. [`*` wildcard event](#-wildcard-event)
   1. [`error` event](#error-event)

### Constructor

```js
new WebhooksApi({secret[, path]})
```

<table width="100%">
  <tr>
    <td>
      <code>
        secret
      </code>
      <em>(String)</em>
    </td>
    <td>
      <strong>Required.</strong>
      Secret as configured in GitLab Integration Settings.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        transform
      </code>
      <em>(Function)</em>
    </td>
    <td>
      Only relevant for <a href="#webhookson"><code>webhooks.on</code></a>.
      Transform emitted event before calling handlers. Can be asynchronous.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        path
      </code>
      <em>(String)</em>
    </td>
    <td>
      Only relevant for <a href="#webhooksmiddleware"><code>webhooks.middleware</code></a>.
      Custom path to match requests against. Defaults to <code>/</code>.
    </td>
  </tr>
</table>

Returns the `webhooks` API.

### webhooks.sign()

```js
webhooks.sign(eventPayload)
```

<table width="100%">
  <tr>
    <td>
      <code>
        eventPayload
      </code>
      <em>
        (Object)
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Webhook request payload as received from GitLab
    </td>
  </tr>
</table>

Returns a `signature` string. Throws error if `eventPayload` is not passed.

Can also be used [standalone](sign/).

### webhooks.verify()

```js
webhooks.verify(eventPayload, signature)
```

<table width="100%">
  <tr>
    <td>
      <code>
        eventPayload
      </code>
      <em>
        (Object)
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Webhook event request payload as received from GitLab.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        signature
      </code>
      <em>
        (String)
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Signature string as calculated by <code><a href="#webhookssign">webhooks.sign()</a></code>.
    </td>
  </tr>
</table>

Returns `true` or `false`. Throws error if `eventPayload` or `signature` not passed.

Can also be used [standalone](verify/).

### webhooks.verifyAndReceive()

```js
webhooks.verifyAndReceive({id, name, payload, signature})
```

<table width="100%">
  <tr>
    <td>
      <code>
        id
      </code>
      <em>
        String
      </em>
    </td>
    <td>
      Unique webhook event request id
    </td>
  </tr>
  <tr>
    <td>
      <code>
        name
      </code>
      <em>
        String
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Name of the event. (Event names are set as <a href="https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#events"><code>X-Gitlab-Event</code> header</a>
      in the webhook event request.)
    </td>
  </tr>
  <tr>
    <td>
      <code>
        payload
      </code>
      <em>
        Object
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Webhook event request payload as received from GitLab.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        signature
      </code>
      <em>
        (String)
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Signature string as calculated by <code><a href="#webhookssign">webhooks.sign()</a></code>.
    </td>
  </tr>
</table>

Returns a promise.

Verifies event using [webhooks.verify()](#webhooksverify), then handles the event using [webhooks.receive()](#webhooksreceive).

Additionally, if verification fails, rejects return promise and emits an `error` event.

Example

```js
const WebhooksApi = require('@vanderlaan/gitlab-webhooks')
const webhooks = new WebhooksApi({
  secret: 'mysecret'
})
eventHandler.on('error', handleSignatureVerificationError)

// put this inside your webhooks route handler
eventHandler.verifyAndReceive({
  id: request.headers['x-request-id'],
  name: request.headers['x-gitlab-event'],
  payload: request.body,
  signature: request.headers['x-gitlab-token']
}).catch(handleErrorsFromHooks)
```

### webhooks.receive()

```js
webhooks.receive({id, name, payload})
```

<table width="100%">
  <tr>
    <td>
      <code>
        id
      </code>
      <em>
        String
      </em>
    </td>
    <td>
      Unique webhook event request id
    </td>
  </tr>
  <tr>
    <td>
      <code>
        name
      </code>
      <em>
        String
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Name of the event. (Event names are set as <a href="https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#events"><code>X-Gitlab-Event</code> header</a>
      in the webhook event request.)
    </td>
  </tr>
  <tr>
    <td>
      <code>
        payload
      </code>
      <em>
        Object
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Webhook event request payload as received from GitLab.
    </td>
  </tr>
</table>

Returns a promise. Runs all handlers set with [`webhooks.on()`](#webhookson) in parallel and waits for them to finish. If one of the handlers rejects or throws an error, then `webhooks.receive()` rejects. The returned error has an `.errors` property which holds an array of all errors caught from the handlers. If no errors occur, `webhooks.receive()` resolves without passing any value.

The `.receive()` method belongs to the [receiver](receiver/) module which can be used standalone.

### webhooks.on()

```js
webhooks.on(eventName, handler)
webhooks.on(eventNames, handler)
```

<table width="100%">
  <tr>
    <td>
      <code>
        eventName
      </code>
      <em>
        String
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Name of the event. One of <a href="#listofalleventnames">GitLab’s supported event names</a>.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        eventNames
      </code>
      <em>
        Array
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Array of event names.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        handler
      </code>
      <em>
        Function
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Method to be run each time the event with the passed name is received.
      the <code>handler</code> function can be an async function, throw an error or
      return a Promise. The handler is called with an event object: <code>{id, name, payload}</code>.
    </td>
  </tr>
</table>

The `.on()` method belongs to the [receiver](receiver/) module which can be used standalone.

### webhooks.removeListener()

```js
webhooks.removeListener(eventName, handler)
webhooks.removeListener(eventNames, handler)
```

<table width="100%">
  <tr>
    <td>
      <code>
        eventName
      </code>
      <em>
        String
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Name of the event. One of <a href="#listofalleventnames">GitLab’s supported event names</a>.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        eventNames
      </code>
      <em>
        Array
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Array of event names.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        handler
      </code>
      <em>
        Function
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      Method which was previously passed to <code><a href="webhookson">webhooks.on()</a></code>. If the same handler was registered multiple times for the same event, only the most recent handler gets removed.
    </td>
  </tr>
</table>

The `.removeListener()` method belongs to the [receiver](receiver/) module which can be used standalone.

### webhooks.middleware()

```js
webhooks.middleware(request, response[, next])
```

<table width="100%">
  <tr>
    <td>
      <code>
        request
      </code>
      <em>
        Object
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      A Node.js <a href="https://nodejs.org/docs/latest/api/http.html#http_class_http_clientrequest">http.ClientRequest</a>.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        response
      </code>
      <em>
        Object
      </em>
    </td>
    <td>
      <strong>Required.</strong>
      A Node.js <a href="https://nodejs.org/docs/latest/api/http.html#http_class_http_serverresponse">http.ServerResponse</a>.
    </td>
  </tr>
  <tr>
    <td>
      <code>
        next
      </code>
      <em>
        Function
      </em>
    </td>
    <td>
      Optional function which invokes the next middleware, as used by <a href="https://github.com/senchalabs/connect">Connect</a> and <a href="http://expressjs.com/">Express</a>.
    </td>
  </tr>
</table>

Returns a `requestListener` (or _middleware_) method which can be directly passed to [`http.createServer()`](https://nodejs.org/docs/latest/api/http.html#http_http_createserver_requestlistener), <a href="http://expressjs.com/">Express</a> and other compatible Node.js server frameworks.

Can also be used [standalone](middleware/).

### Webhook events

See the full list of [event types with example payloads](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#events).

If there are actions for a webhook, events are emitted for both, the webhook name as well as a combination of the webhook name and the action, e.g. `installation` and `installation.created`.

<table>
  <thead>
    <tr>
      <th>Event</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tr>
    <th align=left valign=top>
      <code>commit_comment</code>
    </th>
    <td>
      <code>.created</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>create</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>delete</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>deployment</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>deployment_status</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>fork</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>gollum</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>installation</code>
    </th>
    <td>
      <code>.created</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>installation_repositories</code>
    </th>
    <td>
      <code>.added</code><br><code>.removed</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>issue_comment</code>
    </th>
    <td>
      <code>.created</code><br><code>.edited</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>issues</code>
    </th>
    <td>
      <code>.assigned</code><br><code>.unassigned</code><br><code>.labeled</code><br><code>.unlabeled</code><br><code>.opened</code><br><code>.edited</code><br><code>.milestoned</code><br><code>.demilestoned</code><br><code>.closed</code><br><code>.reopened</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>label</code>
    </th>
    <td>
      <code>.created</code><br><code>.edited</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>marketplace_purchase</code>
    </th>
    <td>
      <code>.purchased</code><br><code>.cancelled</code><br><code>.changed</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>member</code>
    </th>
    <td>
      <code>.added</code><br><code>.edited</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>membership</code>
    </th>
    <td>
      <code>.added</code><br><code>.removed</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>milestone</code>
    </th>
    <td>
      <code>.created</code><br><code>.closed</code><br><code>.opened</code><br><code>.edited</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>org_block</code>
    </th>
    <td>
      <code>.blocked</code><br><code>.unblocked</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>organization</code>
    </th>
    <td>
      <code>.member_added</code><br><code>.member_removed</code><br><code>.member_invited</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>page_build</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>ping</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>project</code>
    </th>
    <td>
      <code>.created</code><br><code>.edited</code><br><code>.converted</code><br><code>.moved</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>project_card</code>
    </th>
    <td>
      <code>.created</code><br><code>.edited</code><br><code>.closed</code><br><code>.reopened</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>project_column</code>
    </th>
    <td>
      <code>.created</code><br><code>.edited</code><br><code>.moved</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>public</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>pull_request</code>
    </th>
    <td>
      <code>.assigned</code><br><code>.unassigned</code><br><code>.review_requested</code><br><code>.review_request_removed</code><br><code>.labeled</code><br><code>.unlabeled</code><br><code>.opened</code><br><code>.edited</code><br><code>.closed</code><br><code>.reopened</code><br><code>.synchronize</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>pull_request_review</code>
    </th>
    <td>
      <code>.submitted</code><br><code>.edited</code><br><code>.dismissed</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>pull_request_review_comment</code>
    </th>
    <td>
      <code>.created</code><br><code>.edited</code><br><code>.deleted</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>push</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>release</code>
    </th>
    <td>
      <code>.published</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>repository</code>
    </th>
    <td>
      <code>.created</code><br><code>.deleted</code><br><code>.archived</code><br><code>.unarchived</code><br><code>.publicized</code><br><code>.privatized</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>status</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>team</code>
    </th>
    <td>
      <code>.created</code><br><code>.deleted</code><br><code>.edited</code><br><code>.added_to_repository</code><br><code>.removed_from_repository</code>
    </td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>team_add</code>
    </th>
    <td></td>
  </tr>
  <tr>
    <th align=left valign=top>
      <code>watch</code>
    </th>
    <td>
      <code>.started</code>
    </td>
  </tr>
</table>

### Special events

Besides the webhook events, there are [special events](#specialevents) emitted by `@vanderlaan/gitlab-webhooks`.

#### `*` wildcard event

The `*` event is emitted for all webhook events [listed above](#listofwebhookevents).

```js
webhooks.on('*', (event) => {
  console.log(`"${event.name}" event received"`)
})
```

#### `error` event

If a webhook event handler throws an error or returns a promise that rejects, an `error` event is triggered. You can subscribe to this event for logging or reporting events. The passed `error` object has a `.event` property which has all information on the event:

- `id`: The unique webhook event request id
- `name`: The name of the event
- `payload`: The event request payload

```js
webhooks.on('error', (error) => {
  console.log(`Error occured in "${error.event.name} handler: ${error.stack}"`)
})
```

Asynchronous `error` event handler are not blocking the `.receive()` method from completing.

## License

[MIT](LICENSE.md)
