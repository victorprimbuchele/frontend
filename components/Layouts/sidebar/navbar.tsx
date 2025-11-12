"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isOpen, toggleSidebar, isMobile } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        if (item.items && item.items.length > 0) {
          return item.items.some((subItem: { url: string; title: string }) => {
            if (subItem.url === pathname) {
              if (!expandedItems.includes(item.title)) {
                setExpandedItems((prev) => [...prev, item.title]);
              }
              return true;
            }
            return false;
          });
        }
        return false;
      });
    });
  }, [pathname, expandedItems]);

  // Only render navbar on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => toggleSidebar()}
          aria-hidden="true"
        />
      )}

      {/* Navbar Header */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-dark">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center rounded-lg p-2 text-dark-4 hover:bg-gray-100 dark:text-dark-6 dark:hover:bg-[#FFFFFF1A]"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <XIcon className="size-6" />
          ) : (
            <MenuIcon className="size-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-dark",
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="px-4 py-6">
          {NAV_DATA.map((section) => (
            <div key={section.label} className="mb-6">
              <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                {section.label}
              </h2>

              <nav role="navigation" aria-label={section.label}>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      {item.items && item.items.length > 0 ? (
                        <div>
                          <MenuItem
                            isActive={item.items.some(
                              (subItem: { url: string }) => subItem.url === pathname,
                            )}
                            onClick={() => toggleExpanded(item.title)}
                          >
                            <item.icon
                              className="size-6 shrink-0"
                              aria-hidden="true"
                            />

                            <span>{item.title}</span>

                            <ChevronUp
                              className={cn(
                                "ml-auto rotate-180 transition-transform duration-200",
                                expandedItems.includes(item.title) &&
                                  "rotate-0",
                              )}
                              aria-hidden="true"
                            />
                          </MenuItem>

                          {expandedItems.includes(item.title) && (
                            <ul
                              className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                              role="menu"
                            >
                              {item.items.map((subItem: { url: string; title: string }) => (
                                <li key={subItem.title} role="none">
                                  <MenuItem
                                    as="link"
                                    href={subItem.url}
                                    isActive={pathname === subItem.url}
                                  >
                                    <span>{subItem.title}</span>
                                  </MenuItem>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        (() => {
                          const href =
                            "url" in item
                              ? item.url + ""
                              : "/" +
                                item.title.toLowerCase().split(" ").join("-");

                          return (
                            <MenuItem
                              className="flex items-center gap-3 py-3"
                              as="link"
                              href={href}
                              isActive={pathname === href}
                            >
                              <item.icon
                                className="size-6 shrink-0"
                                aria-hidden="true"
                              />

                              <span>{item.title}</span>
                            </MenuItem>
                          );
                        })()
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

