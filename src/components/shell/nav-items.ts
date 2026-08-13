import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Gauge,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Palette,
  Radar,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users,
  Video,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Marks a Phase 2+ feature that has a real page but no live functionality yet. */
  comingSoon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Product Radar", href: "/radar", icon: Radar },
  { label: "Winning Products", href: "/winners", icon: Sparkles },
  { label: "Trends", href: "/trends", icon: LineChart, comingSoon: true },
  { label: "Ad Intelligence", href: "/ads", icon: Megaphone, comingSoon: true },
  { label: "Suppliers", href: "/suppliers", icon: Truck, comingSoon: true },
  { label: "Competitors", href: "/competitors", icon: Users, comingSoon: true },
  { label: "Creative Studio", href: "/creative-studio", icon: Video, comingSoon: true },
  { label: "Brand Builder", href: "/brand-builder", icon: Palette },
  { label: "Store Builder", href: "/store-builder", icon: Store, comingSoon: true },
  { label: "Analytics", href: "/analytics", icon: Gauge, comingSoon: true },
  { label: "Watchlist", href: "/watchlist", icon: ShoppingBag },
  { label: "AI Agent", href: "/agent", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];
