import { Home, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/driver", icon: Home, label: "Dashboard" },
  { to: "/driver/profile", icon: User, label: "Profile" },
];

const DriverBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground transition-colors"
            activeClassName="text-primary bg-accent"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default DriverBottomNav;
