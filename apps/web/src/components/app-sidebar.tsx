"use client";

import * as React from "react";
import {
  BookOpen,
  SquareTerminal,
  GalleryVerticalEnd,
  Video,
  Code
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  team,
}: {
  user: { id: string; name: string | null; email: string | null } | null;
  team:
    | {
        id: string;
        teams: {
          name: string | null;
          id: string;
        };
      }[]
    | null;
}) {
  const data = {
    teams: [
      {
        name: team?.[0]?.teams?.name ?? "Your team",
        logo: GalleryVerticalEnd,
        plan: "Beta",
      },
    ],
    user: {
      name: user?.name ?? "User",
      email: user?.email ?? "",
      avatar: "/avatars/user.jpg",
    },
    navMain: [
      {
        isExternal: false,
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      }
      ,
      {
        title: "Documentation",
        url: "https://support.myapps.ai/aitutor-api/rag-info",
        icon: BookOpen,
        isExternal: true,
      },
      {
        title: "Demo App",
        url: "https://github.com/rossman22590/aitutor-api-rag",
        icon: Code,
        isExternal: true,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} team={data.teams[0]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
