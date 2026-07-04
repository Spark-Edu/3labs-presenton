import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function PromptInput({ value, onChange, placeholder }: PromptInputProps) {


  const handleChange = (val: string) => {

    onChange(val);
  };

  return (
    <div className="space-y-2 font-sans">
      <div className="relative">
        <Textarea
          value={value}
          rows={5}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          data-testid="prompt-input"
          className={`py-4 px-5 border-2 font-medium font-instrument_sans text-base min-h-[150px] max-h-[300px] border-[#5146E5] focus-visible:ring-offset-0  focus-visible:ring-[#5146E5] overflow-y-auto  custom_scrollbar  `}
        />
      </div>

    </div>
  );
}
