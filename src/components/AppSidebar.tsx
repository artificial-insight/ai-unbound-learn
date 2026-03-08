import { Home, BookOpen, Video, BarChart3, MessageSquare, Bell, User, Settings, Shield, Users as UsersIcon, DollarSign, Mail, Briefcase, LogOut, Target, TrendingUp, Trophy, Mic } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Live Sessions", url: "/session", icon: Video },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Forum", url: "/forum", icon: MessageSquare },
  { title: "Study Groups", url: "/study-groups", icon: UsersIcon },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Learning Paths", url: "/learning-paths", icon: Target },
  { title: "Skill Gap Analysis", url: "/skill-gaps", icon: TrendingUp },
];

const managementItems = [
  { title: "Executive Dashboard", url: "/executive", icon: TrendingUp, roles: ['educator', 'institution'] },
  { title: "L&D Manager", url: "/ld-manager", icon: UsersIcon, roles: ['educator', 'institution'] },
];

const publicItems = [
  { title: "Contact", url: "/contact", icon: Mail },
  { title: "Careers", url: "/careers", icon: Briefcase },
  { title: "Affiliate Program", url: "/affiliate", icon: DollarSign },
];

const bottomItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { userRole, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="pt-16">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(userRole === 'educator' || userRole === 'institution') && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-semibold"
                      >
                        <Shield className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>Admin Dashboard</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                          activeClassName="bg-primary/10 text-primary font-semibold"
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 w-full text-left"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
