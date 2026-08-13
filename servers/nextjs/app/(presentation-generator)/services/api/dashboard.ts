import {
  getHeader,
} from "@/app/(presentation-generator)/services/api/header";
import { ApiResponseHandler } from "@/app/(presentation-generator)/services/api/api-error-handler";

export interface PresentationResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  data: any | null;
  file: string;
  n_slides: number;
  prompt: string;
  summary: string | null;
  theme: Record<string, any> | null;
  titles: string[];
  user_id: string;
  vector_store: any;

  thumbnail: string;
  slides: any[];

  // Set only by 3labs-api's save-to-library flow when this deck is linked to
  // a 3Labs course lesson (see servers/fastapi/models/sql/presentation.py).
  // Absent/null means "not known to be lesson-linked" — used to split the
  // dashboard into Course/Lesson vs. Independent tabs.
  lesson_id?: string | null;
  course_id?: string | null;
  lesson_title?: string | null;
  course_title?: string | null;
}

export class DashboardApi {

  static async getPresentations(): Promise<PresentationResponse[]> {
    try {
      // Was sending no headers at all, so the backend's `X-User-Id` header
      // defaulted to "local" (see presentation.py's get_all_presentations,
      // which filters `WHERE user_id == x_user_id`) instead of the real
      // signed-in identity every other call here sends via getHeader() —
      // meaning presentations created under the real user_id never matched
      // this listing query and never showed up on the dashboard.
      const response = await fetch(
        `/api/v1/ppt/presentation/all`,
        {
          method: "GET",
          headers: getHeader(),
        }
      );

      // Handle the special case where 404 means "no presentations found"
      if (response.status === 404) {
        console.log("No presentations found");
        return [];
      }

      return await ApiResponseHandler.handleResponse(response, "Failed to fetch presentations");
    } catch (error) {
      console.error("Error fetching presentations:", error);
      throw error;
    }
  }

  static async getPresentation(id: string) {
    try {
      const response = await fetch(
        `/api/v1/ppt/presentation/${id}`,
        {
          method: "GET",
          headers: getHeader(),
        }
      );

      return await ApiResponseHandler.handleResponse(response, "Presentation not found");
    } catch (error) {
      console.error("Error fetching presentation:", error);
      throw error;
    }
  }

  static async deletePresentation(presentation_id: string) {
    try {
      const response = await fetch(
        `/api/v1/ppt/presentation/${presentation_id}`,
        {
          method: "DELETE",
          headers: getHeader(),
        }
      );

      return await ApiResponseHandler.handleResponseWithResult(response, "Failed to delete presentation");
    } catch (error) {
      console.error("Error deleting presentation:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete presentation",
      };
    }
  }
}
