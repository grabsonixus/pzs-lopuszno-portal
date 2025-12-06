import { PocketBaseRecord } from "./lib/types";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  thumbnail?: string;
}

export interface NavItem extends PocketBaseRecord {
  order: number;
  name: string;
  href: string;
  is_highlight: boolean;
  is_external: boolean;
  has_dropdown: boolean;
  parent_id?: string;
  icon_name?: string;
}
