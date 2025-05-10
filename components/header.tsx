"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const { t, language, setLanguage } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const isAdminPage = pathname.startsWith("/admin")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/rooms", label: t("rooms") },
    { href: "/services", label: t("services") },
    { href: "/contacts", label: t("contacts") },
  ]

  const adminNavLinks = [
    { href: "/admin", label: t("dashboard", "admin") },
    { href: "/admin/rooms", label: t("rooms", "admin") },
    { href: "/admin/availability", label: t("availability", "admin") },
    { href: "/admin/bookings", label: t("bookings", "admin") },
    { href: "/admin/content", label: t("content", "admin") },
    { href: "/admin/settings", label: t("settings", "admin") },
  ]

  const links = isAdminPage ? adminNavLinks : navLinks

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled || isAdminPage ? "bg-white shadow-md dark:bg-gray-900" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Leonardo&apos;s Rooms</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!isAdminPage && (
              <Button asChild variant="default" size="sm">
                <Link href="/booking">{t("book_now")}</Link>
              </Button>
            )}

            {isAdminPage && (
              <Button asChild variant="outline" size="sm">
                <Link href="/api/auth/signout">{t("logout", "admin")}</Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("it")}>
                  <span className={language === "it" ? "font-bold" : ""}>Italiano</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  <span className={language === "en" ? "font-bold" : ""}>English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("it")}>
                  <span className={language === "it" ? "font-bold" : ""}>Italiano</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  <span className={language === "en" ? "font-bold" : ""}>English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-foreground/80"
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              {!isAdminPage && (
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/booking" onClick={closeMenu}>
                    {t("book_now")}
                  </Link>
                </Button>
              )}

              {isAdminPage && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/api/auth/signout" onClick={closeMenu}>
                    {t("logout", "admin")}
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
