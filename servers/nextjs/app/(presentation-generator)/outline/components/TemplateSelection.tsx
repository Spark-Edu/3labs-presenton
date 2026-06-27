"use client";
import React, { useEffect, useMemo, useCallback, memo } from "react";

import { TemplateLayoutsWithSettings } from "@/app/presentation-templates/utils";
import { templates } from "@/app/presentation-templates";
import { Card } from "@/components/ui/card";
import { TemplateWithData } from "@/app/presentation-templates/utils";

// Memoized layout preview for built-in templates
const BuiltInLayoutPreview = memo(({ layout, templateId, index }: {
  layout: TemplateWithData;
  templateId: string;
  index: number;
}) => {
  const LayoutComponent = layout.component;
  return (
    <div
      className="relative bg-gray-100 font-sans border border-gray-200 overflow-hidden aspect-video rounded"
      style={{ contain: 'layout style paint' }}
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
});
BuiltInLayoutPreview.displayName = 'BuiltInLayoutPreview';

// Memoized built-in template card
const BuiltInTemplateCard = memo(({ template, isSelected, onSelect }: {
  template: TemplateLayoutsWithSettings;
  isSelected: boolean;
  onSelect: (template: TemplateLayoutsWithSettings) => void;
}) => {
  const previewLayouts = useMemo(() => template.layouts.slice(0, 4), [template.layouts]);
  const handleClick = useCallback(() => onSelect(template), [onSelect, template]);

  return (
    <Card
      className={`${isSelected ? 'border-2 border-blue-500' : ''} cursor-pointer relative hover:shadow-lg transition-all duration-200 group overflow-hidden`}
      onClick={handleClick}
    >
      <span className="text-xs font-sans absolute top-2 flex gap-1 capitalize items-center left-2 rounded-[100px] px-2.5 py-1 bg-[#3A3A3AF5] text-white font-semibold z-40">
        Layouts- {template.layouts.length}
      </span>
      <img src="/card_bg.svg" alt="" className="absolute top-0 left-0 w-full h-full object-cover" />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-2">
          {previewLayouts.map((layout: TemplateWithData, index: number) => (
            <BuiltInLayoutPreview
              key={`${template.id}-preview-${index}`}
              layout={layout}
              templateId={template.id}
              index={index}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between p-5 bg-white border-t border-[#EDEEEF] relative z-40">
        <div>
          <h3 className="text-sm font-bold text-gray-900 capitalize font-sans">
            {template.name}
          </h3>
          <p className="text-xs text-gray-600  line-clamp-2 font-sans">
            {template.description}
          </p>
        </div>
      </div>
    </Card>
  );
});
BuiltInTemplateCard.displayName = 'BuiltInTemplateCard';

interface TemplateSelectionProps {
  selectedTemplate: TemplateLayoutsWithSettings | null;
  onSelectTemplate: (template: TemplateLayoutsWithSettings) => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = memo(({
  selectedTemplate,
  onSelectTemplate
}) => {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src*="tailwindcss.com"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Stable callback for built-in template selection
  const handleBuiltInSelect = useCallback(
    (template: TemplateLayoutsWithSettings) => onSelectTemplate(template),
    [onSelectTemplate]
  );

  // Derive the selected built-in template id only when selectedTemplate changes
  const selectedBuiltInId = useMemo(
    () => selectedTemplate?.id ?? null,
    [selectedTemplate]
  );

  // Memoize the built-in templates list
  const builtInTemplateCards = useMemo(
    () =>
      templates.map((template: TemplateLayoutsWithSettings) => (
        <BuiltInTemplateCard
          key={template.id}
          template={template}
          isSelected={selectedBuiltInId === template.id}
          onSelect={handleBuiltInSelect}
        />
      )),
    [selectedBuiltInId, handleBuiltInSelect]
  );

  return (
    <div className="space-y-[30px] mb-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3 font-sans">Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {builtInTemplateCards}
        </div>
      </div>
    </div>
  );
});
TemplateSelection.displayName = 'TemplateSelection';

export default TemplateSelection;
