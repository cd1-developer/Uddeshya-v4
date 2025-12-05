"use client";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Building2, LucideProps, ShieldHalf, UserRoundCog } from "lucide-react";
import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  HomeIcon,
  Map,
  PieChart,
  CalendarArrowDownIcon,
  StampIcon,
  User2Icon,
  Users2Icon,
  ScrollText,
  ClockFading,
  Hourglass,
  NotebookText,
  Users,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import useCurrentUser from "@/hooks/userData";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
export const sidebarData = {
  user: {
    name: "Setting",
    email: "m@example.com",
    avatar: "CN",
  },
  teams: [
    {
      name: "UDDESHYA",
      logo: GalleryVerticalEnd,
      plan: "Leave Management",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      compo: "home",
      url: "/dashboard/",
      icon: HomeIcon,
      isActive: true,
    },
    {
      title: "My Profile",
      compo: "profile",
      url: "/dashboard/profile",
      icon: User2Icon,
    },
    // {
    //   title: "My Approvals",
    //   compo: "approvals",
    //   url: "/dashboard/approvals",
    //   icon: StampIcon,
    // },
    {
      title: "People",
      compo: "people",
      url: "/dashboard/people",
      icon: Users2Icon,
      items: [
        {
          title: "All Members",
          url: "/dashboard/People/all-members",
          compo: "all-members",
          icon: Users,
        },
        {
          title: "Reporting Managers",
          url: "/dashboard/People/reporting-managers",
          compo: "reporting-managers",
          icon: UserRoundCog,
        },
        {
          title: "My Team",
          url: "/dashboard/People/my-team",
          compo: "my-team",
          icon: ShieldHalf,
        },
      ],
    },
    {
      title: "Core",
      compo: "core",
      url: "/dashboard/core",
      icon: Building2,
    },
    {
      title: "Leaves",
      compo: "leaves",
      url: "/dashboard/Leaves",
      icon: CalendarArrowDownIcon,
      items: [
        {
          title: "My leaves",
          url: "/dashboard/Leaves/my-leaves",
          compo: "my-leaves",
          icon: CalendarArrowDownIcon,
        },
        {
          title: "Policies",
          url: "/dashboard/Leaves/policies",
          compo: "policies",
          icon: ScrollText,
        },
        // {
        //   title: "Timeline",
        //   url: "/dashboard/Leaves/timeline",
        //   compo: "timeline",
        //   icon: ClockFading,
        // },
        // {
        //   title: "Balances",
        //   url: "/dashboard/Leaves/balances",
        //   compo: "balances",
        //   icon: Hourglass,
        // },
        // {
        //   title: "Reports",
        //   url: "/dashboard/Leaves/reports",
        //   compo: "reports",
        //   icon: NotebookText,
        // },
        // {
        //   title: "People",
        //   url: "/dashboard/Leaves/people",
        //   compo: "leave-people",
        //   icon: Users,
        // },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export interface NavItem {
  title: string;
  compo?: React.ReactNode | string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  url?: string;
  isActive?: boolean;
  items?: {
    title: string;
    compo?: React.ReactNode | string;
    url?: string;
  }[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

function AppSidebar({ ...props }: AppSidebarProps) {
  const { user } = useCurrentUser();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent className="w-full">
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.username as string,
            email: user?.email as string,
            avatar: user?.username?.toUpperCase()[0] as string,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
