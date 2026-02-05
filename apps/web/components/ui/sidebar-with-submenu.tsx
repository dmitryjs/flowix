"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type MenuItem = { name: string; href?: string; icon?: JSX.Element };
type SidebarSection = "flows" | "projects" | "profile" | "settings";

type SidebarProps = {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
};

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const navigation: MenuItem[] = [
    {
      href: "/",
      name: "Flows",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
          />
        </svg>
      ),
    },
    {
      name: "Projects",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7.5A2.25 2.25 0 015.25 5.25h4.69c.597 0 1.17.237 1.592.659l.809.809h6.409A2.25 2.25 0 0121 8.968v8.782A2.25 2.25 0 0118.75 20H5.25A2.25 2.25 0 013 17.75V7.5z"
          />
        </svg>
      ),
    },
    {
      name: "Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
          />
        </svg>
      ),
    },
    {
      name: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const profileRef = useRef<HTMLButtonElement | null>(null);
  const [isProfileActive, setIsProfileActive] = useState(false);

  useEffect(() => {
    const handleProfile = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileActive(false);
      }
    };
    document.addEventListener("click", handleProfile);
    return () => document.removeEventListener("click", handleProfile);
  }, []);

  return (
    <nav className="flex h-full w-full flex-col gap-6 bg-card px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
          FX
        </div>
        <div className="flex-1">
          <span className="block text-sm font-semibold text-foreground">Flowix</span>
          <span className="block text-xs text-muted-foreground">Default workspace</span>
        </div>
        <div className="relative">
          <button
            ref={profileRef}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted"
            onClick={() => setIsProfileActive((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={isProfileActive}
            aria-controls="profile-menu"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isProfileActive && (
            <div
              id="profile-menu"
              role="menu"
              className="absolute right-0 top-10 w-56 rounded-lg border border-border bg-card p-2 text-sm text-muted-foreground shadow-lg"
            >
              <span className="block px-2 py-2 text-xs text-muted-foreground">
                Workspace
              </span>
              <button
                className="block w-full rounded-md px-2 py-2 text-left text-sm text-foreground transition hover:bg-muted"
                type="button"
              >
                Switch workspace
              </button>
              <button
                className="block w-full rounded-md px-2 py-2 text-left text-sm text-foreground transition hover:bg-muted"
                type="button"
              >
                Create workspace
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = activeSection === item.name.toLowerCase();
          if (item.href) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onSectionChange("flows")}
                className={`flex items-center gap-x-2 rounded-lg px-2 py-2 text-sm transition ${
                  isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="text-muted-foreground">{item.icon}</div>
                {item.name}
              </Link>
            );
          }

          const sectionName = item.name.toLowerCase() as SidebarSection;
          return (
            <button
              key={item.name}
              className={`flex w-full items-center gap-x-2 rounded-lg px-2 py-2 text-sm transition ${
                isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
              type="button"
              onClick={() => onSectionChange(sectionName)}
            >
              <div className="text-muted-foreground">{item.icon}</div>
              {item.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;
