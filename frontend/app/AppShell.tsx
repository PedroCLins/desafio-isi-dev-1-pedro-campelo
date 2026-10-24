"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SidebarBrand, SidebarInfoFooter, SidebarNavigation, type SidebarItem } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Sidebar, SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import type { Club, Match } from "@/lib/types";
import { Toaster } from "@/components/ui/toast";

function ShellTopbar({ clubs }: { clubs: Club[] }) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const isClubs = pathname.startsWith("/clubes");
  const clubId = isClubs ? Number(pathname.split("/")[2]) : NaN;
  const currentClub = Number.isInteger(clubId) ? clubs.find((club) => club.id === clubId) : undefined;
  return (
    <Topbar
      onToggleSidebar={toggleSidebar}
      currentPage={currentClub?.name}
      pageHref={isClubs ? "/clubes" : undefined}
      page={isClubs ? "Clubes" : "Jogadores"}
      section="Mercado"
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [playerCount, setPlayerCount] = React.useState(0);
  const [matches, setMatches] = React.useState<Match[]>([]);

  React.useEffect(() => {
    void Promise.allSettled([
      apiClient.clubs.list({ sort: "name" }),
      apiClient.players.list({ search: "", page: 1, limit: 1, sort: ["name"] }),
      apiClient.league.listMatches(),
    ]).then(([clubsResult, playersResult, matchesResult]) => {
      setClubs(clubsResult.status === "fulfilled" ? clubsResult.value : []);
      setPlayerCount(
        playersResult.status === "fulfilled" ? playersResult.value.meta.total_items : 0,
      );
      setMatches(matchesResult.status === "fulfilled" ? matchesResult.value : []);
    });
  }, [pathname]);

  const clubId = pathname.startsWith("/clubes/") ? Number(pathname.split("/")[2]) : NaN;
  const activeItem: SidebarItem = Number.isInteger(clubId)
    ? `club:${clubId}`
    : pathname.startsWith("/clubes")
      ? "clubs"
      : "players";
  const lastMatch = matches.at(-1);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarBrand />
        <SidebarNavigation
          activeItem={activeItem}
          clubs={clubs.map(({ id, name, acronym }) => ({ id, name, acronym }))}
          counts={{ clubs: clubs.length, matches: matches.length, players: playerCount }}
        />
        <SidebarInfoFooter
          clubCount={clubs.length}
          firstClubName={lastMatch?.home.club_name}
          firstClubScore={lastMatch?.home.goals}
          playerCount={playerCount}
          secondClubName={lastMatch?.away.club_name}
          secondClubScore={lastMatch?.away.goals}
          hasMatch={Boolean(lastMatch)}
        />
      </Sidebar>
      <SidebarInset className="min-w-0 bg-background">
        <ShellTopbar clubs={clubs} />
        {children}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
