import React from "react";

import UploadPage from "./components/UploadPage";
import Header from "@/app/(presentation-generator)/(dashboard)/dashboard/components/Header";
import { Metadata } from "next";
import { resolveUploadLocale, uploadCopy } from "./i18n";

export const metadata: Metadata = {
  title: "Presenton | Open Source AI presentation generator",
  description:
    "Open-source AI presentation generator with custom layouts, multi-model support (OpenAI, Gemini, Ollama), and PDF/PPTX export. A free Gamma alternative.",
  alternates: {
    canonical: "https://presenton.ai/create",
  },
  keywords: [
    "presentation generator",
    "AI presentations",
    "data visualization",
    "automatic presentation maker",
    "professional slides",
    "data-driven presentations",
    "document to presentation",
    "presentation automation",
    "smart presentation tool",
    "business presentations",
  ],
  openGraph: {
    title: "Create Data Presentation | PresentOn",
    description:
      "Open-source AI presentation generator with custom layouts, multi-model support (OpenAI, Gemini, Ollama), and PDF/PPTX export. A free Gamma alternative.",
    type: "website",
    url: "https://presenton.ai/create",
    siteName: "PresentOn",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Data Presentation | PresentOn",
    description:
      "Open-source AI presentation generator with custom layouts, multi-model support (OpenAI, Gemini, Ollama), and PDF/PPTX export. A free Gamma alternative.",
    site: "@presenton_ai",
    creator: "@presenton_ai",
  },
};

const page = ({ searchParams }: { searchParams?: { ui_locale?: string } }) => {
  const copy = uploadCopy[resolveUploadLocale(searchParams?.ui_locale)];

  return (
    <div className="relative">
      <Header />
      <div className="flex flex-col items-center justify-center  mb-8">
        <h1 className="text-[64px] font-normal font-sans text-[#101323] ">
          {copy.hero.title}
        </h1>
        <p className="text-xl font-sans text-[#101323CC]">{copy.hero.subtitle}</p>
      </div>

      <UploadPage />
    </div>
  );
};

export default page;
