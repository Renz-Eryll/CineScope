import { useEffect, useState } from "react";

/**
 * Runs an async function whenever `deps` change, aborting the previous request
 * so a slow, stale response can never overwrite a newer one.
 */
const useAsync = (asyncFn, deps, { enabled = true } = {}) => {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: enabled,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, isLoading: false });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, error: null, isLoading: true }));

    asyncFn({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === "AbortError") return;
        console.error(error);
        setState({ data: null, error, isLoading: false });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return state;
};

export default useAsync;
