"use client";
import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";
import { templates } from "@/app/presentation-templates";
import { TemplateWithData, TemplateLayoutsWithSettings } from "@/app/presentation-templates/utils";
import {
    useCustomTemplatePreview,
    CustomTemplates,
} from "@/app/hooks/useCustomTemplates";
import { CompiledLayout } from "@/app/hooks/compileLayout";

// Component for rendering custom template card with lazy-loaded previews
export const CustomTemplateCard = React.memo(function CustomTemplateCard({ template }: { template: CustomTemplates }) {
    const router = useRouter();
    const { previewLayouts, loading, totalLayouts } = useCustomTemplatePreview(`${template.id}`);
    const handleOpen = useCallback(() => {
        if (template.id.startsWith('custom-')) {
            router.push(`/template-preview/${template.id}`)
        } else {
            router.push(`/template-preview/custom-${template.id}`)
        }
    }
        , [router, template.id]);

    return (
        <Card
            className="cursor-pointer flex flex-col justify-between shadow-none sm:shadow-none relative hover:shadow-lg transition-all duration-200 group overflow-hidden"
            onClick={handleOpen}
        >

            <img src="/card_bg.svg" alt="" className="absolute top-0 left-0 w-full h-full object-cover" />
            <span className="text-xs font-syne absolute top-2 flex gap-1 capitalize  items-center left-2 rounded-[100px]  px-2.5 py-1 bg-[#3A3A3AF5] text-white font-semibold  z-40">
                Layouts- {totalLayouts}
            </span>
            <div className="p-5">

                {/* Layout previews */}
                <div className="grid grid-cols-2 gap-2">
                    {loading ? (
                        // Loading placeholders
                        [...Array(Math.min(4, template.layoutCount))].map((_, index) => (
                            <div
                                key={`${template.id}-loading-${index}`}
                                className="relative bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200 overflow-hidden aspect-video rounded flex items-center justify-center"
                            >
                                <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
                            </div>
                        ))
                    ) : previewLayouts.length > 0 && (
                        // Actual layout previews
                        previewLayouts.slice(0, 4).map((layout: CompiledLayout, index: number) => {
                            const LayoutComponent = layout.component;
                            return (
                                <div
                                    key={`${template.id}-preview-${index}`}
                                    className="relative bg-gray-100 border border-gray-200 overflow-hidden aspect-video rounded"
                                >
                                    <div className="absolute inset-0 bg-transparent z-10" />
                                    <div
                                        className="transform scale-[0.12] origin-top-left"
                                        style={{ width: "833.33%", height: "833.33%" }}
                                    >
                                        <LayoutComponent data={layout.sampleData} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>


            </div>
            <div className="flex items-center justify-between p-5 bg-white border-t border-[#EDEEEF] relative z-40  ">
                <h3 className="text-sm font-bold w-[191px] text-gray-900">
                    {template.name}
                </h3>

                <div className="flex items-center gap-2">

                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
            </div>
        </Card>
    );
}, (prev, next) => {
    // Custom templates may be refetched, producing new object references; compare on fields we render/use.
    return (
        prev.template.id === next.template.id &&
        prev.template.id === next.template.id &&
        prev.template.name === next.template.name &&
        prev.template.layoutCount === next.template.layoutCount
    );
});

const InbuiltTemplateCard = React.memo(function InbuiltTemplateCard({
    template,
    onOpen,
}: {
    template: TemplateLayoutsWithSettings;
    onOpen: (id: string) => void;
}) {
    const previewLayouts = useMemo(() => template.layouts.slice(0, 4), [template.layouts]);
    const handleOpen = useCallback(() => onOpen(template.id), [onOpen, template.id]);

    return (
        <Card
            key={template.id}
            className="cursor-pointer relative sm:shadow-none shadow-none  hover:shadow-lg transition-all duration-200 group overflow-hidden"
            onClick={handleOpen}
        >
            <span className="text-xs font-syne absolute top-2 flex gap-1 capitalize  items-center left-2 rounded-[100px]  px-2.5 py-1 bg-[#3A3A3AF5] text-white font-semibold  z-40">
                Layouts- {template.layouts.length}
            </span>
            <img src="/card_bg.svg" alt="" className="absolute top-0 left-0 w-full h-full object-cover" />
            <div className="p-5">
                <div className="grid grid-cols-2 gap-2">
                    {previewLayouts.map((layout: TemplateWithData, index: number) => {
                        const LayoutComponent = layout.component;
                        return (
                            <div
                                key={`${template.id}-preview-${index}`}
                                className="relative bg-gray-100 border border-gray-200 overflow-hidden aspect-video rounded"
                            >
                                <div className="absolute inset-0 bg-transparent z-10" />
                                <div
                                    className="transform scale-[0.12] origin-top-left"
                                    style={{ width: "833.33%", height: "833.33%" }}
                                >
                                    <LayoutComponent data={layout.sampleData} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex items-center justify-between  p-5 bg-white border-t border-[#EDEEEF] relative z-40 ">
                <div className="w-[191px]">

                    <h3 className="text-sm font-bold text-gray-900 capitalize">
                        {template.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                        {template.description}
                    </p>
                </div>
                <div className="flex items-center gap-2">

                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
            </div>
        </Card>
    );
});

const LayoutPreview = () => {
    const router = useRouter();

    useEffect(() => {
        const existingScript = document.querySelector('script[src*="tailwindcss.com"]');
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://cdn.tailwindcss.com";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    const handleOpenPreview = useCallback((id: string) => router.push(`/template-preview/${id}`), [router]);




    const inbuiltTemplateCards = useMemo(
        () =>
            templates.map((template: TemplateLayoutsWithSettings) => (
                <InbuiltTemplateCard key={template.id} template={template} onOpen={handleOpenPreview} />
            )),
        [handleOpenPreview],
    );

    return (
        <div className="min-h-screen  relative font-syne">
            <div
                className='fixed z-0 bottom-[-16.5rem] left-0 w-full h-full'
                style={{
                    height: "341px",
                    borderRadius: '1440px',
                    background: 'radial-gradient(5.92% 104.69% at 50% 100%, rgba(122, 90, 248, 0.00) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(122, 90, 248, 0.80) 0%, rgba(122, 90, 248, 0.00) 100%)',
                }}
            />
            <div className="sticky top-0 right-0 z-50 py-[28px] px-6   backdrop-blur ">
                <div className="flex xl:flex-row flex-col gap-6 xl:gap-0 items-center justify-between">
                    <h3 className=" text-[28px] tracking-[-0.84px] font-unbounded font-normal text-[#101828] flex items-center gap-2">
                        Templates
                    </h3>
                </div>
            </div>

            <div className="l mx-auto px-6 py-8">
                <section className="my-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {inbuiltTemplateCards}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LayoutPreview;
