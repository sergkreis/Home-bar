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

// React Native defines a global `window` that has no `location`/`history`,
// so presence of `window` alone is not enough to treat this as the web build.
function getBrowserHistoryApis() {
  if (typeof window === "undefined") {
    return null;
  }

  const { history, location } = window;

  if (typeof location?.pathname !== "string" || typeof history?.pushState !== "function") {
    return null;
  }

  return { history, location };
}

export function readCurrentAppRoute(): AppRoute {
  const browser = getBrowserHistoryApis();

  if (!browser) {
    return { cocktailId: null, tab: "today" };
  }

  const route = parseAppPath(browser.location.pathname);
  const historyState = browser.history.state as AppHistoryState | null;

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
  const browser = getBrowserHistoryApis();

  if (!browser) {
    return;
  }

  if (mode === "replace") {
    browser.history.replaceState(state, "", path);
    return;
  }

  browser.history.pushState(state, "", path);
}
