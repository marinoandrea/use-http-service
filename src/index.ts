import React from "react";

/**
 * React hook that wraps a fetch request to a JSON based HTTP service.
 * @param service Service descriptor object. Resembles Fetch API's RequestInit but should not contain a body.
 * @param callback Synchronous callback to execute on the response JSON body.
 * @typedef T The request body object
 * @typedef U The response body object on success
 * @typedef V The response body object on error
 * @returns Array containing an object that tracks the request state [0] and the function that wraps the fetch call [1]
 */
export default function useHttpService<T, U, V>(
  service: Service,
  callback?: (data: U) => void
): [RequestState<U, V>, (requestBody: T) => void] {
  const [requestState, setRequestState] = useRequestState<U, V>();

  const callService = (requestBody: T) => {
    const { url, ...serviceInfo } = service;
    fetch(url, { ...serviceInfo, body: JSON.stringify(requestBody) })
      .then(handleResponse)
      .then(handleData)
      .catch(handleError)
      .finally(cleanup);
  };

  return [requestState, callService];

  function handleResponse(res: Response) {
    if (!res.ok) throw new ServiceRequestError(res);
    return res.json();
  }

  function handleData(data: U) {
    setRequestState({
      ...requestState,
      isPending: false,
      isSuccess: true,
      data,
    });

    try {
      if (callback) callback(data);
    } catch (e) {
      throw new ServiceCallbackError(e);
    }
  }

  function handleError(err: Error) {
    if (err instanceof ServiceCallbackError) throw err.exc;

    if (err instanceof ServiceRequestError)
      err.res.json().then((data: V) =>
        setRequestState({
          ...requestState,
          isPending: false,
          isSuccess: false,
          error: data,
        })
      );

    throw err;
  }

  function cleanup() {
    setRequestState({
      ...requestState,
      isPending: false,
    });
  }
}

function useRequestState<T, U>(): [
  RequestState<T, U>,
  (newState: RequestState<T, U>) => void
] {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [data, setData] = React.useState<T>();
  const [error, setError] = React.useState<U>();

  const setRequestState = (data: RequestState<T, U>) => {
    if (data.isPending) setIsPending(data.isPending);
    if (data.isSuccess) setIsSuccess(data.isSuccess);
    if (data.data) setData(data.data);
    if (data.error) setError(data.error);
  };

  return [{ isPending, isSuccess, data, error }, setRequestState];
}

class ServiceRequestError extends Error {
  res: Response;
  constructor(res: Response) {
    super(`Request has failed with status: ${res.status}`);
    this.res = res;
  }
}

class ServiceCallbackError extends Error {
  exc: Error;
  constructor(exc: Error) {
    super(`Request callback has failed with error: ${exc.name}`);
    this.exc = exc;
  }
}

type Service = {
  /**
   * Service URL.
   */
  url: string;
  /**
   * The HTTP method.
   */
  method?: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT";
  /**
   * Request's credentials mode.
   */
  credentials?: "include" | "omit" | "same-origin";
  /**
   * Object containing header values.
   */
  headers?: { [k: string]: string };
  /**
   * A boolean indicating request's keepalive value.
   */
  keepalive?: boolean;
  /**
   * Request's CORS mode.
   */
  mode?: "cors" | "navigate" | "no-cors" | "same-origin";
  /**
   * Request's redirection mode.
   */
  redirect?: "error" | "follow" | "manual";
};

type RequestState<T, U> = {
  /**
   * A boolean indicating whether the request is still pending.
   */
  isPending: boolean;
  /**
   * A boolean indicating whether the request was successfull.
   */
  isSuccess: boolean;
  /**
   * The JSON error contained in the response.
   */
  error?: U;
  /**
   * The JSON object contained in the response.
   */
  data?: T;
};
