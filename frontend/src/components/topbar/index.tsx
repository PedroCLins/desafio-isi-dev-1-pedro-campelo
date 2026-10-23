"use client";

import * as React from "react";
import { PanelLeft, RefreshCw } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  section?: string;
  page?: string;
  onToggleSidebar?: () => void;
  onRefresh?: () => void;
};

export function Topbar({
  section = "Mercado",
  page = "Jogadores",
  onToggleSidebar,
  onRefresh,
}: TopbarProps) {
  const refresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    window.location.reload();
  };

  return (
    <header className="flex h-14 w-full items-center gap-2 border-b border-border px-4">
      <Button
        aria-label="Recolher ou expandir menu"
        className="size-8"
        onClick={onToggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeft className="size-4" />
      </Button>
      <div aria-hidden="true" className="h-4 w-px bg-border" />
      <Breadcrumb className="min-w-0 flex-1 pl-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">{section}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex h-8 items-center gap-1">
        <Button
          aria-label="Atualizar dados"
          className="size-8"
          onClick={refresh}
          size="icon-sm"
          variant="ghost"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>
    </header>
  );
}
