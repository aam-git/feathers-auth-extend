# feathers-auth-extend

> 
>
>Plugin to extend the basic auth system for feathersjs adding
>* Password less Authentication
>* Verify Email on Signup (if not password less)
>* Refresh Tokens
>
>To make it easy to work with, I have not removed access to the built in authentication service which can still be set up with things like oauth, you can also set your own auth path in the config

## Installation

```shell
npm install feathers-auth-extend --save
```

## How to use

#### In your config file (eg config/default.json) add
```json
  "feathers-mail": {
    "from": "your@email.here",
    "smtp": {
        "host": "smtp.host.here",
        "secure": true,
        "auth": {
          "user": "smtp@user.here",
          "pass": "replacewithpassword"
        }
    }
  },
  "feathers-auth-extend": {
    "name": "API NAME",
    "route": "/auth",
    "magicTokens": true,
    "refreshTokens": true,
    "refreshExpires": "30d",
    "securePasswords": true,
    "zxcvbn": 3,
    "user": {
      "verifyEmail": true,
      "keepBefore": ["email", "password", "createdAt", "updatedAt"],
      "keepAfter": ["_id", "id"]
    }
  }
```
>If you wish to capture other items in your create account process, add them to user.KeepBefore.
>
>If you wish to output user items after successful login, add them to user.Keepafter


####Install plugin in app.js after "app.configure(channels);"
```js
// auth extend plugin
app.configure(require('feathers-auth-extend'));
```

## Example usages

#### Password less Login (with auto create account)
```get

GET Request:
https://api.url/authManage/email@address.here

```

This will then email an auth token that can be used as below

POST https://api.url/auth

```json
{
    "action": "loginToken",
    "email": "email@address.here",
    "login_token": "CodEHeRe"
}
```

This will login the user and mark them as a verified User

#### Refresh Token

POST https://api.url/auth

```json
{
    "action": "refresh",
    "refresh_token": "refrehstokengoeshere.........."
}
```

This will issue a new auth token to the default amount set up in your config

### Verify Account

POST https://api.url/authManage

```json
{
    "action": "verifyAccount",
    "email": "email@address.here",
    "token": "CodEhERe"
}
```

### Reset password request

POST https://api.url/authManage

```json
{
    "action": "resetPassword",
    "email": "email@address.here"

}
```

### Reset password verify

POST https://api.url/authManage

```json
{
    "action": "verifyReset",
    "email": "email@address.here",
    "token": "CodEhERe",
    "password": "SeCUREPassHERE"
}
```


## License

Copyright (c) 2020

Licensed under the [MIT license](LICENSE).
