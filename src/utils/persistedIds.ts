export function uniqueKnownIds(values: unknown[], knownIds: ReadonlySet<string>): string[] {
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && knownIds.has(value)),
    ),
  );
}

export function getScopedStorageKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}:user:${userId}` : baseKey;
}

export function resolveAuthoritativeRemoteIds(
  values: unknown[] | null | undefined,
  knownIds: ReadonlySet<string>,
): string[] {
  if (!values || values.length === 0) {
    return [];
  }

  return uniqueKnownIds(values, knownIds);
}
