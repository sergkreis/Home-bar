import { describe, expect, it, vi } from "vitest";

import { createLatestTaskQueue } from "./latestTaskQueue";

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, reject, resolve };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("createLatestTaskQueue", () => {
  it("serializes saves and keeps only the latest pending value", async () => {
    const firstSave = deferred();
    const savedValues: string[] = [];
    const worker = vi.fn(async (value: string) => {
      savedValues.push(value);
      if (value === "first") {
        await firstSave.promise;
      }
    });
    const queue = createLatestTaskQueue({ worker });

    queue.enqueue("first");
    queue.enqueue("second");
    queue.enqueue("latest");

    expect(worker).toHaveBeenCalledTimes(1);
    expect(savedValues).toEqual(["first"]);

    firstSave.resolve();
    await flushPromises();

    expect(savedValues).toEqual(["first", "latest"]);
    expect(worker).toHaveBeenCalledTimes(2);
  });

  it("drops pending work after a conflict clears the queue", async () => {
    const firstSave = deferred();
    const savedValues: string[] = [];
    let queue = createLatestTaskQueue<string>({
      worker: async (value) => {
        savedValues.push(value);
        await firstSave.promise;
        queue.clear();
      },
    });

    queue.enqueue("conflicting");
    queue.enqueue("stale-pending");
    firstSave.resolve();
    await flushPromises();

    expect(savedValues).toEqual(["conflicting"]);
  });

  it("continues with a newer pending value after a failed save", async () => {
    const firstSave = deferred();
    const savedValues: string[] = [];
    const onError = vi.fn();
    const worker = vi.fn(async (value: string) => {
      savedValues.push(value);
      if (value === "first") {
        await firstSave.promise;
      }
    });
    const queue = createLatestTaskQueue({ onError, worker });

    queue.enqueue("first");
    queue.enqueue("latest");
    firstSave.reject(new Error("Network unavailable"));
    await flushPromises();

    expect(onError).toHaveBeenCalledOnce();
    expect(savedValues).toEqual(["first", "latest"]);
  });

  it("does not retry a failed value when nothing newer is pending", async () => {
    const onError = vi.fn();
    const worker = vi.fn().mockRejectedValue(new Error("Network unavailable"));
    const queue = createLatestTaskQueue({ onError, worker });

    queue.enqueue("only-value");
    await flushPromises();

    expect(worker).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledOnce();
  });
});
