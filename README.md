# use-http-service

Minimal React hook that wraps a fetch request to a JSON HTTP service.

## Installation

Using npm:

`npm i @marinoandrea/use-http-service --save`

Using yarn:

`yarn add @marinoandrea/use-http-service`

## Usage

The hook has to be called inside the body of a React functional component:

```typescript
const [requestState, callApi] = useHttpService({
  // configuration
});
```

## Examples

POST request:

```jsx
function App() {
  const [{ isPending }, createPost] = useHttpService({
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
  });

  const handleClick = async () => {
    await createPost({
      title: "foo",
      body: "bar",
      userId: 1,
    });
  };

  if (isPending) return <div>Uploading...</div>;

  return (
    <div>
      <button onClick={handleClick}>New Post</button>
    </div>
  );
}
```

GET request #1, using state values:

```jsx
function App() {
  const [{ isPending, isSuccess, data, error }, callApi] = useHttpService({
    url: "https://sonplaceholder.typicode.com/todos",
  });

  React.useEffect(() => {
    (async () => {
      try {
        await callApi();
      } catch (e) {
        // errors are thrown only if the response body is not valid JSON
        // if you expect a valid response you can skip the try-catch block entirely
        console.log(e);
      }
    })();
  }, []);

  if (isPending) return <div>Loading...</div>;

  if (!isSuccess) return <div>{error && "Error!"}</div>;

  return <div>{data && data.map((todo) => <p>{todo.id}</p>)}</div>;
}
```

GET request #2, using response directly:

```jsx
function App() {
  const [{ isPending }, callApi] = useHttpService({
    url: "https://sonplaceholder.typicode.com/todos",
  });

  React.useEffect(() => {
    (async () => {
      const res = await callApi();
      if (res.isOk) {
        // use body data
        console.log(res.data);
        // [{id: 1, ...} ...]
      } else {
        // use body error
        console.log(res.error);
      }
    })();
  }, []);

  if (isPending) return <div>Loading...</div>;

  return <div>Loaded!</div>;
}
```

Usage with Typescript:

```tsx
type RequestBody = {
  userId: number;
  title: string;
  body: string;
};

// jsonplaceholder returns the newly created post's id
type SuccessResponseBody = {
  id: number;
};

// jsonplaceholder does not specify an error response schema,
// this is just an example
type FailureResponseBody = {
  msg: string;
};

function App() {
  const [{ isPending }, createPost] = useHttpService<
    RequestBody,
    SuccessResponseBody,
    FailureResponseBody
  >({
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
  });

  const handleClick = async () => {
    await createPost({
      title: "foo",
      body: "bar",
      userId: 1,
    });
  };

  if (isPending) return <div>Uploading...</div>;

  return (
    <div>
      <button onClick={handleClick}>New Post</button>
    </div>
  );
}
```

```tsx
type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

// we will be sending a GET request so its body type is irrelevant
type RequestBody = undefined;

// jsonplaceholder returns a JSON array of todos
type SuccessResponseBody = Todo[];

// jsonplaceholder does not specify an error response schema,
// this is just an example
type FailureResponseBody = {
  msg: string;
};

function App() {
  const [{ isPending, isSuccess, data, error }, callApi] = useHttpService<
    RequestBody,
    SuccessResponseBody,
    FailureResponseBody
  >({
    url: "https://jsonplaceholder.typicode.com/todos",
  });

  React.useEffect(() => {
    (async () => {
      try {
        await callApi();
      } catch (e: FetchError) {
        // errors are thrown only if the response body is not valid JSON
        // if you expect a valid response you can skip the try-catch block entirely
        console.log(e);
      }
    })();
  }, []);

  if (isPending) return <div>Loading...</div>;

  if (!isSuccess) return <div>{error && error.msg}</div>;

  return <div>{data && data.map((todo) => <p>{todo.id}</p>)}</div>;
}
```
