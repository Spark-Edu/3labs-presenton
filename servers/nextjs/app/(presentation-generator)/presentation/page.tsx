'use client'
import React, { useEffect } from "react";
import PresentationPage from "./components/PresentationPage";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
const page = () => {

  const router = useRouter();
  const params = useSearchParams();
  const queryId = params.get("id");
  const userId = params.get("userId");
  useEffect(() => {
    if (userId) localStorage.setItem("presenton_user_id", userId);
  }, [userId]);
  if (!queryId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen font-sans">
        <h1 className="text-2xl font-bold">No presentation id found</h1>
        <p className="text-gray-500 pb-4">Please try again</p>
        <Button onClick={() => router.push("/dashboard")}>Go to home</Button>
      </div>
    );
  }
  return (

    <PresentationPage presentation_id={queryId} />

  );
};
export default page;
