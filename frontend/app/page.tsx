import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SummaryCard } from "@/components/card";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  SidebarBrand,
  SidebarInfoFooter,
  SidebarNavigation,
} from "@/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleAlert,
  CircleCheck,
  Info,
  LayoutDashboard,
  Pencil,
  Plus,
  TriangleAlert,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans gap-16 pt-16 pb-48">
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <div className="flex flex-col h-58 items-center justify-between">
          <Button>Button</Button>
          <Button variant={"secondary"}>Button</Button>
          <Button variant={"outline"}>Button</Button>
          <Button variant={"ghost"}>Button</Button>
          <Button variant={"link"}>Button</Button>
        </div>
        <div className="flex flex-col h-58 items-center justify-between">
          <Button size={"sm"}>Button</Button>
          <Button variant={"secondary"} size={"sm"}>Button</Button>
          <Button variant={"outline"} size={"sm"}>Button</Button>
          <Button variant={"ghost"} size={"sm"}>Button</Button>
          <Button variant={"link"} size={"sm"}>Button</Button>
        </div>
        <div className="flex flex-col h-58 items-center justify-between">
          <Button size={"lg"}>Button</Button>
          <Button variant={"secondary"} size={"lg"}>Button</Button>
          <Button variant={"outline"} size={"lg"}>Button</Button>
          <Button variant={"ghost"} size={"lg"}>Button</Button>
          <Button variant={"link"} size={"lg"}>Button</Button>
        </div>
        <div className="flex flex-col h-58 items-center justify-between">
          <Button size={"icon"}><Plus /></Button>
          <Button variant={"secondary"} size={"icon"}><Plus /></Button>
          <Button variant={"outline"} size={"icon"}><Plus /></Button>
          <Button variant={"ghost"} size={"icon"}><Plus /></Button>
          <Button variant={"link"} size={"icon"}><Plus /></Button>
        </div>
        <div className="flex flex-col h-58 items-center justify-between">
          <Button size={"icon-sm"}> <Plus /></Button>
          <Button variant={"secondary"} size={"icon-sm"}><Plus /></Button>
          <Button variant={"outline"} size={"icon-sm"}><Plus /></Button>
          <Button variant={"ghost"} size={"icon-sm"}><Plus /></Button>
          <Button variant={"link"} size={"icon-sm"}><Plus /></Button>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <Badge>Badge</Badge>
        <Badge variant={"secondary"}>Badge</Badge>
        <Badge variant={"outline"}>Badge</Badge>
        <Badge variant={"success"}>Badge</Badge>
        <Badge variant={"warning"}>Badge</Badge>
        <Badge variant={"destructive"}>Badge</Badge>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <div className="flex flex-col h-58 items-center justify-between">
          <Input placeholder="Ex.: Meia Lua" />
          <Input placeholder="Ex.: Meia Lua" autoFocus />
          <Input placeholder="Ex.: Meia Lua" aria-invalid="true" />
          <Input placeholder="Ex.: Meia Lua" disabled />
        </div>
      </div>
      <div className="flex flex-col h-58 items-center justify-between">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item-1">Item 1</SelectItem>
              <SelectItem value="item-2">Item 2</SelectItem>
              <SelectItem value="item-3">Item 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger autoFocus>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item-1">Item 1</SelectItem>
              <SelectItem value="item-2">Item 2</SelectItem>
              <SelectItem value="item-3">Item 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger aria-invalid="true">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item-1">Item 1</SelectItem>
              <SelectItem value="item-2">Item 2</SelectItem>
              <SelectItem value="item-3">Item 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger disabled>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item-1">Item 1</SelectItem>
              <SelectItem value="item-2">Item 2</SelectItem>
              <SelectItem value="item-3">Item 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <Switch />
        <Switch />
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <Kbd>⌘K</Kbd>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <RadioGroup defaultValue="item-1">
          <RadioGroupItem value="item-1" />
          <RadioGroupItem value="item-2" />
        </RadioGroup>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <Checkbox />
        <Checkbox />
        <Checkbox disabled/>
        <Checkbox disabled />
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">
        <Tabs defaultValue="active">
          <TabsList variant="line">
            <TabsTrigger value="active">
              <LayoutDashboard data-icon="inline-start" />
              <span>Aba</span>
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                0
              </span>
            </TabsTrigger>
            <TabsTrigger value="inactive">
              <LayoutDashboard data-icon="inline-start" />
              <span>Aba</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">
                2
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="flex flex-row items-center justify-center bg-zinc-50 font-sans gap-4">

        <Avatar size="md">
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 bg-zinc-50 font-sans">
        <SidebarProvider className="min-h-0 w-96 bg-zinc-50 p-4">
          <SidebarMenu className="gap-2">
            <SidebarMenuItem className="flex flex-col gap-2">
              <SidebarMenuButton isActive>
                <Users />
                <span>Item (active)</span>
              </SidebarMenuButton>
              <SidebarMenuButton>
                <Users />
                <span>Item (inactive)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex flex-col gap-2">
              <SidebarMenuButton isActive>
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  A
                </span>
                <span>Clube (active)</span>
              </SidebarMenuButton>
              <SidebarMenuButton>
                <span className="flex size-6 items-center justify-center rounded-md border border-border bg-transparent text-foreground">
                  A
                </span>
                <span>Clube (inactive)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 bg-zinc-50 font-sans">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Pencil />
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem data-highlighted>
              <Pencil />
              Hover / focus
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Pencil />
              Disabled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 bg-zinc-50 font-sans">
        <Alert>
          <Info />
          <AlertTitle>Título do alerta</AlertTitle>
          <AlertDescription>
            Descrição com a orientação para o usuário.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Título do alerta</AlertTitle>
          <AlertDescription>
            Descrição com a orientação para o usuário.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <TriangleAlert />
          <AlertTitle>Título do alerta</AlertTitle>
          <AlertDescription>
            Descrição com a orientação para o usuário.
          </AlertDescription>
        </Alert>
        <Alert variant="success">
          <CircleCheck />
          <AlertTitle>Título do alerta</AlertTitle>
          <AlertDescription>
            Descrição com a orientação para o usuário.
          </AlertDescription>
        </Alert>
      </div>
      <SummaryCard />
      <SidebarProvider className="h-[900px] w-[256px] shrink-0">
        <Sidebar
          collapsible="none"
          variant="inset"
          className="relative h-full"
        >
          <SidebarBrand />
          <SidebarNavigation />
          <SidebarInfoFooter />
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
