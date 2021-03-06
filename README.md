# use-http-service

[![Build Status](https://travis-ci.com/marinoandrea/use-http-service.svg?token=oQZSVvHp9LbB8M8icK4Z&branch=main)](https://travis-ci.com/marinoandrea/use-http-service)
[![npm version](https://badge.fury.io/js/use-http-service.svg)](https://badge.fury.io/js/use-http-service)
[![codecov](https://codecov.io/gh/marinoandrea/use-http-service/branch/main/graph/badge.svg?token=GBG8UTR8W2)](https://codecov.io/gh/marinoandrea/use-http-service)

Minimal React hook that wraps a fetch request to a JSON HTTP service.

## Installation

Using npm:

```
npm i use-http-service --save
```

Using yarn:

```
yarn add use-http-service
```

## Usage

You can import the hook as follows:

```typescript
import useHttpService from "use-http-service";
```

The hook has to be called inside the body of a React functional component:

```typescript
const [requestState, callApi] = useHttpService({
  url: "https://someapi.com/resource",

  // all values below are optional
  method: "PUT", // defaults to 'GET'
  credentials: "include", // possible values: "include" | "omit" | "same-origin"
  keepalive: false,
  mode: "cors", // possible values:  "cors" | "navigate" | "no-cors" | "same-origin"
  redirect: "follow", // possible values: "error" | "follow" | "manual"
  headers: {
    Authorization: "Bearer a.jwt.token",
    // `Content-Type` and `Accept` are automatically
    // set to `application/json`
  },
});
```

The `callApi` function is an async function that takes the body of your request (if needed) as an argument and returns a `Result` object:

```typescript
const handleApiRequest = async (body) => {
  const res = await callApi(body);

  if (res.isOk) {
    const { data } = res;
    // use response body
    // ...
  } else {
    const { error } = res;
    // use error response body
    // ...
  }
};
```

## Examples

Usage with JavaScript:

- simple button click POST request ([jsx](examples/button-post-request.jsx))

- useEffect GET request ([jsx](examples/use-effect-get-request.jsx))

- error handling in useEffect GET request ([jsx](examples/error-handling.jsx))

- using response data ([jsx](examples/response-data.jsx))

Usage with TypeScript:

- simple button click POST request ([tsx](examples/typescript.tsx))

## Authors

- **Andrea Marino** - ([marinoandrea](https://github.com/marinoandrea))

See also the list of [contributors](https://github.com/marinoandrea/use-http-service/contributors) who participated in this project.
