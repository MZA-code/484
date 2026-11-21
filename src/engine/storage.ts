/**
 * Stockage local tolérant aux pannes. Tout accès est protégé : si `localStorage` est absent,
 * plein ou interdit (navigation privée, cookies bloqués…), le jeu continue en mémoire.
 */

/** Le sous-ensemble de `Storage` dont on a besoin. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/**
 * Renvoie le stockage du navigateur s'il fonctionne vraiment (test d'écriture),
 * sinon un stockage en mémoire. Ne lève jamais d'exception.
 */
export function resolveStorage(getStorage: () => KeyValueStorage | undefined): KeyValueStorage {
  try {
    const storage = getStorage();
    if (storage) {
      const probe = '484:probe';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return storage;
    }
  } catch {
    // Navigation privée, cookies bloqués, quota dépassé… on passe en mémoire.
  }
  return createMemoryStorage();
}

/** Lit et décode une valeur JSON ; null si absente, illisible ou si le stockage refuse. */
export function readJson(storage: KeyValueStorage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Enregistre une valeur en JSON. Renvoie false si le stockage a refusé (quota, accès interdit…). */
export function writeJson(storage: KeyValueStorage, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Supprime une clé sans jamais lever d'exception. */
export function removeKey(storage: KeyValueStorage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Rien à faire : la clé restera, sans conséquence.
  }
}
