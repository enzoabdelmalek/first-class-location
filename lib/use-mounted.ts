import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * `false` au rendu serveur et à l'hydratation, `true` ensuite.
 * Sert aux valeurs qui dépendent du navigateur (date locale, localStorage)
 * sans provoquer d'écart d'hydratation ni de setState dans un effet.
 */
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
