import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearPresentationData } from "@/store/slices/presentationGeneration";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { Template, LoadingState, TABS } from "../types/index";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";
import { TemplateLayoutsWithSettings } from "@/app/presentation-templates/utils";
import { getCustomTemplateDetails } from "@/app/hooks/useCustomTemplates";

// Default theme per built-in template so colors persist after generation
const TEMPLATE_THEME_MAP: Record<string, object> = {
  general: { data: { colors: { primary: "#2563eb", background: "#ffffff", card: "#dbeafe", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#1e293b", graph_0: "#2563eb", graph_1: "#3b82f6", graph_2: "#60a5fa", graph_3: "#93c5fd", graph_4: "#bfdbfe", graph_5: "#dbeafe", graph_6: "#eff6ff", graph_7: "#f1f5f9", graph_8: "#e2e8f0", graph_9: "#cbd5e1" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  modern: { data: { colors: { primary: "#0f172a", background: "#ffffff", card: "#f1f5f9", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#0f172a", graph_0: "#0ea5e9", graph_1: "#38bdf8", graph_2: "#7dd3fc", graph_3: "#bae6fd", graph_4: "#e0f2fe", graph_5: "#f0f9ff", graph_6: "#e2e8f0", graph_7: "#cbd5e1", graph_8: "#94a3b8", graph_9: "#64748b" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  standard: { data: { colors: { primary: "#7c3aed", background: "#ffffff", card: "#ede9fe", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#1e1b4b", graph_0: "#7c3aed", graph_1: "#8b5cf6", graph_2: "#a78bfa", graph_3: "#c4b5fd", graph_4: "#ddd6fe", graph_5: "#ede9fe", graph_6: "#f5f3ff", graph_7: "#f1f5f9", graph_8: "#e2e8f0", graph_9: "#cbd5e1" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  swift: { data: { colors: { primary: "#059669", background: "#ffffff", card: "#d1fae5", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#064e3b", graph_0: "#059669", graph_1: "#10b981", graph_2: "#34d399", graph_3: "#6ee7b7", graph_4: "#a7f3d0", graph_5: "#d1fae5", graph_6: "#ecfdf5", graph_7: "#f1f5f9", graph_8: "#e2e8f0", graph_9: "#cbd5e1" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  "neo-general": { data: { colors: { primary: "#1d4ed8", background: "#f8fafc", card: "#dbeafe", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#1e293b", graph_0: "#1d4ed8", graph_1: "#2563eb", graph_2: "#3b82f6", graph_3: "#60a5fa", graph_4: "#93c5fd", graph_5: "#bfdbfe", graph_6: "#dbeafe", graph_7: "#eff6ff", graph_8: "#f1f5f9", graph_9: "#e2e8f0" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  "neo-standard": { data: { colors: { primary: "#16a34a", background: "#f0fdf4", card: "#bbf7d0", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#14532d", graph_0: "#16a34a", graph_1: "#22c55e", graph_2: "#4ade80", graph_3: "#86efac", graph_4: "#bbf7d0", graph_5: "#dcfce7", graph_6: "#f0fdf4", graph_7: "#f1f5f9", graph_8: "#e2e8f0", graph_9: "#cbd5e1" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  "neo-modern": { data: { colors: { primary: "#be123c", background: "#fff1f2", card: "#fecdd3", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#4c0519", graph_0: "#be123c", graph_1: "#e11d48", graph_2: "#f43f5e", graph_3: "#fb7185", graph_4: "#fda4af", graph_5: "#fecdd3", graph_6: "#fff1f2", graph_7: "#f1f5f9", graph_8: "#e2e8f0", graph_9: "#cbd5e1" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
  "neo-swift": { data: { colors: { primary: "#b45309", background: "#fffbeb", card: "#fde68a", stroke: "#e2e8f0", primary_text: "#ffffff", background_text: "#451a03", graph_0: "#b45309", graph_1: "#d97706", graph_2: "#f59e0b", graph_3: "#fbbf24", graph_4: "#fcd34d", graph_5: "#fde68a", graph_6: "#fef3c7", graph_7: "#f1f5f9", graph_8: "#e2e8f0", graph_9: "#cbd5e1" }, fonts: { textFont: { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" } } } },
};

const DEFAULT_LOADING_STATE: LoadingState = {
  message: "",
  isLoading: false,
  showProgress: false,
  duration: 0,
};

export const usePresentationGeneration = (
  presentationId: string | null,
  outlines: { content: string }[] | null,
  selectedTemplate: TemplateLayoutsWithSettings | string | null,
  setActiveTab: (tab: string) => void
) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>(DEFAULT_LOADING_STATE);

  const validateInputs = useCallback(() => {
    if (!outlines || outlines.length === 0) {
      toast.error("No Outlines", {
        description: "Please wait for outlines to load before generating presentation",
      });
      return false;
    }

    if (!selectedTemplate) {
      toast.error("Select Layout Group", {
        description: "Please select a layout group before generating presentation",
      });
      return false;
    }


    return true;
  }, [outlines, selectedTemplate]);



  const clearTheme = () => {
    const element = document.getElementById('presentation-page')
    if (!element) return;
    element.style.removeProperty('--primary-color');
    element.style.removeProperty('--background-color');
    element.style.removeProperty('--card-color');
    element.style.removeProperty('--stroke');
    element.style.removeProperty('--primary-text');
    element.style.removeProperty('--background-text');
    element.style.removeProperty('--graph-0');
    element.style.removeProperty('--graph-1');
    element.style.removeProperty('--graph-2');
    element.style.removeProperty('--graph-3');
    element.style.removeProperty('--graph-4');
    element.style.removeProperty('--graph-5');
    element.style.removeProperty('--graph-6');
    element.style.removeProperty('--graph-7');
    element.style.removeProperty('--graph-8');
    element.style.removeProperty('--graph-9');

  }

  const handleSubmit = useCallback(async () => {
    if (!selectedTemplate) {
      setActiveTab(TABS.LAYOUTS);
      return;
    }
    if (!validateInputs()) return;

    setLoadingState({
      message: "Generating presentation data...",
      isLoading: true,
      showProgress: true,
      duration: 30,
    });

    try {
      let layout;

      // Check if it's a custom template (string = presentationId)
      if (typeof selectedTemplate === 'string') {
        setLoadingState({
          message: "Loading custom template...",
          isLoading: true,
          showProgress: true,
          duration: 30,
        });

        // Fetch custom template details using the shared function
        const customTemplateDetail = await getCustomTemplateDetails(selectedTemplate);

        if (!customTemplateDetail || customTemplateDetail.layouts.length === 0) {
          toast.error("Template Error", {
            description: "Failed to load custom template layouts",
          });
          return;
        }

        setLoadingState({
          message: "Generating presentation data...",
          isLoading: true,
          showProgress: true,
          duration: 30,
        });

        layout = {
          name: customTemplateDetail.id,
          ordered: false,
          slides: customTemplateDetail.layouts.map((compiledLayout) => ({
            id: customTemplateDetail.id.startsWith('custom-') ? `${customTemplateDetail.id}:${compiledLayout.layoutId}` : `custom-${customTemplateDetail.id}:${compiledLayout.layoutId}`,
            name: compiledLayout.layoutName,
            description: compiledLayout.layoutDescription,
            templateID: customTemplateDetail.id,
            templateName: customTemplateDetail.name,
            json_schema: compiledLayout.schemaJSON,
          }))
        };
      } else {
        // Built-in template
        layout = {
          name: selectedTemplate.id,
          ordered: false,
          slides: selectedTemplate.layouts.map((layoutItem: any) => ({
            id: layoutItem.layoutId,
            name: layoutItem.layoutName,
            description: layoutItem.layoutDescription,
            templateID: selectedTemplate.id,
            templateName: selectedTemplate.name,
            json_schema: layoutItem.schemaJSON,
          }))
        };
      }

      // Write matching theme before generation so editor loads correct colors
      const templateId = typeof selectedTemplate === 'string' ? null : selectedTemplate?.id ?? null;
      const matchedTheme = templateId ? TEMPLATE_THEME_MAP[templateId] ?? null : null;
      if (matchedTheme && presentationId) {
        await PresentationGenerationApi.updatePresentationContent({ id: presentationId, theme: matchedTheme });
      }

      const response = await PresentationGenerationApi.presentationPrepare({
        presentation_id: presentationId,
        outlines: outlines,
        layout: layout,
      });

      if (response) {
        dispatch(clearPresentationData());
        clearTheme();
        window.parent.postMessage({ type: '3labs_presentation_ready', presentationId }, '*');
        router.replace(`/presentation?id=${presentationId}&stream=true&type=standard`);
      }
    } catch (error: any) {
      console.error('Error In Presentation Generation(prepare).', error);
      toast.error("Generation Error", {
        description: error.message || "Error In Presentation Generation(prepare).",
      });
    } finally {
      setLoadingState(DEFAULT_LOADING_STATE);
    }
  }, [validateInputs, presentationId, outlines, dispatch, router, selectedTemplate]);

  return { loadingState, handleSubmit };
}; 