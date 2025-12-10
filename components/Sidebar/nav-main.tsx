"use client";

import {
  ChevronRight,
  type LucideIcon,
  Lock,
  LucideProps,
  Divide,
} from "lucide-react";
import { BookType } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { Role } from "@/interfaces";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  // Get organization from Redux store
  // const organisation = useSelector(
  //   (state: RootState) => state.dataSlice.organisation
  // );

  // Check if organization exists
  // const hasOrganization = Object.entries(organisation).length !== 0;
  // const hasOrganization = Object.keys(organisation ?? {}).length > 0;

  const isItemActive = (item: NavItem) => {
    return pathname === item.url || pathname.startsWith(item.url + "/");
  };
  const employee = useSelector((state: RootState) => state.dataSlice.employee);
  const user = useSelector((state: RootState) => state.dataSlice.userInfo);

  const currentUser = employee?.find((emp) => emp.userId === user.id);

  const isNotMember = currentUser?.role !== Role.MEMBER;

  const filteredItems = items.filter((item) => {
    if (item.title === "Core") {
      return isNotMember;
    }
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-gilBold">Platform</SidebarGroupLabel>
      <SidebarMenu className="font-gilMedium">
        {filteredItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.items && item.items.length > 0 ? (
              // Collapsible items with sub-items
              <Collapsible
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild>
                  {/* <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item)}
                    className={
                      !hasOrganization ? "opacity-50 cursor-not-allowed" : ""
                    }
                    disabled={!hasOrganization}
                  >
                    {user?.role !== "MEMBER" ? <div>

                    </div> : <div></div>}
                  </SidebarMenuButton> */}

                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item)}
                    // className={
                    //   !hasOrganization ? "opacity-50 cursor-not-allowed" : ""
                    // }
                    // disabled={!hasOrganization}
                  >
                    {item.icon && <item.icon size={1.5} />}
                    <span className="sidebar-menu-button-label">
                      {item.title}
                    </span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 sidebar-menu-button-chevron" />

                    {/* {user?.role !== "MEMBER" ? <div> {} </div> : <div></div>} */}

                    {/* {!hasOrganization ? (
                      <Lock className="w-3 h-3 sidebar-menu-button-lock" />
                    ) : (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 sidebar-menu-button-chevron" />
                    )} */}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          // className={`font-gilRegular ${
                          //   !hasOrganization
                          //     ? "opacity-50 cursor-not-allowed"
                          //     : ""
                          // }`}
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          {/* This is Submenus Sections  */}
                          <Link
                            href={
                              currentUser?.role === Role.ADMIN &&
                              subItem.url?.includes("my-leaves")
                                ? "#"
                                : subItem.url || "#"
                            }
                            onClick={(e) => {
                              if (
                                currentUser?.role === Role.ADMIN &&
                                subItem.url?.includes("my-leaves")
                              ) {
                                e.preventDefault();
                                e.stopPropagation();
                                alert("Admins cannot access My Leaves section");
                              }
                            }}
                          >
                            <div
                              className={`flex items-center gap-1 ${
                                currentUser?.role === Role.ADMIN &&
                                subItem.url?.includes("my-leaves")
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <span>
                                {subItem.icon && (
                                  <subItem.icon size={13} strokeWidth={1.5} />
                                )}
                              </span>
                              <span>{subItem.title}</span>
                            </div>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // Simple button for items without sub-items
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive(item)}
                // className={
                //   !hasOrganization ? "opacity-50 cursor-not-allowed" : ""
                // }
                // disabled={!hasOrganization}
              >
                <Link href={item.url || "#"}>
                  {item.icon && <item.icon strokeWidth={1.5} />}
                  <span className="sidebar-menu-button-label">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
