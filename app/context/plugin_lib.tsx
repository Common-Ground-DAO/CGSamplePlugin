import type { CgPluginLib } from "@common-ground-dao/cg-plugin-lib";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

const CgPluginLibContext = createContext<CgPluginLib | null>(null);

export function CgPluginLibProvider({ children }: { children: React.ReactNode }) {
    const [cgPluginLib, setCgPluginLib] = useState<CgPluginLib | null>(null);
    const [searchParams] = useSearchParams();
    const promiseRef = useRef<Promise<void> | null>(null);

    const iframeUid = useMemo(() => searchParams.get("iframeUid"), []); // do not update

    useEffect(() => {
        if (!cgPluginLib && !promiseRef.current) {
            promiseRef.current = (async () => {
                const { CgPluginLib } = await import("@common-ground-dao/cg-plugin-lib");
                if (!iframeUid) throw new Error("No iframeUid found");
                const cgPluginLib = await CgPluginLib.initialize(iframeUid, `${import.meta.env.BASE_URL}api/sign`, import.meta.env.VITE_PLUGIN_PUBLIC_KEY);
                setCgPluginLib(cgPluginLib);
            })().catch((error) => {
                console.error(error);
            }).finally(() => {
                promiseRef.current = null;
            });
        }
    }, [cgPluginLib, iframeUid]);

    return <CgPluginLibContext.Provider value={cgPluginLib}>{children}</CgPluginLibContext.Provider>;
}

export function useCgPluginLib () {
    return useContext(CgPluginLibContext);
}