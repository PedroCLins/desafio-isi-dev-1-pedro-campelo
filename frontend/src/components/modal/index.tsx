"use client";

import * as React from "react";
import { CheckCircle2, Info } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ModalAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
  icon?: React.ReactNode;
};

export type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  cancelAction: ModalAction;
  confirmAction: ModalAction;
  info?: string;
  loadingInfo?: string;
  showSuccessIcon?: boolean;
  className?: string;
};

export function BaseModal({
  open,
  onClose,
  title,
  description,
  children,
  cancelAction,
  confirmAction,
  info,
  loadingInfo,
  showSuccessIcon = false,
  className,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className={cn(className)} showCloseButton>
        {showSuccessIcon && (
          <div className="flex size-9 items-center justify-center rounded-full bg-success-soft">
            <CheckCircle2 className="size-4 text-success-soft-foreground" />
          </div>
        )}

        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0">{children}</div>

        <DialogFooter className="mx-0 mb-0 w-full flex-row items-center justify-between border-border bg-background p-0 pt-4 sm:justify-between">
          {loadingInfo ? (
            <div className="flex items-center gap-2 text-[12px] leading-4 font-normal text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              <span>{loadingInfo}</span>
            </div>
          ) : info ? (
            <div className="flex items-center gap-2 text-[12px] leading-4 font-normal text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              <span>{info}</span>
            </div>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button
              className={cancelAction.className}
              disabled={cancelAction.disabled || cancelAction.loading}
              onClick={cancelAction.onClick}
              type="button"
              variant={cancelAction.variant ?? "outline"}
            >
              {cancelAction.icon}
              {cancelAction.loading ? "Aguarde..." : cancelAction.label}
            </Button>
            <Button
              className={confirmAction.className}
              disabled={confirmAction.disabled || confirmAction.loading}
              onClick={confirmAction.onClick}
              type="button"
              variant={confirmAction.variant ?? "default"}
            >
              {confirmAction.icon}
              {confirmAction.loading ? "Aguarde..." : confirmAction.label}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
