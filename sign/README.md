# sign

The `sign` method can be used as a standalone method.

```js
const sign = require('@vanderlaan/gitlab-webhooks/sign')
const signature = sign(secret, eventPayload)
// string like "sha1=d03207e4b030cf234e3447bac4d93add4c6643d8"
```

<table width="100%">
  <tr>
    <td>
      <code>
        options.secret
      </code>
      <em>(String)</em>
    </td>
    <td>
      <strong>Required.</strong>
      Secret as configured in GitLab Settings.
    </td>
  </tr>
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

Returns a `signature` string. Throws error if required arguments are not passed.

Back to [@vanderlaan/gitlab-webhooks README](..).
