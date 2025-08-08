import { useState } from "react";
import { Outlet } from "react-router";
import { Button } from "~/components/Button";
import { Drawer, DrawerContent } from "~/components/Drawer";
import Header from "~/components/header";
import Menu from "~/components/menu";
import { useWindowSize } from "~/context/window_size";

export default function Layout() {
  const { isMobile } = useWindowSize();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isMobile) {
    return (<>
      <div className="grid grid-cols-[100vw] h-full max-h-full grid-rows-[auto_1fr] overflow-hidden">
        <Header />
        <div className="p-4 pb-8 overflow-auto rounded bg-slate-100 shadow-lg h-full max-h-full w-full max-w-full">
          <Outlet />
        </div>
        <Button className="absolute bottom-4 right-4 z-50 rounded-full p-2" onClick={() => setDrawerOpen(!drawerOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>
      <div className="flex justify-start">

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <Menu onSelect={() => setDrawerOpen(false)} />
        </DrawerContent>
      </Drawer>
      </div>
    </>)
  }

  return (
    <div className="grid grid-cols-[100vw] grid-rows-[72px_calc(100vh-72px)] h-[100vh] w-[100vw] max-h-[100vh] max-w-[100vw] overflow-hidden">
      <Header />
      <div className="grid grid-cols-[225px_calc(100vw-241px)] grid-rows-[100%] gap-4 overflow-hidden">
        <div className="pl-4">
          <Menu onSelect={() => setDrawerOpen(false)} />
        </div>
        <div className="p-4 overflow-auto rounded bg-slate-100 shadow-lg h-[calc(100%-1rem)] max-h-[calc(100%-1rem)] w-[calc(100%-1rem)] max-w-[calc(100%-1rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 