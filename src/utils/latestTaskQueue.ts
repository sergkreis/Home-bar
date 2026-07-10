export type LatestTaskQueue<T> = {
  clear: () => void;
  dispose: () => void;
  enqueue: (value: T) => void;
};

type LatestTaskQueueOptions<T> = {
  onBusyChange?: (isBusy: boolean) => void;
  onError?: (error: unknown) => void;
  worker: (value: T) => Promise<void>;
};

export function createLatestTaskQueue<T>({
  onBusyChange,
  onError,
  worker,
}: LatestTaskQueueOptions<T>): LatestTaskQueue<T> {
  let isDisposed = false;
  let isRunning = false;
  let hasPendingValue = false;
  let pendingValue: T;

  const queue: LatestTaskQueue<T> = {
    clear() {
      hasPendingValue = false;
    },
    dispose() {
      isDisposed = true;
      hasPendingValue = false;
    },
    enqueue(value) {
      if (isDisposed) {
        return;
      }

      pendingValue = value;
      hasPendingValue = true;
      void drain();
    },
  };

  async function drain() {
    if (isDisposed || isRunning) {
      return;
    }

    isRunning = true;
    onBusyChange?.(true);

    try {
      while (!isDisposed && hasPendingValue) {
        const value = pendingValue;
        hasPendingValue = false;
        await worker(value);
      }
    } catch (error) {
      hasPendingValue = false;
      onError?.(error);
    } finally {
      isRunning = false;
      if (!isDisposed) {
        onBusyChange?.(false);
      }
    }
  }

  return queue;
}
