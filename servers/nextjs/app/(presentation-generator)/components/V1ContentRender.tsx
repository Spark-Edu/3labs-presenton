"use client";

import React, { useMemo, useRef } from "react";
import EditableLayoutWrapper from "../components/EditableLayoutWrapper";
import SlideErrorBoundary from "../components/SlideErrorBoundary";
import TiptapTextReplacer from "../components/TiptapTextReplacer";
import { validate as uuidValidate } from 'uuid';
import { getLayoutByLayoutId } from "@/app/presentation-templates";
import { useCustomTemplateDetails } from "@/app/hooks/useCustomTemplates";
import { updateSlideContent } from "@/store/slices/presentationGeneration";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Loader2 } from "lucide-react";
import { getThemeFontConfig } from "../utils/themeFonts";

function getThemeBrand(theme?: any) {
    const brand = theme?.data?.brand ?? {};
    return {
        companyName: theme?.company_name || brand.companyName || null,
        companyWebsite: theme?.company_website || brand.website || null,
        logoUrl: theme?.logo_url || brand.logoUrl || null,
    };
}

function ThemeBrandOverlay({ theme }: { theme?: any }) {
    const { companyName, companyWebsite, logoUrl } = getThemeBrand(theme);
    const hasBrand = Boolean(companyName || companyWebsite || logoUrl);

    if (!hasBrand) return null;

    return (
        <div className="pointer-events-none absolute bottom-5 left-8 right-8 z-40 flex items-end justify-between gap-4 text-[13px] leading-none">
            <div className="flex min-w-0 items-center gap-2">
                {logoUrl && (
                    <img
                        src={logoUrl}
                        alt=""
                        className="h-6 max-w-[96px] object-contain"
                    />
                )}
                {companyName && (
                    <span
                        className="max-w-[280px] truncate font-semibold opacity-80"
                        style={{ color: "var(--background-text, #111827)" }}
                    >
                        {companyName}
                    </span>
                )}
            </div>
            {companyWebsite && (
                <span
                    className="max-w-[320px] truncate text-right font-medium opacity-70"
                    style={{ color: "var(--background-text, #111827)" }}
                >
                    {companyWebsite}
                </span>
            )}
        </div>
    );
}

function ThemeFontScope() {
    return (
        <style>{`
            .presenton-theme-font-scope,
            .presenton-theme-font-scope .font-sans,
            .presenton-theme-font-scope .font-inter,
            .presenton-theme-font-scope .font-instrument_sans {
                font-family: var(--body-font-family, var(--theme-font-family, Inter, Arial, sans-serif)) !important;
            }

            .presenton-theme-font-scope h1,
            .presenton-theme-font-scope h2,
            .presenton-theme-font-scope h3,
            .presenton-theme-font-scope [data-theme-heading="true"] {
                font-family: var(--heading-font-family, var(--body-font-family, Inter, Arial, sans-serif)) !important;
            }
        `}</style>
    );
}



export const V1ContentRender = ({ slide, isEditMode, theme }: { slide: any, isEditMode: boolean, theme?: any, enableEditMode?: boolean }) => {
    const dispatch = useDispatch();
    const presentationTheme = useSelector((state: RootState) => state.presentationGeneration.presentationData?.theme);
    const resolvedTheme = theme ?? presentationTheme;
    const hasThemeFonts = Boolean(resolvedTheme?.data?.fonts);
    const { headingStack, bodyStack } = getThemeFontConfig(resolvedTheme);
    const themeFontStyle = hasThemeFonts ? {
        fontFamily: bodyStack,
        "--theme-font-family": bodyStack,
        "--heading-font-family": headingStack,
        "--body-font-family": bodyStack,
    } as React.CSSProperties : undefined;
    const containerRef = useRef<HTMLDivElement | null>(null);


    const customTemplateId = slide.layout_group.startsWith("custom-") ? slide.layout_group.split("custom-")[1] : slide.layout_group;
    const isCustomTemplate = uuidValidate(customTemplateId) || slide.layout_group.startsWith("custom-");

    // Always call the hook (React hooks rule), but with empty id when not a custom template
    const { template: customTemplate, loading: customLoading, fonts } = useCustomTemplateDetails({
        id: isCustomTemplate ? customTemplateId : "",
        name: isCustomTemplate ? slide.layout_group : "",
        description: ""
    });
    if (fonts && typeof fonts === 'object') {
        // useFontLoader(fonts as unknown as Record<string, string>);
    }

    // Memoize layout resolution to prevent unnecessary recalculations
    const Layout = useMemo(() => {
        if (isCustomTemplate) {
            if (customTemplate) {
                const layoutId = slide.layout.startsWith("custom-") ? slide.layout.split(":")[1] : slide.layout;


                const compiledLayout = customTemplate.layouts.find(
                    (layout) => layout.layoutId === layoutId
                );


                return compiledLayout?.component ?? null;
            }
            return null;
        } else {
            const template = getLayoutByLayoutId(slide.layout);
            return template?.component ?? null;
        }
    }, [isCustomTemplate, customTemplate, slide.layout]);

    // Show loading state for custom templates
    if (isCustomTemplate && customLoading) {
        return (
            <div className="flex flex-col items-center justify-center aspect-video h-full bg-gray-100 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }


    if (!Layout) {
        if (Object.keys(slide.content).length === 0) {
            return (
                <div className="flex flex-col items-center cursor-pointer justify-center aspect-video h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-600 text-center text-base">Blank Slide</p>
                    <p className="text-gray-600 text-center text-sm">This slide is empty. Please add content to it using the edit button.</p>
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center justify-center aspect-video h-full bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-center text-base">
                    Layout &quot;{slide.layout}&quot; not found in &quot;
                    {slide.layout_group}&quot; Template
                </p>
            </div>
        );
    }
    const LayoutComp = Layout as React.ComponentType<{ data: any }>;
    const layoutData = {
        ...slide.content,
        _logo_url__: null,
        __companyName__: null,
        __companyWebsite__: null,
    };

    if (isEditMode) {
        return (
            <SlideErrorBoundary label={`Slide ${slide.index + 1}`}>
                <div ref={containerRef} className={hasThemeFonts ? "presenton-theme-font-scope relative" : "relative"} style={themeFontStyle}>
                    {hasThemeFonts && <ThemeFontScope />}

                    <EditableLayoutWrapper
                        slideIndex={slide.index}
                        slideData={slide.content}
                        properties={slide.properties}
                    >
                        <TiptapTextReplacer
                            key={slide.id}
                            slideData={slide.content}
                            slideIndex={slide.index}
                            onContentChange={(
                                content: string,
                                dataPath: string,
                                slideIndex?: number
                            ) => {
                                if (dataPath && slideIndex !== undefined) {
                                    dispatch(
                                        updateSlideContent({
                                            slideIndex: slideIndex,
                                            dataPath: dataPath,
                                            content: content,
                                        })
                                    );
                                }
                            }}
                        >
                            <LayoutComp data={layoutData} />
                        </TiptapTextReplacer>
                    </EditableLayoutWrapper>
                    <ThemeBrandOverlay theme={resolvedTheme} />



                </div>
            </SlideErrorBoundary>

        );
    }
    return (
        <div className={hasThemeFonts ? "presenton-theme-font-scope relative h-full w-full" : "relative h-full w-full"} style={themeFontStyle}>
            {hasThemeFonts && <ThemeFontScope />}
            <LayoutComp data={layoutData} />
            <ThemeBrandOverlay theme={resolvedTheme} />
        </div>
    )
};
