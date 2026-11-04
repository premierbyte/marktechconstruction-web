import {
  BadgeCheck,
  Bell,
  Briefcase,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  HelpCircle,
  ImagePlus,
  Images,
  Inbox,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Newspaper,
  Quote,
  ScrollText,
  Settings,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions: string[];
  group: "Overview" | "Enquiries" | "Content" | "Library" | "System" | "Account";
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permissions: [], group: "Overview" },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: Inbox,
    permissions: ["enquiries.view_all", "enquiries.view_assigned"],
    group: "Enquiries",
  },
  { label: "Pages", href: "/admin/pages", icon: FileText, permissions: ["content.edit"], group: "Content" },
  { label: "Insights", href: "/admin/insights", icon: Newspaper, permissions: ["content.edit"], group: "Content" },
  { label: "Careers", href: "/admin/careers", icon: BriefcaseBusiness, permissions: ["content.edit"], group: "Content" },
  { label: "Slides", href: "/admin/slides", icon: Images, permissions: ["settings.manage"], group: "Content" },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, permissions: ["content.edit"], group: "Content" },
  { label: "Support", href: "/admin/support", icon: LifeBuoy, permissions: ["support.manage"], group: "Content" },
  { label: "Services", href: "/admin/services", icon: Briefcase, permissions: ["content.edit"], group: "Content" },
  { label: "Sectors", href: "/admin/sectors", icon: Layers, permissions: ["content.edit"], group: "Content" },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban, permissions: ["content.edit"], group: "Content" },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote, permissions: ["content.edit"], group: "Content" },
  { label: "Credentials", href: "/admin/credentials", icon: BadgeCheck, permissions: ["content.edit"], group: "Content" },
  { label: "Gallery", href: "/admin/gallery", icon: ImagePlus, permissions: ["media.manage"], group: "Library" },
  { label: "Media", href: "/admin/media", icon: Images, permissions: ["media.manage"], group: "Library" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, permissions: ["notifications.manage"], group: "System" },
  { label: "Settings", href: "/admin/settings", icon: Settings, permissions: ["settings.manage"], group: "System" },
  { label: "Users", href: "/admin/users", icon: Users, permissions: ["users.manage"], group: "System" },
  { label: "Audit", href: "/admin/audit", icon: ScrollText, permissions: ["audit.view"], group: "System" },
  { label: "Account", href: "/admin/account", icon: UserCircle, permissions: [], group: "Account" },
];

export const NAV_GROUPS: AdminNavItem["group"][] = ["Overview", "Enquiries", "Content", "Library", "System", "Account"];
