import { pb } from "../services/pocketbase";

/**
 * Generates a URL-friendly slug from a string.
 */
export const generateBaseSlug = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Ensures the slug is unique within a specific PocketBase collection.
 * If the slug exists, it appends a date suffix or a numeric counter.
 * 
 * @param collection The PocketBase collection name.
 * @param baseSlug The desired slug.
 * @param currentId The ID of the current record (to exclude it from the check).
 * @param dateSuffix Optional date string (from 'datetime-local' input usually) to use as a suffix.
 */
export const ensureUniqueSlug = async (
  collection: string,
  baseSlug: string,
  currentId?: string,
  dateSuffix?: string
): Promise<string> => {
  let slug = baseSlug;
  let counter = 0;

  // 1. Sprawdź czy bazowy slug jest wolny
  let exists = await checkSlugExists(collection, slug, currentId);
  if (!exists) return slug;

  // 2. Jeśli zajęty i mamy datę, spróbuj z datą
  if (dateSuffix) {
    const datePart = dateSuffix.split('T')[0]; // Format YYYY-MM-DD
    if (datePart) {
      const slugWithDate = `${baseSlug}-${datePart}`;
      exists = await checkSlugExists(collection, slugWithDate, currentId);
      if (!exists) return slugWithDate;
      // Jeśli slug z datą też zajęty, używamy go jako bazy do dopisywania cyfr
      slug = slugWithDate;
    }
  }

  // 3. Dopisz licznik aż znajdziesz wolny slug
  let finalSlug = slug;
  exists = true;
  while (exists) {
    counter++;
    finalSlug = `${slug}-${counter}`;
    exists = await checkSlugExists(collection, finalSlug, currentId);
    if (!exists) return finalSlug;
    if (counter > 50) break; // Bezpiecznik
  }

  return finalSlug;
};

/**
 * Internal helper to check if a slug exists in a collection.
 */
const checkSlugExists = async (
  collection: string,
  slug: string,
  currentId?: string
): Promise<boolean> => {
  try {
    const filter = currentId 
      ? `slug = "${slug}" && id != "${currentId}"`
      : `slug = "${slug}"`;
    
    // Używamy getList zamiast getFirstListItem, aby uniknąć błędów 404 w konsoli
    const result = await pb.collection(collection).getList(1, 1, {
      filter: filter,
      requestKey: null, // Wyłączamy automatyczne anulowanie prośby
    });
    
    return result.totalItems > 0;
  } catch (err) {
    console.error(`Błąd podczas sprawdzania unikalności sluga w ${collection}:`, err);
    return false;
  }
};
