import React from "react";
import useHttpService from "use-http-service";

function App() {
  const [{ isPending, isSuccess, data, error }, callApi] = useHttpService({
    url: "https://jsonplaceholder.typicode.com/todosTYPO",
  });

  React.useEffect(() => {
    (async () => {
      try {
        await callApi();
      } catch (e) {
        // errors are thrown only if the response body is not valid JSON
        // if you expect a valid JSON response you could skip
        // the try-catch block entirely
        console.log(e);
      }
    })();
  }, []);

  if (isPending) return <div>Loading...</div>;

  // here you can display the error response whenever
  // you receive a failure HTTP status code
  // (jsonplaceholder.typicode.com does not return error
  // messages so we are displaying a custom message instead of
  // using the error object)
  if (!isSuccess) return <div>{error && "Error!"}</div>;

  return <div>{data && data.map((todo) => <p>{todo.id}</p>)}</div>;
}

export default App;
