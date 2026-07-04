export type UploadLocale = "en" | "vi";

export function readUploadLocale(value?: string | null): UploadLocale | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.startsWith("vi")) return "vi";
  if (normalized.startsWith("en")) return "en";
  return null;
}

export function resolveUploadLocale(value?: string | null, fallback: UploadLocale = "en"): UploadLocale {
  return readUploadLocale(value) ?? fallback;
}

export const uploadCopy = {
  en: {
    hero: {
      title: "AI Presentation",
      subtitle: "Choose a design, set preferences, and generate polished slides.",
    },
    config: {
      title: "Configuration",
      subtitle: "Choose slides, tone, and language preferences.",
      slidesPlaceholder: "Select Slides",
      slidesUnit: "slides",
      languagePlaceholder: "Select language",
      languageSearch: "Search language...",
      languageEmpty: "No language found.",
      advanced: "Advanced settings",
      tone: "Tone",
      toneDescription: "Controls the writing style (e.g., casual, professional, funny).",
      tonePlaceholder: "Select tone",
      verbosity: "Verbosity",
      verbosityDescription: "Controls how detailed slide descriptions are: concise, standard, or text-heavy.",
      verbosityPlaceholder: "Select verbosity",
      includeTableOfContents: "Include table of contents",
      includeTableOfContentsDescription: "Add an index slide summarizing sections (requires 3+ slides).",
      titleSlide: "Title slide",
      titleSlideDescription: "Include a title slide as the first slide.",
      webSearch: "Web search",
      webSearchDescription: "Allow the model to consult the web for fresher facts.",
      instructions: "Instructions",
      instructionsDescription: "Optional guidance for the AI. These override defaults except format constraints.",
      instructionsPlaceholder:
        "Example: Focus on enterprise buyers, emphasize ROI and security compliance. Keep slides data-driven, avoid jargon, and include a short call-to-action on the final slide.",
      cancel: "Cancel",
      save: "Save",
    },
    content: {
      title: "Content",
      promptPlaceholder: "Tell us about your presentation",
    },
    attachments: {
      title: "Attachments (optional)",
      none: "No attachments yet",
      count: (count: number) => `${count} attachment${count > 1 ? "s" : ""}`,
      clearAll: "Clear all",
      dropPrefix: "Drag and drop PDF, TXT, PPTX, DOCX, or",
      browse: "click to browse",
      listLabel: "Attached files",
      previewAlt: "Preview",
      remove: (name: string) => `Remove ${name}`,
      skipped: "Some files were skipped. Only PDF, TXT, PPTX, and DOCX files are supported.",
      unsupportedTitle: "Some files are not supported",
      unsupportedDescription: "Only PDF, TXT, PPTX, and DOCX files are allowed.",
      selectedTitle: "Files selected",
      selectedDescription: (count: number) => `${count} file(s) have been added`,
    },
    actions: {
      generate: "Generate Presentation",
    },
    loading: {
      processingDocuments: "Processing documents...",
      processingExtra: "It might take a few minutes for large documents.",
      generatingOutlines: "Generating outlines...",
    },
    validation: {
      missingConfig: "Please select number of Slides & Language",
      missingSource: "No Prompt or Document Provided",
      errorTitle: "Error",
      genericError: "Error in upload page.",
    },
  },
  vi: {
    hero: {
      title: "Tạo bài thuyết trình bằng AI",
      subtitle: "Chọn thiết kế, thiết lập tùy chọn và tạo slide hoàn chỉnh.",
    },
    config: {
      title: "Cấu hình",
      subtitle: "Chọn số slide, giọng văn và ngôn ngữ.",
      slidesPlaceholder: "Chọn số slide",
      slidesUnit: "slide",
      languagePlaceholder: "Chọn ngôn ngữ",
      languageSearch: "Tìm ngôn ngữ...",
      languageEmpty: "Không tìm thấy ngôn ngữ.",
      advanced: "Cài đặt nâng cao",
      tone: "Giọng văn",
      toneDescription: "Điều chỉnh phong cách viết, ví dụ: thân thiện, chuyên nghiệp, hài hước.",
      tonePlaceholder: "Chọn giọng văn",
      verbosity: "Độ chi tiết",
      verbosityDescription: "Điều chỉnh mức độ chi tiết của nội dung slide: ngắn gọn, tiêu chuẩn hoặc nhiều chữ.",
      verbosityPlaceholder: "Chọn độ chi tiết",
      includeTableOfContents: "Thêm mục lục",
      includeTableOfContentsDescription: "Thêm slide tóm tắt các phần chính (cần ít nhất 3 slide).",
      titleSlide: "Slide tiêu đề",
      titleSlideDescription: "Thêm slide tiêu đề ở đầu bài thuyết trình.",
      webSearch: "Tìm kiếm web",
      webSearchDescription: "Cho phép mô hình tham khảo web để cập nhật thông tin mới hơn.",
      instructions: "Hướng dẫn",
      instructionsDescription: "Hướng dẫn tùy chọn cho AI. Nội dung này ưu tiên hơn mặc định, trừ ràng buộc định dạng.",
      instructionsPlaceholder:
        "Ví dụ: Tập trung vào người mua doanh nghiệp, nhấn mạnh ROI và tuân thủ bảo mật. Giữ nội dung dựa trên dữ liệu, tránh thuật ngữ khó hiểu và thêm lời kêu gọi hành động ngắn ở slide cuối.",
      cancel: "Hủy",
      save: "Lưu",
    },
    content: {
      title: "Nội dung",
      promptPlaceholder: "Nhập mô tả cho bài thuyết trình",
    },
    attachments: {
      title: "Tệp đính kèm (tùy chọn)",
      none: "Chưa có tệp đính kèm",
      count: (count: number) => `${count} tệp đính kèm`,
      clearAll: "Xóa tất cả",
      dropPrefix: "Kéo thả PDF, TXT, PPTX, DOCX, hoặc",
      browse: "bấm để chọn tệp",
      listLabel: "Tệp đã đính kèm",
      previewAlt: "Xem trước",
      remove: (name: string) => `Xóa ${name}`,
      skipped: "Một số tệp đã bị bỏ qua. Chỉ hỗ trợ PDF, TXT, PPTX và DOCX.",
      unsupportedTitle: "Một số tệp không được hỗ trợ",
      unsupportedDescription: "Chỉ cho phép tệp PDF, TXT, PPTX và DOCX.",
      selectedTitle: "Đã chọn tệp",
      selectedDescription: (count: number) => `Đã thêm ${count} tệp`,
    },
    actions: {
      generate: "Tạo bài thuyết trình",
    },
    loading: {
      processingDocuments: "Đang xử lý tài liệu...",
      processingExtra: "Tài liệu lớn có thể mất vài phút để xử lý.",
      generatingOutlines: "Đang tạo dàn ý...",
    },
    validation: {
      missingConfig: "Vui lòng chọn số slide và ngôn ngữ",
      missingSource: "Vui lòng nhập prompt hoặc tải tài liệu",
      errorTitle: "Lỗi",
      genericError: "Đã xảy ra lỗi khi tạo bài thuyết trình.",
    },
  },
} as const;

export type UploadCopy = (typeof uploadCopy)[UploadLocale];
