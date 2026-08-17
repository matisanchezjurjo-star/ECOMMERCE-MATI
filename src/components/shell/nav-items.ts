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
  { label: "Panel", href: "/", icon: LayoutDashboard },
  { label: "Radar de Productos", href: "/radar", icon: Radar },
  { label: "Productos Ganadores", href: "/winners", icon: Sparkles },
  { label: "Tendencias", href: "/trends", icon: LineChart, comingSoon: true },
  { label: "Inteligencia de Anuncios", href: "/ads", icon: Megaphone, comingSoon: true },
  { label: "Proveedores", href: "/suppliers", icon: Truck, comingSoon: true },
  { label: "Competidores", href: "/competitors", icon: Users, comingSoon: true },
  { label: "Estudio Creativo", href: "/creative-studio", icon: Video },
  { label: "Constructor de Marca", href: "/brand-builder", icon: Palette },
  { label: "Constructor de Tienda", href: "/store-builder", icon: Store, comingSoon: true },
  { label: "Analítica", href: "/analytics", icon: Gauge, comingSoon: true },
  { label: "Lista de Seguimiento", href: "/watchlist", icon: ShoppingBag },
  { label: "Agente IA", href: "/agent", icon: Bot },
  { label: "Configuración", href: "/settings", icon: Settings },
];
