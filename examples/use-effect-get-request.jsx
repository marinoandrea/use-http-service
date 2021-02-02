import React from "react";
import useHttpService from "use-http-service";

function App() {
  const [{ isPending, isSuccess, data }, callApi] = useHttpService({
    url: "https://jsonplaceholder.typicode.com/todos",
  });

  React.useEffect(() => {
    (async () => await callApi())();
  }, []);

  if (isPending) return <div>Loading...</div>;

  if (!isSuccess) return <div>Error!</div>;

  return <div>{!!data && data.map((todo) => <p>{todo.id}</p>)}</div>;
}

export default App;
