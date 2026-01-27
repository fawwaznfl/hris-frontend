import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSidebarMenu, othersMenu, NavItem } from "../data/sidebarMenu";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, HorizontaLDots } from "../icons";
import { useLayoutEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Ambil role user dan cast ke union type
  const roleFromStorage = localStorage.getItem("dashboard_type");
  const role: "admin" | "superadmin" = roleFromStorage === "superadmin" ? "superadmin" : "admin";

  const navItems = getSidebarMenu(role);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Set submenu terbuka sesuai route
    useEffect(() => {
      if (openSubmenu) {
        const key = `${openSubmenu.type}-${openSubmenu.index}`;
        const el = subMenuRefs.current[key];
        if (el) {
          setTimeout(() => {
            const height = el.scrollHeight;
            setSubMenuHeight((prev) => ({ ...prev, [key]: height }));
          }, 100); // beri delay kecil biar DOM ready
        }
      }
    }, [openSubmenu]);

  // Set tinggi submenu untuk animasi
    useLayoutEffect(() => {
      if (openSubmenu) {
        const key = `${openSubmenu.type}-${openSubmenu.index}`;
        const el = subMenuRefs.current[key];
        if (el) {
          console.log("Submenu element:", el, "scrollHeight:", el.scrollHeight);
          const height = el.scrollHeight;
          requestAnimationFrame(() => {
            setSubMenuHeight((prev) => ({ ...prev, [key]: height }));
          });
        }
      }
    }, [openSubmenu]);


    const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    console.log("Toggle submenu:", index, menuType);
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group cursor-pointer ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            <Link
              to={nav.path || "#"}
              className={`menu-item group ${
                isActive(nav.path || "#") ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span className={`menu-item-icon-size ${isActive(nav.path || "#") ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
            </Link>
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
          <div
            ref={(el) => {
              subMenuRefs.current[`${menuType}-${index}`] = el;
              return;
            }}
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{
              maxHeight:
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? `${subMenuHeight[`${menuType}-${index}`] || 500}px`
                  : "0px",
            }}
          >
            <ul className="mt-2 space-y-1 ml-9 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              {nav.subItems.map((subItem) => (
                <li key={subItem.name}>
                  <Link
                    to={subItem.path}
                    className={`menu-dropdown-item ${
                      isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                    }`}
                  >
                    {subItem.name}
                    {(subItem.new || subItem.pro) && (
                      <span
                        className={`ml-auto ${
                          isActive(subItem.path)
                            ? "menu-dropdown-badge-active"
                            : "menu-dropdown-badge-inactive"
                        }`}
                      >
                        {subItem.new ? "new" : "pro"}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo_baru.png" alt="Logo" width={250} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo_baru_dark.png" alt="Logo" width={250} height={40} />
            </>
          ) : (
            <img src="/images/logo/logo_icon.png" alt="Logo" width={65} height={65} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersMenu, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
