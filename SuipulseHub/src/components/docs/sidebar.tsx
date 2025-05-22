"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = {
  "Getting Started": [
    { title: "Introduction", href: "/docs" },
    { title: "Quick Start", href: "/docs/quick-start" },
  ],
  "Core Concepts": [
    { title: "Data Streams", href: "/docs/core-concepts/data-streams" },
    { title: "Snapshots", href: "/docs/core-concepts/snapshots" },
    { title: "Access Control", href: "/docs/core-concepts/access-control" },
  ],
  "SDK Reference": [
    { title: "Client Setup", href: "/docs/sdk/client-setup" },
    { title: "Stream Management", href: "/docs/sdk/stream-management" },
    { title: "Event Handling", href: "/docs/sdk/event-handling" },
    { title: "Stream Composition", href: "/docs/sdk/stream-composition" },
    {
      title: "Subscription Management",
      href: "/docs/sdk/subscription-management",
    },
    { title: "Batch Operations", href: "/docs/sdk/batch-operations" },
    { title: "Network Configuration", href: "/docs/sdk/network-configuration" },
    { title: "Snapshot Management", href: "/docs/sdk/snapshot-management" },
    { title: "Snapshot Transfer", href: "/docs/sdk/snapshot-transfer" },
    { title: "Ownership Transfer", href: "/docs/sdk/ownership-transfer" },
    { title: "Error Handling", href: "/docs/sdk/error-handling" },
    { title: "Validation", href: "/docs/sdk/validation" },
  ],
};

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full py-6 lg:py-8">
      <div className="pb-4">
        <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
          Documentation
        </h4>
      </div>
      {Object.entries(sidebarItems).map(([category, items]) => (
        <div key={category} className="pb-4">
          <h5 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
            {category}
          </h5>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
