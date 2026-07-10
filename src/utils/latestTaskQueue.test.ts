import { describe, expect, it, vi } from "vitest";

import { createLatestTaskQueue } from "./latestTaskQueue";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
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
});
