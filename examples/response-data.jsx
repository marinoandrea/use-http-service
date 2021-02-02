import React from "react";
import useHttpService from "use-http-service";

function App() {
  const [{ isPending }, callApi] = useHttpService({
    url: "https://sonplaceholder.typicode.com/todos",
  });

  React.useEffect(() => {
    (async () => {
      const res = await callApi();
      if (res.isOk) {
        // here you can use the response data
        // eg. redux action dispatch / other state updates
        // updateTodos(res.data)
        console.log(res.data);
        // the output depends on the response body structure,
        // in this case it prints an array:
        // eg. [{id: 1, ...} ...]
      } else {
        // use error response
        // (jsonplaceholder.typicode.com does not
        // return error messages)
        console.log(res.error);
      }
    })();
  }, []);

  if (isPending) return <div>Loading...</div>;

  return <div>{!!data && data.map((d) => <p>{d.id}</p>)}</div>;
}

export default App;
