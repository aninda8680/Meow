"use client";

import Link from "next/link";
import { ArrowLeft, Target, Globe, MonitorSmartphone } from "lucide-react";
import { usePathname } from "next/navigation";

export function ReportSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/report", icon: Target },
    { name: "Tab Tracking", href: "/tab-report", icon: Globe },
    { name: "App Tracking", href: "/app-report", icon: MonitorSmartphone },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col gap-8 md:border-r border-foreground/10 p-6 md:min-h-screen">
      <Link href="/dashboard" className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase text-[10px] font-bold tracking-widest">Back to Hub</span>
      </Link>

      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 px-3">
            Analytics
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-foreground/10 text-foreground font-black' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5 font-semibold'}`}
            >
              <link.icon size={16} className={isActive ? 'text-foreground' : 'text-foreground/50'} />
              <span className="text-sm tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
