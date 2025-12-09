"use client";
import AppSidebar from "@/components/Sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/components/Sidebar/app-sidebar";
import { useParams, usePathname } from "next/navigation";
import { ComponentType, useEffect } from "react";
import { LucideProps, LayoutPanelTop, Globe2, Globe } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import ThreeBodyLoader from "@/components/custom/Loader/ThreeBodyLoader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { dashboardRoute, subRoute } = params;

  // const organisation = useSelector(
  //   (state: RootState) => state.dataSlice.organisation
  // );
  const isLoading = useSelector(
    (state: RootState) => state.dataSlice.isLoading
  );

  const isDashboard = pathname?.startsWith("/dashboard");
  if (!isDashboard) {
    return <>{children}</>;
  }

  const findCurrentPage = () => {
    if (!isDashboard) return null;

    for (const item of sidebarData.navMain) {
      if (item.items) {
        const subItem = item.items.find((sub) => sub.url === pathname);
        if (subItem) {
          return {
            title: subItem.title,
            icon: subItem.icon || item.icon, // inherit parent icon
            url: subItem.url,
          };
        }
      }
      // Check main item
      if (item.url === pathname) {
        return {
          title: item.title,
          icon: item.icon,
          url: item.url,
        };
      }
    }

    return sidebarData.navMain[0];
  };
  const currentPage = findCurrentPage();
  const renderIcon = () => {
    if (!currentPage?.icon) return null;
    const IconComponent = currentPage.icon as ComponentType<LucideProps>;
    return <IconComponent size={19} strokeWidth={1.4} />;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between h-16 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="org-name">
            <h2 className="font-gilBold uppercase flex items-center justify-center gap-2.5 text-sky-800 text-xl">
              {/* <span className="mt-2 text-5xl">Akatsuki</span>
              <img src="/akatsuki.gif" className="w-34" alt="" /> */}
              {/* ChhuttiHub */}
              Social Three Sixty
            </h2>
          </div>
        </header>

        <div className="flex w-full bg-gray-50">
          {/* Sidebar */}
          <div className="w-0 flex-shrink-0">
            <AppSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
              <div className="px-6 py-4 flex items-center justify-start gap-3">
                <div className="icon bg-sky-100 w-9 h-9 flex items-center justify-center rounded-md">
                  {Array.isArray(dashboardRoute) ? (
                    <LayoutPanelTop />
                  ) : (
                    renderIcon()
                  )}
                </div>
                <h1 className="font-gilSemiBold text-gray-800 text-2xl">
                  {Array.isArray(dashboardRoute)
                    ? "Dashboard"
                    : currentPage?.title}
                </h1>
              </div>
            </header>

            <main className="flex-1 overflow-auto bg-gray-50 p-6">
              {isLoading ? (
                <div>
                  <ThreeBodyLoader />
                </div>
              ) : (
                children
              )}
              {/* {subRoute ? subRoute.replace("-", " ") : dashboardRoute} */}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
