import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Lightbulb,
  Mail,
  ShieldCheck,
  UserPlus,
  Apple,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Grouped sidebar navigation — mirrors ADMIN_ARCHITECTURE page tree. */
export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Users & billing",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
      { label: "Billing events", href: "/billing", icon: Receipt },
    ],
  },
  {
    label: "Catalog",
    items: [{ label: "Foods", href: "/foods", icon: Apple }],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Content", href: "/content", icon: Lightbulb },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Leads", href: "/leads", icon: UserPlus },
      { label: "Emails", href: "/emails", icon: Mail },
      { label: "Audit log", href: "/audit", icon: ShieldCheck },
    ],
  },
];

/** Flat list for tests or legacy imports. */
export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);
