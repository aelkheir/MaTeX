import { Outlet } from "react-router-dom";

export const Root = () => {
  return (
    <div className="w-full h-full grid grid-cols-[25%_25%_1fr] grid-rows-[auto_minmax(0,_1fr)] bg-background">
      <Outlet />
    </div>
  );
};
