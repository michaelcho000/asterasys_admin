'use client'
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/shared/header/Header";
import NavigationManu from "@/components/shared/navigationMenu/NavigationMenu";
import SupportDetails from "@/components/supportDetails";
import useBootstrapUtils from "@/hooks/useBootstrapUtils"
import MonthFetchInitializer from '@/components/providers/MonthFetchInitializer'
// const useBootstrapUtils = dynamic(() => import('@/hooks/useBootstrapUtils'), { ssr: false })

export default function DuplicateLayout({ children }) {
    const pathName = usePathname()
    useBootstrapUtils(pathName)

    return (
        <>
            <MonthFetchInitializer />
            <Header />
            <NavigationManu />
            <main className="nxl-container">
                <div className="nxl-content">
                    {children}
                </div>
            </main>
            <SupportDetails />
        </>

    );
}
