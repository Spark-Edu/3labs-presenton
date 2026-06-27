"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CustomTemplatePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/templates");
  }, [router]);

  return null;
};

export default CustomTemplatePage;
