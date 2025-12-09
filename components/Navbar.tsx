import React, { useState, useEffect, useContext } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { NavItem } from "../types";
import { AdminEditContext } from "../lib/AdminEditContext"; // Importuj AdminEditContext
import favicon from "../assets/favicon.png";
interface NavLink extends NavItem {
  dropdown?: NavLink[];
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const { navigationItemsUpdated, setNavigationItemsUpdated } =
    useContext(AdminEditContext);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNavLinks = async () => {
      try {
        const records = await pb
          .collection("navigation_items")
          .getFullList<NavItem>({
            sort: "order",
            signal: controller.signal,
            requestKey: null,
          });

        console.debug("Navbar: fetched navigation records:", records);

        const items: Record<string, NavLink> = {};
        records.forEach((item) => {
          items[item.id] = { ...item, dropdown: [] };
        });

        const nestedNavLinks: NavLink[] = [];
        records.forEach((item) => {
          const navLink = items[item.id];
          if (item.parent_id && items[item.parent_id]) {
            const parent = items[item.parent_id];
            if (parent) {
              parent.dropdown = parent.dropdown || [];
              parent.dropdown.push(navLink);
            }
          } else {
            nestedNavLinks.push(navLink);
          }
        });
        console.debug("Navbar: nested nav links:", nestedNavLinks);
        if (!controller.signal.aborted) {
          setNavLinks(nestedNavLinks);
          if (navigationItemsUpdated) {
            setNavigationItemsUpdated(false); // Reset the flag after fetching
          }
        }
      } catch (error: any) {
        const isAbort =
          error?.isAbort ||
          error?.name === "AbortError" ||
          /autocancelled/i.test(String(error?.message || ""));

        if (!isAbort) {
          console.error("Failed to fetch navigation:", error);
        }
      }
    };

    fetchNavLinks();

    return () => {
      controller.abort();
    };
  }, [navigationItemsUpdated]); // Add navigationItemsUpdated to dependency array

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-school-primary rounded-full flex items-center justify-center text-white shrink-0 group-hover:bg-blue-800 transition-colors">
              <img src={favicon} alt="Budynek szkoły" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-serif font-bold text-lg text-school-primary leading-tight">
                Powiatowy Zespół Szkół
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                w Łopusznie
              </p>
            </div>
            <div className="md:hidden">
              <span className="font-serif font-bold text-lg text-school-primary">
                PZS Łopuszno
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => {
              if (link.is_highlight) {
                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className="bg-school-accent text-school-primary px-6 py-2.5 rounded-md font-bold hover:bg-yellow-400 transition-colors shadow-sm ml-4 inline-block"
                  >
                    {link.name}
                  </Link>
                );
              }

              if (
                link.has_dropdown &&
                link.dropdown &&
                link.dropdown.length > 0
              ) {
                return (
                  <div key={link.id} className="relative group">
                    <button className="flex items-center gap-1 text-gray-700 hover:text-school-primary font-medium py-2 px-4 transition-colors">
                      {link.name} <ChevronDown size={14} />
                    </button>
                    <div className="absolute top-full left-0 w-56 bg-white border border-gray-100 shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top pt-2 z-10">
                      {link.dropdown.map((item) =>
                        item.is_external ? (
                          <a
                            key={item.id}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3 text-sm text-gray-600 hover:bg-neutral-bg hover:text-school-primary"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <Link
                            key={item.id}
                            to={item.href}
                            className="block px-4 py-3 text-sm text-gray-600 hover:bg-neutral-bg hover:text-school-primary"
                          >
                            {item.name}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.id}
                  to={link.href}
                  className="text-gray-700 hover:text-school-primary font-medium py-2 px-4 transition-colors"
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-school-primary p-2"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col p-4">
            {navLinks.map((link) => {
              if (link.is_highlight) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block w-full my-2 bg-school-accent text-school-primary px-6 py-3 rounded-md font-bold text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              }
              if (
                link.has_dropdown &&
                link.dropdown &&
                link.dropdown.length > 0
              ) {
                return (
                  <div key={link.name} className="border-b border-gray-50">
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className="flex justify-between items-center w-full text-left py-3 text-gray-700 font-medium"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform ${
                          activeDropdown === link.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === link.name && (
                      <div className="bg-neutral-bg pl-4 py-2">
                        {link.dropdown.map((item) => (
                          <React.Fragment key={item.name}>
                            {item.is_external ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block py-2 text-sm text-gray-600"
                                onClick={() => setIsOpen(false)}
                              >
                                {item.name}
                              </a>
                            ) : (
                              <Link
                                to={item.href}
                                className="block py-2 text-sm text-gray-600"
                                onClick={() => setIsOpen(false)}
                              >
                                {item.name}
                              </Link>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block py-3 text-gray-700 font-medium border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
