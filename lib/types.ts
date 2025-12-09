export interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export type MajorType = "Technikum" | "Branżowa" | "LO" | "Dorośli";

export interface Major extends PocketBaseRecord {
  name: string;
  description: string;
  type: MajorType;
  icon: string;
}

export type StaffCategory = "Dyrekcja" | "Nauczyciele" | "Wsparcie";

export interface Staff extends PocketBaseRecord {
  name: string;
  role: string;
  category: StaffCategory;
  email: string;
  consultation_hours: string;
  photo: string;
}

export interface SchoolDocument extends PocketBaseRecord {
  title: string;
  file: string;
  category: string;
}

export interface Post extends PocketBaseRecord {
  title: string;
  slug: string;
  content: string; // HTML content
  excerpt: string;
  cover_image: string;
  gallery: string[];
  category: string;
  published: boolean;
  date: string; // ISO date string
}

export interface Subpage extends PocketBaseRecord {
  title: string;
  slug: string;
  content: string; // HTML content
}

export function getImageUrl(
  collectionId: string,
  recordId: string,
  filename: string
): string {
  const baseUrl =
    process.env.PUBLIC_POCKETBASE_URL || "https://api.zsp5lopuszno.pl/";
  if (!filename) return "";
  return `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
}
