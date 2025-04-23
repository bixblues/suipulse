"use client";
import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { LogoWithText } from "@/components/ui/LogoWithText";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "DeFi Oracle",
    href: "/demos/defi-oracle",
    description:
      "Multi-protocol price feed aggregation with real-time updates.",
  },
  {
    title: "Sensor Network",
    href: "/demos/sensor-network",
    description: "IoT-style data streams with batch updates and monitoring.",
  },
  {
    title: "Social Feed",
    href: "/demos/social-feed",
    description: "Public and private data feeds with subscription management.",
  },
  {
    title: "Analytics",
    href: "/demos/analytics",
    description: "Comprehensive analytics dashboard for stream performance.",
  },
];

export function Navbar() {
  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <LogoWithText />
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500 to-purple-900 p-6 no-underline outline-none focus:shadow-md"
                        href="/docs"
                      >
                        <div className="mt-4 mb-2 text-lg font-medium text-white">
                          Documentation
                        </div>
                        <p className="text-sm leading-tight text-white/90">
                          Learn how to integrate SuiPulse into your
                          applications.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/docs/quickstart" title="Quick Start">
                    Get started with SuiPulse in under 5 minutes.
                  </ListItem>
                  <ListItem href="/docs/tutorials" title="Tutorials">
                    Step-by-step guides for building with SuiPulse.
                  </ListItem>
                  <ListItem href="/docs/examples" title="Examples">
                    View example projects and implementations.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Demos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {components.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                href="/playground"
              >
                Playground
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto flex items-center gap-4">
          <a
            href="https://github.com/suipulse/suipulse"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <Star className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Star this project</span>
          </a>
        </div>
      </div>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
