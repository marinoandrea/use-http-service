import { renderHook } from "@testing-library/react-hooks";
import express from "express";
import http from "http";
import fetch, { FetchError } from "node-fetch";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import useHttpService from "../src";

// @ts-expect-error: node-fetch args slightly differ from browser's Fetch API
global.fetch = fetch;

type SuccessResponse = {
  msg: string;
};

type FailureResponse = {
  errorMsg: string;
};

const SERVER_PORT = process.env.JEST_MOCK_SERVER_PORT || 3002;
const API_ENDPOINT = `http://localhost:${SERVER_PORT}`;
const TIMER_PERIOD = 200;

function sleep(period: number) {
  return new Promise((resolve) => setTimeout(resolve, period));
}

let app: express.Express;
let serverInstance: http.Server;

function initServer() {
  app = express();

  app.get("/example", (_, res) => res.send({ msg: "success!" }));

  app.get("/not-authorized-endpoint", (_, res) =>
    res.status(401).send({ errorMsg: "error!" })
  );

  app.get("/not-a-json-endpoint", (_, res) => res.send("not json"));

  app.get("/timed-endpoint", (_, res) => {
    setTimeout(() => res.status(200).send({ msg: "success!" }), TIMER_PERIOD);
  });

  app.get("/timed-unauthorized-endpoint", (_, res) => {
    setTimeout(
      () => res.status(401).send({ errorMsg: "error!" }),
      TIMER_PERIOD
    );
  });

  serverInstance = app.listen(SERVER_PORT);
}

function closeServer() {
  serverInstance.close();
}

beforeEach(() => {
  initServer();
});

afterEach(() => {
  closeServer();
});

test("Request state initializes properly", () => {
  const { result } = renderHook(() =>
    useHttpService<undefined, SuccessResponse, FailureResponse>({
      url: `${API_ENDPOINT}/example`,
    })
  );

  const [requestState] = result.current;

  expect(requestState.isPending).toBe(false);
  expect(requestState.isSuccess).toBe(false);
});

test("Request returns SuccessResult when HTTP code indicates success", async () => {
  const { result } = renderHook(() =>
    useHttpService<undefined, SuccessResponse, FailureResponse>({
      url: `${API_ENDPOINT}/example`,
    })
  );

  const [, getData] = result.current;

  expect.hasAssertions();

  await act(async () => {
    const data = await getData();
    expect(data).toMatchObject({ isOk: true, data: { msg: "success!" } });
  });
});

test("Request returns ErrorResult when HTTP code indicates failure", async () => {
  const { result } = renderHook(() =>
    useHttpService<undefined, SuccessResponse, FailureResponse>({
      url: `${API_ENDPOINT}/not-authorized-endpoint`,
    })
  );

  const [, getData] = result.current;

  expect.hasAssertions();

  await act(async () => {
    const error = await getData();
    expect(error).toMatchObject({ isOk: false, error: { errorMsg: "error!" } });
  });
});

test("Request throws FetchError when response is not valid JSON", async () => {
  const { result } = renderHook(() =>
    useHttpService<undefined, SuccessResponse, FailureResponse>({
      url: `${API_ENDPOINT}/not-a-json-endpoint`,
    })
  );

  const [, getData] = result.current;

  expect.hasAssertions();

  await act(async () => {
    try {
      await getData();
    } catch (e) {
      expect(e).toBeInstanceOf(FetchError);
    }
  });
});

test("Component displays success response body correctly.", async () => {
  let component: ReactTestRenderer;
  act(() => {
    component = create(<TestComponent />);
  });

  const instance = component!.root;

  function clickButton() {
    const button = instance.findByType("button");
    button.props.onClick();
  }

  act(() => clickButton());

  expect(instance!.findByType("div").children[0]).toBe("Loading...");

  await act(async () => {
    await sleep(TIMER_PERIOD + 100);
  });

  expect(instance!.findByType("div").children[0]).toBe("success!");
});

test("Component displays failure response body correctly.", async () => {
  let component: ReactTestRenderer;
  act(() => {
    component = create(<TestComponent failure />);
  });

  const instance = component!.root;

  function clickButton() {
    const button = instance.findByType("button");
    button.props.onClick();
  }

  act(() => clickButton());

  expect(instance!.findByType("div").children[0]).toBe("Loading...");

  await act(async () => {
    await sleep(TIMER_PERIOD + 100);
  });

  expect(instance!.findByType("div").children[0]).toBe("error!");
});

const TestComponent: React.FC<{ failure?: boolean }> = ({
  failure = false,
}) => {
  const [{ data, error, isPending, isSuccess }, callApi] = useHttpService<
    undefined,
    SuccessResponse,
    FailureResponse
  >({
    url: `${API_ENDPOINT}/${
      failure ? "timed-unauthorized-endpoint" : "timed-endpoint"
    }`,
  });

  const handleClick = async () => await callApi();

  if (isPending) return <div id="test">Loading...</div>;

  if (!isSuccess && error) return <div id="test">{error.errorMsg}</div>;

  return (
    <>
      <button onClick={handleClick}>Click</button>
      <div id="test">{data && data.msg}</div>
    </>
  );
};
