import { Outlet } from "react-router-dom";
import DriverBottomNav from "./DriverBottomNav";

const DriverLayout = () => {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <DriverBottomNav />
    </div>
  );
};

export default DriverLayout;
