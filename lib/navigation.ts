import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Lightbulb,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary sidebar navigation — mirrors the ADMIN_ARCHITECTURE §3 page tree. */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Content", href: "/content", icon: Lightbulb },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Audit log", href: "/audit", icon: ShieldCheck },
];
