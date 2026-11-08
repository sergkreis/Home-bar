import type { DependencyList, SetStateAction } from "react";
type Effect = { deps?: DependencyList; cleanup?: () => void; setup: () => void | (() => void) };
let active: AccountIsolationHookHarness<unknown> | undefined;
/** Committed-render harness: stable slots, batching, dependency comparison,
 * all passive cleanups before setups, and captured render closures.
 * Not a React renderer: no concurrent/aborted renders, layout effects or UI. */
export class AccountIsolationHookHarness<T> {
  private slots: unknown[] = [];
  private index = 0;
  private effects = new Map<number, Effect>();
  private pending = new Map<number, Effect>();
  private dirty = true;
  private mounted = true;
  stateUpdatesAfterUnmount = 0;
  result!: T;
  constructor(private readonly hook: () => T) {}
  useState<S>(initial: S | (() => S)) {
    const index = this.index++;
    if (!(index in this.slots)) this.slots[index] = typeof initial === "function" ? (initial as () => S)() : initial;
    const set = (value: SetStateAction<S>) => {
      if (!this.mounted) { this.stateUpdatesAfterUnmount++; return; }
      const previous = this.slots[index] as S;
      const next = typeof value === "function" ? (value as (previous: S) => S)(previous) : value;
      if (!Object.is(previous, next)) { this.slots[index] = next; this.dirty = true; }
    };
    return [this.slots[index] as S, set] as const;
  }
  useRef<R>(initial: R) {
    const index = this.index++;
    if (!(index in this.slots)) this.slots[index] = { current: initial };
    return this.slots[index] as { current: R };
  }
  useMemo<R>(factory: () => R, deps: DependencyList) {
    const index = this.index++;
    const previous = this.slots[index] as { deps: DependencyList; value: R } | undefined;
    if (!previous || !sameDeps(previous.deps, deps)) this.slots[index] = { deps, value: factory() };
    return (this.slots[index] as { value: R }).value;
  }
  useEffect(setup: Effect["setup"], deps?: DependencyList) {
    const index = this.index++;
    const previous = this.effects.get(index);
    if (!previous || !sameDeps(previous.deps, deps)) this.pending.set(index, { setup, deps });
  }
  render() { this.dirty = true; this.flush(); }
  flush() {
    let iterations = 0;
    while (this.dirty && this.mounted) {
      if (++iterations > 100) throw new Error("Hook did not settle");
      this.dirty = false;
      this.index = 0;
      active = this as AccountIsolationHookHarness<unknown>;
      try { this.result = this.hook(); } finally { active = undefined; }
      const pending = this.pending;
      this.pending = new Map();
      for (const [index] of pending) this.effects.get(index)?.cleanup?.();
      for (const [index, effect] of pending) {
        const cleanup = effect.setup();
        this.effects.set(index, { ...effect, cleanup: cleanup || undefined });
      }
    }
  }
  async settle() { for (let i = 0; i < 16; i++) { await Promise.resolve(); this.flush(); } }
  unmount() {
    this.mounted = false;
    for (const effect of this.effects.values()) effect.cleanup?.();
    this.effects.clear();
  }
}
function sameDeps(a?: DependencyList, b?: DependencyList) {
  return !!a && !!b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
}
function current() {
  if (!active) throw new Error("Hook called outside isolation harness");
  return active;
}
export const accountIsolationReact = {
  useState: <S>(initial: S | (() => S)) => current().useState(initial),
  useRef: <T>(initial: T) => current().useRef(initial),
  useMemo: <T>(factory: () => T, deps: DependencyList) => current().useMemo(factory, deps),
  useCallback: <T>(callback: T, deps: DependencyList) => current().useMemo(() => callback, deps),
  useEffect: (setup: Effect["setup"], deps?: DependencyList) => current().useEffect(setup, deps),
};
export function accountIsolationDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
