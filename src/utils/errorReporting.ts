type ErrorInfo = {
  componentStack?: string | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getErrorStack(error: unknown) {
  return error instanceof Error ? error.stack : undefined;
}

export function reportAppError(error: unknown, errorInfo?: ErrorInfo) {
  console.error("Unhandled app error.", error, errorInfo);

  const endpoint = process.env.EXPO_PUBLIC_ERROR_REPORT_ENDPOINT;

  if (!endpoint || typeof fetch !== "function") {
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      componentStack: errorInfo?.componentStack,
      message: getErrorMessage(error),
      stack: getErrorStack(error),
      timestamp: new Date().toISOString(),
    }),
  }).catch((reportError) => {
    console.warn("Failed to report app error.", reportError);
  });
}
