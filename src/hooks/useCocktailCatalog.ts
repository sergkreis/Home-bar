import { useCallback, useEffect, useState } from "react";

import { cocktails as staticCocktails } from "../data/cocktails";
import { Cocktail } from "../data/types";
import {
  CocktailCatalogSource,
  loadRemoteCocktailCatalog,
} from "../services/cocktailCatalogService";

type UseCocktailCatalogResult = {
  catalogCocktails: Cocktail[];
  catalogError: string | null;
  catalogSource: CocktailCatalogSource;
  hasLoadedCatalog: boolean;
  isLoadingCatalog: boolean;
  reloadCatalog: () => Promise<void>;
};

export function useCocktailCatalog(
  userId?: string,
  isAuthReady = true,
): UseCocktailCatalogResult {
  const [catalogCocktails, setCatalogCocktails] = useState<Cocktail[]>(staticCocktails);
  const [catalogSource, setCatalogSource] = useState<CocktailCatalogSource>("static");
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const reloadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    setCatalogError(null);

    try {
      const remoteCatalog = await loadRemoteCocktailCatalog();

      if (remoteCatalog) {
        setCatalogCocktails(remoteCatalog.cocktails);
        setCatalogSource(remoteCatalog.source);
      } else {
        setCatalogCocktails(staticCocktails);
        setCatalogSource("static");
      }
    } catch (error) {
      console.warn("Failed to load remote cocktail catalog.", error);
      setCatalogCocktails(staticCocktails);
      setCatalogSource("static");
      setCatalogError("Не удалось загрузить облачную базу коктейлей. Используем локальную копию.");
    } finally {
      setHasLoadedCatalog(true);
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    reloadCatalog();
  }, [isAuthReady, reloadCatalog, userId]);

  return {
    catalogCocktails,
    catalogError,
    catalogSource,
    hasLoadedCatalog,
    isLoadingCatalog,
    reloadCatalog,
  };
}
