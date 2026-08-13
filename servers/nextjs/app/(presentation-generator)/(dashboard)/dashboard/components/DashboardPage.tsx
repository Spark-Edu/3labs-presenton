"use client";

import React, { useState, useEffect } from "react";

import { DashboardApi } from "@/app/(presentation-generator)/services/api/dashboard";
import { PresentationGrid } from "@/app/(presentation-generator)/(dashboard)/dashboard/components/PresentationGrid";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type DashboardTab = "course" | "independent";

const DashboardPage: React.FC = () => {
  const [presentations, setPresentations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // "Course/Lesson" groups decks 3labs-api has linked to a lesson
  // (lesson_id set); "Independent" is everything else, including every deck
  // that predates this field — see dashboard.ts's PresentationResponse.
  const [tab, setTab] = useState<DashboardTab>("independent");

  useEffect(() => {
    const loadData = async () => {
      await fetchPresentations();
    };
    loadData();
  }, []);

  const fetchPresentations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DashboardApi.getPresentations();
      data.sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setPresentations(data);
    } catch (err) {
      setError(null);
      setPresentations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removePresentation = (presentationId: string) => {
    setPresentations((prev: any) =>
      prev ? prev.filter((p: any) => p.id !== presentationId) : []
    );
  };

  const courseCount = presentations
    ? presentations.filter((p: any) => !!p.lesson_id).length
    : 0;
  const independentCount = presentations
    ? presentations.filter((p: any) => !p.lesson_id).length
    : 0;
  const visiblePresentations = presentations
    ? presentations.filter((p: any) => (tab === "course" ? !!p.lesson_id : !p.lesson_id))
    : presentations;

  return (
    <div className="min-h-screen  w-full px-6 pb-10 relative">
      <div className="sticky top-0 right-0 z-50 py-[28px]   backdrop-blur mb-4 ">
        <div className="flex xl:flex-row flex-col gap-6 xl:gap-0 items-center justify-between">
          <h3 className=" text-[28px] tracking-[-0.84px] font-sans font-normal text-[#101828] flex items-center gap-2">

            Slide Presentations
          </h3>
          <div className="flex  gap-2.5 max-sm:w-full max-md:justify-center max-sm:flex-wrap">



            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-black text-sm font-semibold font-sans shadow-sm hover:shadow-md"
              aria-label="Create new presentation"
              style={{
                borderRadius: "48px",
                background: "linear-gradient(270deg, #D5CAFC 2.4%, #E3D2EB 27.88%, #F4DCD3 69.23%, #FDE4C2 100%)",
              }}
            >

              <span className="hidden md:inline">New presentation</span>
              <span className="md:hidden">New</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            {/* {
              <Link
                href="/theme?tab=new-theme"
                className="inline-flex items-center font-inter font-normal gap-2 rounded-xl px-4 py-2.5 text-black text-sm  shadow-sm hover:shadow-md"
                aria-label="Create new themes"
                style={{
                  borderRadius: "48px",
                  background: "linear-gradient(270deg, #D5CAFC 2.4%, #E3D2EB 27.88%, #F4DCD3 69.23%, #FDE4C2 100%)",
                }}
              >
                <span className="hidden md:inline">New Themes</span>
                <span className="md:hidden">New</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            } */}
          </div>
        </div>
      </div>
      {!isLoading && !error && (
        <div className="mb-6 p-1 rounded-[40px] bg-[#F7F6F9] w-fit border border-[#F4F4F4] flex items-center justify-center">
          <button
            className="px-5 py-2 text-xs font-medium text-[#3A3A3A] rounded-[70px]"
            onClick={() => setTab("independent")}
            style={{
              background: tab === "independent" ? "linear-gradient(270deg, #D5CAFC 2.4%, #E3D2EB 27.88%, #F4DCD3 69.23%, #FDE4C2 100%)" : "transparent",
            }}
          >
            Independent ({independentCount})
          </button>
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-1" width="2" height="17" viewBox="0 0 2 17" fill="none">
            <path d="M1 0V16.5" stroke="#EDECEC" strokeWidth="2" />
          </svg>
          <button
            className="px-5 py-2 text-xs font-medium text-[#3A3A3A] rounded-[70px]"
            onClick={() => setTab("course")}
            style={{
              background: tab === "course" ? "linear-gradient(270deg, #D5CAFC 2.4%, #E3D2EB 27.88%, #F4DCD3 69.23%, #FDE4C2 100%)" : "transparent",
            }}
          >
            Course/Lesson ({courseCount})
          </button>
        </div>
      )}
      <PresentationGrid
        presentations={visiblePresentations}
        type="slide"
        isLoading={isLoading}
        error={error}
        onPresentationDeleted={removePresentation}
      />
      <div
        className='fixed z-0 bottom-[-16.5rem] left-0 w-full h-full'
        style={{
          height: "341px",
          borderRadius: '1440px',
          background: 'radial-gradient(5.92% 104.69% at 50% 100%, rgba(122, 90, 248, 0.00) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(122, 90, 248, 0.80) 0%, rgba(122, 90, 248, 0.00) 100%)',
        }}
      />
    </div>
  );
};

export default DashboardPage;
