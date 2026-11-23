import { Outlet } from "react-router-dom";
import Dock from "../navigation/Dock";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1c1e21] selection:bg-blue-200 pb-20 md:pb-0 md:pl-20 xl:pl-64">
      <div className="w-full h-full flex justify-center">
        <Outlet />
      </div>

      <Dock />
    </div>
  );
};

export default AppLayout;
