// src/components/layout/Navbar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Users, MapPin, Briefcase, Baby, User, GraduationCap, Database, TrendingUp, Menu, X, LogIn } from "lucide-react"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const aboutUsItems = [
  {
    title: "Our Team",
    href: "/about/our-team",
    description: "Meet the dedicated people behind Masinyusane's mission.",
    icon: Users,
  },
  {
    title: "Where We Work",
    href: "/about/where-we-work",
    description: "Discover the communities we serve across South Africa.",
    icon: MapPin,
  },
  {
    title: "Jobs & Applications",
    href: "/about/apply",
    description: "Join our team and make a difference in education.",
    icon: Briefcase,
  },
]

const programsItems = [
  {
    title: "Early Childhood Education",
    href: "/children",
    description: "Data-driven literacy programmes for children aged 2-13.",
    icon: Baby,
  },
  {
    title: "Community Jobs",
    href: "/youth",
    description: "Creating local employment opportunities in education.",
    icon: User,
  },
  {
    title: "Scholarship Fund",
    href: "/top-learner",
    description: "Investing in future leaders through university scholarships.",
    icon: GraduationCap,
  },
]

const impactItems = [
  {
    title: "Data Portal",
    href: "/impact/data-portal",
    description: "Explore our real-time data and measurable impact.",
    icon: Database,
  },
  {
    title: "Impact Reports",
    href: "/impact/reports",
    description: "Read our annual reports and success stories.",
    icon: TrendingUp,
  },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-foreground">Masinyusane</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                {/* About Us Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      {aboutUsItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Programs Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Programs</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      {programsItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Impact Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Impact</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      {impactItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Desktop Auth Button */}
            <SignedOut>
              <Link
                href="/auth/sign-in"
                className="border border-foreground/20 text-foreground px-4 py-2 rounded-md hover:bg-accent transition font-medium flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Log In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Desktop Donate Button */}
            <Link
              href="/donate"
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-medium"
            >
              Donate
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Auth Button */}
            <SignedOut>
              <Link
                href="/auth/sign-in"
                className="border border-foreground/20 text-foreground px-3 py-2 rounded-md hover:bg-accent transition text-sm font-medium flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Log In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Mobile Donate Button */}
            <Link
              href="/donate"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-medium"
            >
              Donate
            </Link>

            {/* Mobile Menu Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-accent rounded-md">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-6">
                  {/* About Us Section */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-muted-foreground">About Us</h3>
                    <ul className="space-y-3">
                      {aboutUsItems.map((item) => (
                        <MobileMenuItem
                          key={item.title}
                          item={item}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Programs Section */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Programs</h3>
                    <ul className="space-y-3">
                      {programsItems.map((item) => (
                        <MobileMenuItem
                          key={item.title}
                          item={item}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Impact Section */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Impact</h3>
                    <ul className="space-y-3">
                      {impactItems.map((item) => (
                        <MobileMenuItem
                          key={item.title}
                          item={item}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Desktop List Item Component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { 
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
  }
>(({ className, title, children, href, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href ?? "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

// Mobile Menu Item Component
function MobileMenuItem({ 
  item, 
  onClick 
}: { 
  item: { 
    title: string; 
    href: string; 
    description: string; 
    icon: React.ComponentType<{ className?: string }>;
  };
  onClick: () => void;
}) {
  const Icon = item.icon
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className="flex items-start gap-3 p-2 rounded-md hover:bg-accent transition-colors"
      >
        <Icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div>
          <div className="font-medium text-sm mb-1">{item.title}</div>
          <p className="text-xs text-muted-foreground leading-snug">
            {item.description}
          </p>
        </div>
      </Link>
    </li>
  )
}