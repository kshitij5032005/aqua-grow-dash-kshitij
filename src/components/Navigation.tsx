import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Leaf } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    ...(user ? [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/alerts", label: "Alerts" },
      { path: "/analytics", label: "Analytics" },
      { path: "/forms", label: "Forms" },
      { path: "/contact", label: "Contact" },
      ...(userRole === "Admin" ? [{ path: "/admin", label: "Admin" }] : []),
    ] : [
      { path: "/contact", label: "Contact" },
    ])
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">Smart Fertigation</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={location.pathname === link.path ? "default" : "ghost"}
                  className="transition-colors"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {user ? (
              <Button onClick={signOut} variant="outline" className="ml-2">
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button className="ml-2">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === link.path ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {user ? (
              <Button onClick={signOut} variant="outline" className="w-full">
                Logout
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
