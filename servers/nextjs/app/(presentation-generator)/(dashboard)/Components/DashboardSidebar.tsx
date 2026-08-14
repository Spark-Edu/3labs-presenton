"use client";

import React from "react";
import { LayoutDashboard, Star, Brain, Settings, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";



export const defaultNavItems = [
    { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { key: "templates" as const, label: "Standard", icon: Star },
    { key: "designs" as const, label: "Smart", icon: Brain },



];
export const BelongingNavItems = [
    { key: "settings" as const, label: "Settings", icon: Settings },
]

const DashboardSidebar = () => {


    const pathname = usePathname();
    const activeTab = pathname.split("?")[0].split("/").pop();
    const router = useRouter();

    // Returns to whichever 3Labs page the user came from (set by
    // ConfigurationInitializer.tsx / SsoParamCapture.tsx from the /sso
    // redirect's `return` param); falls back to the app dashboard if absent
    // — e.g. someone opened the Presenton dashboard directly, not via SSO.
    const handleBackToThreeLabs = () => {
        const returnUrl =
            typeof window !== "undefined"
                ? localStorage.getItem("presenton_return_url")
                : null;
        window.location.href = returnUrl || "https://app.3labs.ca/dashboard";
    };

    return (
        <aside
            className="sticky top-0 h-screen w-[115px] flex flex-col justify-between bg-[#F6F6F9] backdrop-blur border-r border-slate-200/60 px-4  py-8"
            aria-label="Dashboard sidebar"
        >
            <div>

                <button
                    type="button"
                    onClick={handleBackToThreeLabs}
                    className="flex flex-col items-center gap-2 w-full pb-6 border-b border-slate-200/60 text-slate-600 hover:text-[#2d7a4f] transition-colors"
                    aria-label="Back to 3Labs"
                    title="Back to 3Labs"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-[11px]">3Labs</span>
                </button>
                <nav className="pt-6 font-sans" aria-label="Dashboard sections">
                    <div className="  space-y-6">

                        {/* Dashboard */}
                        <Link
                            prefetch={false}
                            href={`/dashboard`}
                            className={[
                                "flex flex-col tex-center items-center gap-2  transition-colors",
                                pathname === "/dashboard" ? "" : "ring-transparent",
                            ].join(" ")}
                            aria-label="Dashboard"
                            title="Dashboard"
                        >
                            <LayoutDashboard className={["h-4 w-4", pathname === "/dashboard" ? "text-slate-800" : "text-slate-600"].join(" ")} />
                            <span className="text-[11px] text-slate-800">Dashboard</span>
                        </Link>
                        <Link
                            prefetch={false}
                            href={`/templates`}
                            className={[
                                "flex flex-col tex-center items-center gap-2  transition-colors",
                                pathname === "/templates" ? "" : "ring-transparent",
                            ].join(" ")}
                            aria-label="Templates"
                            title="Templates"
                        >
                            <div className="flex flex-col cursor-pointer tex-center items-center gap-2  transition-colors">
                                <Star className={`h-4 w-4 ${pathname === "/templates" ? "text-slate-800" : "text-slate-600"}`} />
                                <span className="text-[11px] text-slate-800">Templates</span>
                            </div>
                        </Link>
                        {/* Theme nav entry removed 2026-08-14 — the theme feature (custom
                            theme creation/editing) is being retired across slides.3labs.ca.
                            It sat on Presenton's open-source theme storage/identity model,
                            which repeatedly broke (org/user key mismatches, tab-state bugs,
                            an unresolved localStorage identity issue on refresh) and was
                            judged not worth continuing to patch rather than rebuild. See
                            /theme route and ThemeSelector in PresentationHeader.tsx (also
                            commented out) for the rest of this feature's surface area. */}
                    </div>
                </nav>
            </div>

            {/* Settings hidden for the trainer-facing standalone dashboard —
                BelongingNavItems/"settings" route is kept below (unused) in
                case Settings needs to come back for an internal/admin view. */}

        </aside>
    );
};

export default DashboardSidebar;


