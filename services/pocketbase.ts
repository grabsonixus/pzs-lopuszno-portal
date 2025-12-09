import { NavItem } from "@/types";
import PocketBase from "pocketbase";

// Unified URL to match the types definition and ensure connection
const POCKETBASE_URL =
  process.env.PUBLIC_POCKETBASE_URL || "https://api.zsp5lopuszno.pl/";

export const pb = new PocketBase(POCKETBASE_URL);

// Helper to check connection status
export const checkHealth = async (): Promise<boolean> => {
  try {
    const result = await pb.health.check();
    return result.code === 200;
  } catch (error) {
    console.warn("PocketBase health check failed:", error);
    return false;
  }
};

export const getNavigationItems = async (): Promise<NavItem[]> => {
  try {
    const records = await pb.collection("navigation_items").getFullList({
      sort: "order",
    });
    return records as NavItem[];
  } catch (error) {
    console.error("Failed to fetch navigation items:", error);
    return [];
  }
};
