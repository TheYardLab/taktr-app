// components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  Calendar,
  Settings,
} from "lucide-react";

type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const links: SidebarLink[] = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Metrics", href: "/metrics", icon: <BarChart2 size={18} /> },
  { name: "Takt Plan", href: "/takt", icon: <Calendar size={18} /> },
  { name: "Reports", href: "/reports", icon: <FileText size={18} /> },
  { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <motion.aside
      initial={{ x: -220 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 70 }}
      className="w-56 bg-gray-900 text-gray-100 flex flex-col h-screen p-4 space-y-6 shadow-lg"
    >
      {/* Logo / Title */}
      <div className="text-2xl font-bold tracking-wide text-blue-400">
        Taktr
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = router.pathname === link.href;
          return (
            <Link key={link.name} href={link.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="text-xs text-gray-500 border-t border-gray-800 pt-2">
        © {new Date().getFullYear()} Taktr
      </div>
    </motion.aside>
  );
};

export default Sidebar;