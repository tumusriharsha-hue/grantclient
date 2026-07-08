import type { LucideIcon } from "lucide-react";
import { Bookmark, FileText, LayoutDashboard, PenLine, Search } from "lucide-react";

export type NavItemId =
  | "dashboard"
  | "grants"
  | "saved"
  | "applications"
  | "drafting";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "grants", label: "Grant Finder", href: "/grants", icon: Search },
  { id: "saved", label: "Saved Grants", href: "/saved", icon: Bookmark },
  { id: "applications", label: "My Applications", href: "/applications", icon: FileText },
  { id: "drafting", label: "Drafting Lab", href: "/applications/builder", icon: PenLine },
];

export const orgName = "Urban Reach Initiative";
