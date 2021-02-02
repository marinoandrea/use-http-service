import React from "react";
import useHttpService from "use-http-service";

function App() {
  const [{ isPending, isSuccess, data }, createPost] = useHttpService({
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

  if (isSuccess && !!data) return <div>Post uploaded! (id={data.id})</div>;

  return (
    <div>
      <button onClick={handleClick}>New Post</button>
    </div>
  );
}

export default App;
