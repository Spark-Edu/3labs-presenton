import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setPresentationData } from "@/store/slices/presentationGeneration";
import { DashboardApi } from '../../services/api/dashboard';
import { clearHistory } from "@/store/slices/undoRedoSlice";
import { useFontLoader } from "../../hooks/useFontLoad";
import { Theme } from "../../services/api/types";
import { applyThemeFontStyles, getThemeFontConfig } from "../../utils/themeFonts";


export const usePresentationData = (
  presentationId: string,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void
) => {
  const dispatch = useDispatch();

  const themeVariables = [
    '--primary-color',
    '--background-color',
    '--card-color',
    '--stroke',
    '--primary-text',
    '--background-text',
    '--graph-0',
    '--graph-1',
    '--graph-2',
    '--graph-3',
    '--graph-4',
    '--graph-5',
    '--graph-6',
    '--graph-7',
    '--graph-8',
    '--graph-9',
    '--heading-font-family',
    '--body-font-family',
    '--theme-font-family',
  ];

  const clearTheme = () => {
    const element = document.getElementById('presentation-slides-wrapper')
    themeVariables.forEach((key) => {
      element?.style.removeProperty(key)
      document.documentElement.style.removeProperty(key)
    })
    element?.style.removeProperty('font-family')
    document.documentElement.style.removeProperty('font-family')
  }

  const applyTheme = async (theme: Theme) => {
    const element = document.getElementById('presentation-slides-wrapper')
    if (!element) return;
    if (!theme || !theme.data) { return; }
    if (!theme.data.colors['graph_0']) { return; }
    const cssVariables = {
      '--primary-color': theme.data.colors['primary'],
      '--background-color': theme.data.colors['background'],
      '--card-color': theme.data.colors['card'],
      '--stroke': theme.data.colors['stroke'],
      '--primary-text': theme.data.colors['primary_text'],
      '--background-text': theme.data.colors['background_text'],
      '--graph-0': theme.data.colors['graph_0'],
      '--graph-1': theme.data.colors['graph_1'],
      '--graph-2': theme.data.colors['graph_2'],
      '--graph-3': theme.data.colors['graph_3'],
      '--graph-4': theme.data.colors['graph_4'],
      '--graph-5': theme.data.colors['graph_5'],
      '--graph-6': theme.data.colors['graph_6'],
      '--graph-7': theme.data.colors['graph_7'],
      '--graph-8': theme.data.colors['graph_8'],
      '--graph-9': theme.data.colors['graph_9'],
    }
    Object.entries(cssVariables).forEach(([key, value]) => {
      element.style.setProperty(key, value)
      document.documentElement.style.setProperty(key, value)
    })
    const { fontsToLoad } = getThemeFontConfig(theme)
    useFontLoader(fontsToLoad)
    applyThemeFontStyles(element, theme)
    // Update the Presentation content with theme
  }

  const fetchUserSlides = useCallback(async () => {
    try {
      const data = await DashboardApi.getPresentation(presentationId);
      if (data) {
        dispatch(setPresentationData(data));
        dispatch(clearHistory());
        setLoading(false);
      }
      if (data?.theme?.data?.fonts) {
        applyTheme(data.theme);
      } else {
        clearTheme();
      }
    } catch (error) {
      setError(true);
      toast.error("Failed to load presentation");
      console.error("Error fetching user slides:", error);
      setLoading(false);
    }
  }, [presentationId, dispatch, setLoading, setError]);

  return {
    fetchUserSlides,
  };
};
