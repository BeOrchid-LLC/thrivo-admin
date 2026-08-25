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
  Megaphone,
  ShieldAlert,
  UserCog,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When true, item is only shown to admins that pass `canManageAdmins`. */
  superAdminOnly?: boolean;
  /** When true, item is only shown to admin or super-admin roles. */
  adminOnly?: boolean;
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
      { label: "Account erasures", href: "/account-erasures", icon: Trash2 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Foods", href: "/foods", icon: Apple },
      { label: "Moderation", href: "/moderation", icon: ShieldAlert },
    ],
  },
  {
    label: "Messaging",
    items: [{ label: "Push campaigns", href: "/push", icon: Megaphone }],
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
  {
    label: "Administration",
    items: [
      { label: "Settings", href: "/settings", icon: Settings, adminOnly: true },
      {
        label: "Admins",
        href: "/admins",
        icon: UserCog,
        superAdminOnly: true,
      },
    ],
  },
];

/** Flat list for tests or legacy imports. */
export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);
