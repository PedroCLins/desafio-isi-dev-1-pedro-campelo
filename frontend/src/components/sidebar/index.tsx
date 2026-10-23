"use client";

import * as React from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import {
  Clock3,
  ListOrdered,
  Plus,
  Shield,
  Swords,
  Trophy,
  UsersRound,
} from "lucide-react";

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type SidebarItem = "players" | "clubs" | "matches" | "standings" | `club:${number}`;

export type SidebarClub = {
  id: number;
  name: string;
  acronym: string;
};

export type SidebarCounts = {
  players: number;
  clubs: number;
  matches: number;
};

type SidebarNavigationProps = {
  activeItem?: SidebarItem;
  counts?: SidebarCounts;
  clubs?: SidebarClub[];
  onActiveItemChange?: (item: SidebarItem) => void;
};

type SidebarHeaderProps = {
  logoSrc?: string;
};

export type SidebarFooterProps = {
  clubCount?: number;
  playerCount?: number;
  firstClubName?: string;
  firstClubScore?: number;
  secondClubName?: string;
  secondClubScore?: number;
};

export function SidebarBrand({ logoSrc = "/Marca.svg" }: SidebarHeaderProps) {
  return (
    <SidebarHeader className="h-[60px] flex-row items-center gap-2.5 px-4 py-3">
      <Image
        src={logoSrc}
        alt="Passe"
        width={32}
        height={32}
        className="size-8 shrink-0"
      />
      <div className="flex h-8 min-w-0 flex-col justify-between group-data-[collapsible=icon]:hidden">
        <span className="text-[14px] leading-4 font-semibold text-foreground">Passe</span>
        <span className="text-[12px] leading-4 font-normal text-muted-foreground">
          Gestão da liga
        </span>
      </div>
    </SidebarHeader>
  );
}

export function SidebarInfoFooter({
  clubCount = 0,
  playerCount = 0,
  firstClubName = "Delta FC",
  firstClubScore = 2,
  secondClubName = "Águias FC",
  secondClubScore = 1,
}: SidebarFooterProps) {
  return (
    <SidebarFooter className="mt-auto p-2">
      <div className="flex h-[147px] flex-col gap-2.5 rounded-xl border border-sidebar-border bg-background p-3 shadow-xs group-data-[collapsible=icon]:hidden">
        <div className="flex min-h-8 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Trophy className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] leading-5 font-medium text-foreground">
              Liga Fictícia 2026
            </p>
            <p className="truncate text-[12px] leading-4 font-normal text-muted-foreground">
              {clubCount} clubes · {playerCount} jogadores
            </p>
          </div>
        </div>
        <div className="flex min-h-8 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Swords className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] leading-5 font-medium text-foreground">
              Última partida
            </p>
            <p className="truncate text-[12px] leading-4 font-normal text-muted-foreground">
              {firstClubName} {firstClubScore} × {secondClubScore} {secondClubName}
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-sidebar-border" />
        <div className="flex items-center gap-1.5 text-[12px] leading-4 font-normal text-muted-foreground">
          <Clock3 className="size-4 shrink-0" />
          <span>Horário de Brasília (UTC-3)</span>
        </div>
      </div>
    </SidebarFooter>
  );
}

export function SidebarNavigation({
  activeItem: activeItemProp,
  counts = { players: 0, clubs: 0, matches: 0 },
  clubs: clubsProp,
  onActiveItemChange,
}: SidebarNavigationProps) {
  const [internalActiveItem, setInternalActiveItem] =
    React.useState<SidebarItem>("matches");
  const [fetchedClubs, setFetchedClubs] = React.useState<SidebarClub[]>([]);
  const clubs = clubsProp ?? fetchedClubs;
  const activeItem = activeItemProp ?? internalActiveItem;

  React.useEffect(() => {
    if (clubsProp) {
      return;
    }

    const loadClubs = async () => {
      try {
        const data = await apiClient.clubs.list({ sort: "name" });
        setFetchedClubs(data);
      } catch {
        setFetchedClubs([]);
      }
    };

    void loadClubs();
  }, [clubsProp]);

  const selectItem = (item: SidebarItem) => {
    setInternalActiveItem(item);
    onActiveItemChange?.(item);
  };

  const isClubSectionEnabled =
    activeItem === "clubs" || activeItem.startsWith("club:");

  return (
    <SidebarContent>
      <SidebarGroup className="p-2">
        <SidebarGroupLabel className="h-8 px-2 text-muted-foreground">Mercado</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeItem === "players"}
                onClick={() => selectItem("players")}
                tooltip="Jogadores"
              >
                <UsersRound />
                <span>Jogadores</span>
              </SidebarMenuButton>
              <SidebarMenuBadge className="text-muted-foreground">
                {counts.players}
              </SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeItem === "clubs" || activeItem.startsWith("club:")}
                onClick={() => selectItem("clubs")}
                tooltip="Clubes"
              >
                <Shield />
                <span>Clubes</span>
              </SidebarMenuButton>
              <SidebarMenuBadge className="text-muted-foreground">
                {counts.clubs}
              </SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="p-2">
        <SidebarGroupLabel className="h-8 px-2 text-muted-foreground">Liga</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeItem === "matches"}
                onClick={() => selectItem("matches")}
                tooltip="Partidas"
              >
                <Swords />
                <span>Partidas</span>
              </SidebarMenuButton>
              <SidebarMenuBadge className="text-muted-foreground">
                {counts.matches}
              </SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeItem === "standings"}
                onClick={() => selectItem("standings")}
                tooltip="Classificação"
              >
                <ListOrdered />
                <span>Classificação</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="p-2">
        <SidebarGroupLabel className="h-8 px-2 text-muted-foreground">
          Clubes
          <SidebarGroupAction
            aria-label="Adicionar clube"
            className="right-2"
          >
            <Plus className="size-4 text-muted-foreground" />
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            {clubs.map((club) => (
              <SidebarMenuItem key={club.id}>
                <SidebarMenuButton
                  isActive={activeItem === `club:${club.id}`}
                  onClick={() => selectItem(`club:${club.id}`)}
                  disabled={!isClubSectionEnabled}
                  tooltip={club.name}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border bg-muted text-[10px] font-medium text-muted-foreground">
                    {club.acronym.charAt(0)}
                  </span>
                  <span>{club.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}