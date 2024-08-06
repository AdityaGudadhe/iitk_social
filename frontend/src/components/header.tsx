import {ReactNode} from "react";
import LoginButton from "./navLoginButton.tsx";

export function SiteHeader(): ReactNode {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center text-red-500">
                {/*<MainNav />*/}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                    </div>
                    <nav className="flex items-center">
                        <LoginButton />
                    </nav>
                </div>
            </div>
        </header>
    )
}