import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, BookOpen, Video, BarChart, LogOut, Menu, User, School } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [isEducator, setIsEducator] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data && data.role === 'educator') {
            setIsEducator(true);
          }
        });
    }
  }, [user]);

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

  const NavLinks = () => (
    <>
      <Link to="/dashboard" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="justify-start w-full">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link to="/courses" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="justify-start w-full">
          <BookOpen className="w-4 h-4 mr-2" />
          Courses
        </Button>
      </Link>
      <Link to="/session" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="justify-start w-full">
          <Video className="w-4 h-4 mr-2" />
          Live Sessions
        </Button>
      </Link>
      <Link to="/analytics" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="justify-start w-full">
          <BarChart className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </Link>
      <Link to="/profile" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="justify-start w-full">
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </Link>
      {isEducator && (
        <Link to="/educator" onClick={() => setOpen(false)}>
          <Button variant="ghost" className="justify-start w-full">
            <School className="w-4 h-4 mr-2" />
            Educator
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">AI UnboundEd</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="w-4 h-4" />
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                  <Button variant="ghost" onClick={handleLogout} className="justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
