import { useState, useEffect, useCallback } from "react";

interface Material {
  id: string;
  unNumber: string;
  materialName: string;
  hazardClass: string;
  subsidiaryClass?: string;
  packingGroup: string;
  weight: string;
  quantity: number;
  containerType: "bulk" | "non-bulk";
  stopNumber: number;
  poisonInhalationHazard: boolean;
  isOrganicPeroxideTypeB?: boolean;
  isRadioactiveYellowIII?: boolean;
  isResidue?: boolean;
}

const DB_NAME = "hazmat-placard-pro";
const DB_VERSION = 1;
const STORE_NAME = "materials";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadMaterials(): Promise<Material[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function saveMaterials(materials: Material[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const m of materials) {
      store.put(m);
    }
  } catch (e) {
    console.error("Failed to save materials to IndexedDB:", e);
  }
}

/**
 * Hook that persists the material list to IndexedDB.
 * Survives browser crashes, tab closes, and works offline.
 */
export function usePersistedMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    loadMaterials().then((saved) => {
      if (saved.length > 0) {
        setMaterials(saved);
      }
      setLoaded(true);
    });
  }, []);

  // Save to IndexedDB whenever materials change (after initial load)
  useEffect(() => {
    if (loaded) {
      saveMaterials(materials);
    }
  }, [materials, loaded]);

  const addMaterial = useCallback((material: Omit<Material, "id">) => {
    const newMaterial: Material = {
      ...material,
      id: crypto.randomUUID(),
    };
    setMaterials((prev) => [...prev, newMaterial]);
    return newMaterial;
  }, []);

  const addMaterials = useCallback((newMaterials: Omit<Material, "id">[]) => {
    const withIds: Material[] = newMaterials.map((m) => ({
      ...m,
      id: crypto.randomUUID(),
    }));
    setMaterials((prev) => [...prev, ...withIds]);
    return withIds;
  }, []);

  const updateMaterial = useCallback((updated: Material) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  }, []);

  const removeMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMaterials([]);
  }, []);

  return {
    materials,
    loaded,
    addMaterial,
    addMaterials,
    updateMaterial,
    removeMaterial,
    clearAll,
  };
}
