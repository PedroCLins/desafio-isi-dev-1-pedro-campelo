import { Wallet } from "lucide-react";

import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

type SummaryCardProps = {
  title?: string;
  value?: string;
  unit?: string;
  description?: string;
};

export function SummaryCard({
  title = "Caixa",
  value = "51,58",
  unit = "moedas",
  description = "Só muda por compras e vendas",
}: SummaryCardProps) {
  return (
    <Card className="h-31.5 w-70 gap-2 rounded-[14px] border border-border p-5 shadow-xs ring-0">
      <div className="flex items-center justify-between">
        <CardTitle className="p-0 text-[14px] leading-5 font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Wallet
          aria-hidden="true"
          className="size-4 text-muted-foreground"
          strokeWidth={2}
        />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[24px] leading-8 font-semibold">{value}</span>
        <span className="text-[14px] leading-5 font-normal text-muted-foreground">
          {unit}
        </span>
      </div>
      <CardDescription className="p-0 text-[12px] leading-4 font-normal text-muted-foreground">
        {description}
      </CardDescription>
    </Card>
  );
}