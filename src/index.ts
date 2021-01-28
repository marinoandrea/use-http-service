import React from "react";

/**
 * React hook that wraps a fetch request to a JSON based HTTP service.
 * @param service Service descriptor object. Resembles Fetch API's RequestInit but should not contain a body.
 * @typedef T The request body type
 * @typedef U The response body type expected on success
 * @typedef V The response body type expected on error
 * @returns Array containing an object that tracks the request state [0] and the function that wraps the fetch call [1]
 * @throws FetchError if response is not valid JSON
 */
export default function useHttpService<T, U, V>(
  service: Service
): [RequestState<U, V>, (requestBody?: T) => Promise<Result<U, V>>] {
  const [requestState, setRequestState] = useRequestState<U, V>();

  const callService = async (requestBody?: T) => {
    const { url, ...serviceInfo } = service;

    const res = await fetch(url, {
      ...serviceInfo,
      headers: {
        ...serviceInfo.headers,
        Accept: "application/json",
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    let out: Result<U, V>;
    try {
      out = {
        isOk: true,
        data: await handleResponse(res),
      };
    } catch (e) {
      out = {
        isOk: false,
        error: await handleError(e),
      };
    } finally {
      cleanup();
    }

    return out;
  };

  return [requestState, callService];

  async function handleResponse(res: Response): Promise<U> {
    if (!res.ok) throw new ServiceRequestError(res);

    const data: U = await res.json();

    setRequestState({
      ...requestState,
      isPending: false,
      isSuccess: true,
      data,
    });

    return data;
  }

  async function handleError(err: Error): Promise<V> {
    if (err instanceof ServiceRequestError) {
      const data: V = await err.res.json();

      setRequestState({
        ...requestState,
        isPending: false,
        isSuccess: false,
        error: data,
      });

      return data;
    }

    throw err;
  }

  function cleanup(): void {
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

  const setRequestState = (newState: RequestState<T, U>) => {
    if (newState.isPending !== isPending) setIsPending(newState.isPending);
    if (newState.isSuccess !== isSuccess) setIsSuccess(newState.isSuccess);
    if (newState.data !== data) setData(newState.data);
    if (newState.error !== error) setError(newState.error);
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

export type Service = {
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
  headers?: { [name: string]: string };
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

export type RequestState<T, U> = {
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

export type Result<T, E> = SuccessResult<T> | ErrorResult<E>;

export type SuccessResult<T> = {
  isOk: true;
  data: T;
};

export type ErrorResult<E> = {
  isOk: false;
  error: E;
};
