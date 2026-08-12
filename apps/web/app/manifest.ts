import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { toSlug } from "@/utils/toSlug";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: env.NEXT_PUBLIC_SITE_NAME,
    short_name: toSlug(env.NEXT_PUBLIC_SITE_NAME),
    description:
      "All-in-one field service management software for plumbers, cleaners, electricians and others. Manage leads, scheduling, employees, and invoicing.",
    start_url: DEFAULT_AUTH_PATH,
    scope: DEFAULT_AUTH_PATH,
    lang: "en-US",
    dir: "ltr",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#bb4d00",
    categories: ["business", "productivity", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    shortcuts: [
      {
        name: "New lead",
        short_name: "New lead",
        url: "/dashboard/organization/leads/create",
        icons: [{ src: "/icons/shortcut-new-lead.png", sizes: "96x96" }],
      },
      {
        name: "New job",
        short_name: "New job",
        url: "/dashboard/organization/jobs/create",
        icons: [{ src: "/icons/shortcut-new-job.png", sizes: "96x96" }],
      },
      {
        name: "New materials",
        short_name: "New materials",
        url: "/dashboard/organization/materials/create",
        icons: [{ src: "/icons/shortcut-new-material.png", sizes: "96x96" }],
      },
      {
        name: "Tasks",
        short_name: "Tasks",
        url: "/dashboard/organization/tasks",
        icons: [{ src: "/icons/shortcut-tasks.png", sizes: "96x96" }],
      },
    ],
  };
}
