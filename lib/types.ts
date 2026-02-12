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

export interface Category extends PocketBaseRecord {
  name: string;
  slug: string;
}

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

export interface Post {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  date?: string;
  published: boolean;
  gallery?: string[];
  files?: string[];
  category?: string;
}

export interface Subpage {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  title: string;
  slug: string;
  content: string;
  files?: string[];
}

export interface NavItem {
  id: string;
  name: string;
  href: string;
  order: number;
  parent_id?: string;
  is_highlight?: boolean;
  is_external?: boolean;
  has_dropdown?: boolean;
}

export interface HeroButton {
  label: string;
  link: string;
  icon: string;
  style: "primary" | "glass";
}

export interface QuickLinkItem {
  title: string;
  link: string;
  icon: string;
  color_type: "primary" | "secondary" | "custom"; // NOWE POLE
  color: string; // Używane tylko gdy color_type === 'custom'
}

export interface SectionBlock {
  id: string;
  type: "news" | "offer" | "projects" | "separator";
  visible: boolean;
}

export interface HomeSettings {
  id: string;
  collectionId: string;
  collectionName: string;
  hero_title: string;
  hero_subtitle: string;
  hero_bg: string;
  hero_overlay_opacity: number;
  hero_buttons: HeroButton[];
  quick_links: QuickLinkItem[];
  sections: SectionBlock[];
}

export interface SiteSettings {
  id: string;
  collectionId: string;
  collectionName: string;
  primary_color: string; // np. #1e3a8a
  accent_color: string; // np. #facc15
  header_font: string; // np. 'Merriweather'
  body_font: string; // np. 'Inter'
  logo: string; // plik
  favicon: string; // plik
  show_accessibility_widget: boolean;
  navbar_title: string;
  navbar_subtitle: string;
  navbar_title_mobile: string;
}

export type FooterBlockType = "contact" | "text" | "links" | "admin";

export interface FooterLink {
  label: string;
  url: string;
  icon?: string;
}

export interface FooterBlockData {
  // Dla typu 'text'
  content?: string;
  title?: string;

  // Dla typu 'contact'
  address?: string; // wieloliniowy
  phone?: string;
  email?: string;

  // Dla typu 'links'
  links?: FooterLink[];
}

export interface FooterBlock {
  id: string;
  type: FooterBlockType;
  title?: string;
  data: FooterBlockData;
}

export interface FooterColumn {
  id: string;
  blocks: FooterBlock[];
}

export interface FooterSettings {
  id: string;
  collectionId: string;
  collectionName: string;
  columns_count: number; // 1-5
  columns: FooterColumn[]; // JSON
}

export const getImageUrl = (
  collectionId: string,
  recordId: string,
  fileName: string,
  thumb?: string
) => {
  if (!fileName) return "";
  let url = `${
    process.env.PUBLIC_POCKETBASE_URL || "https://api.zsp5lopuszno.pl/"
  }api/files/${collectionId}/${recordId}/${fileName}`;
  if (thumb) {
    url += `?thumb=${thumb}`;
  }
  return url;
};

export const getFileUrl = getImageUrl;
