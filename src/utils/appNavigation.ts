import { AppTab } from "../components/BottomNav";

export type AppRoute = {
  cocktailId: string | null;
  tab: AppTab;
};

export type AppHistoryState = {
  domashniyBar: true;
  fromTab?: AppTab;
};

const tabPaths: Record<AppTab, string> = {
  account: "/account",
  admin: "/admin",
  bar: "/bar",
  buy: "/buy",
  favorites: "/favorites",
  recipes: "/recipes",
  today: "/today",
};

const tabsByPath = new Map(
  Object.entries(tabPaths).map(([tab, path]) => [path, tab as AppTab]),
);

export function buildCocktailPath(cocktailId: string) {
  return `/cocktails/${encodeURIComponent(cocktailId)}`;
}

export function buildTabPath(tab: AppTab) {
  return tabPaths[tab];
}

export function parseAppPath(pathname: string): AppRoute {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const tab = tabsByPath.get(normalizedPath);

  if (tab) {
    return { cocktailId: null, tab };
  }

  const cocktailMatch = normalizedPath.match(/^\/cocktails\/([^/]+)$/);
  if (cocktailMatch) {
    try {
      return {
        cocktailId: decodeURIComponent(cocktailMatch[1]),
        tab: "today",
      };
    } catch {
      return { cocktailId: null, tab: "today" };
    }
  }

  return { cocktailId: null, tab: "today" };
}

export function readCurrentAppRoute(): AppRoute {
  if (typeof window === "undefined") {
    return { cocktailId: null, tab: "today" };
  }

  const route = parseAppPath(window.location.pathname);
  const historyState = window.history.state as AppHistoryState | null;

  if (route.cocktailId && historyState?.domashniyBar && historyState.fromTab) {
    return { ...route, tab: historyState.fromTab };
  }

  return route;
}

export function writeAppRoute(
  path: string,
  mode: "push" | "replace",
  state: AppHistoryState = { domashniyBar: true },
) {
  if (typeof window === "undefined") {
    return;
  }

  if (mode === "replace") {
    window.history.replaceState(state, "", path);
    return;
  }

  window.history.pushState(state, "", path);
}
