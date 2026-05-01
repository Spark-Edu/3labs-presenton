'use client';

import { useEffect, useState } from 'react';
import { setCanChangeKeys, setLLMConfig } from '@/store/slices/userConfig';
import { hasValidLLMConfig } from '@/utils/storeHelpers';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { checkIfSelectedOllamaModelIsPulled } from '@/utils/providerUtils';
import { LLMConfig } from '@/types/llm_config';

export function ConfigurationInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  // Capture userId from URL param and persist for API calls
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (userId) {
      localStorage.setItem('presenton_user_id', userId);
    }
  }, []);
  const router = useRouter();
  const route = usePathname();

  // Fetch user config state
  useEffect(() => {
    fetchUserConfigState();
  }, []);

  const setLoadingToFalseAfterNavigatingTo = (pathname: string) => {
    const interval = setInterval(() => {
      if (window.location.pathname === pathname) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 500);
  }

  const fetchUserConfigState = async () => {
    setIsLoading(true);
    const response = await fetch('/api/can-change-keys');
    const canChangeKeys = (await response.json()).canChange;
    dispatch(setCanChangeKeys(canChangeKeys));

    if (canChangeKeys) {
      const response = await fetch('/api/user-config');
      const llmConfig = await response.json();
      if (!llmConfig.LLM) {
        llmConfig.LLM = 'openai';
      }
      if (!llmConfig.IMAGE_PROVIDER) {
        llmConfig.IMAGE_PROVIDER = 'gpt-image-1.5';
      }
      dispatch(setLLMConfig(llmConfig));
      const isValid = hasValidLLMConfig(llmConfig);
      if (isValid) {
        // Check if the selected Ollama model is pulled
        if (llmConfig.LLM === 'ollama') {
          const isPulled = await checkIfSelectedOllamaModelIsPulled(llmConfig.OLLAMA_MODEL);
          if (!isPulled) {
            router.push('/');
            setLoadingToFalseAfterNavigatingTo('/');
            return;
          }
        }
        if (llmConfig.LLM === 'custom') {
          const isAvailable = await checkIfSelectedCustomModelIsAvailable(llmConfig);
          if (!isAvailable) {
            router.push('/');
            setLoadingToFalseAfterNavigatingTo('/');
            return;
          }
        }
        if (route === '/') {
          router.push('/upload');
          setLoadingToFalseAfterNavigatingTo('/upload');
        } else {
          setIsLoading(false);
        }
      } else if (route !== '/') {
        router.push('/');
        setLoadingToFalseAfterNavigatingTo('/');
      } else {
        setIsLoading(false);
      }
    } else {
      if (route === '/') {
        router.push('/upload');
        setLoadingToFalseAfterNavigatingTo('/upload');
      } else {
        setIsLoading(false);
      }
    }
  }


  const checkIfSelectedCustomModelIsAvailable = async (llmConfig: LLMConfig) => {
    try {
      const response = await fetch('/api/v1/ppt/openai/models/available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: llmConfig.CUSTOM_LLM_URL,
          api_key: llmConfig.CUSTOM_LLM_API_KEY,
        }),
      });
      const data = await response.json();
      return data.includes(llmConfig.CUSTOM_MODEL);
    } catch (error) {
      console.error('Error fetching custom models:', error);
      return false;
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 text-center">
            {/* Logo/Branding */}
            <div className="mb-6">
              <span className="text-2xl font-bold text-[#1a5c3a] font-inter">3Labs</span>
              <div className="w-16 h-1 bg-[#1a5c3a] mx-auto rounded-full mt-2"></div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 font-inter">
                Đang tải trình soạn thảo...
              </h3>
              <p className="text-sm text-gray-500 font-inter">
                Vui lòng chờ trong giây lát.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
