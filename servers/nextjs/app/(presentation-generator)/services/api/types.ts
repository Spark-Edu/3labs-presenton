export interface ChartAssignmentResponse {
    title_with_charts: {
        title: string;
        graph_id: string | null;
    }[];
    charts: {
        id: string;
        name: string;
        type: string;
        presentation: string;
        postfix: string | null;
        data: {
            categories: string[];
            series: {
                name: string;
                data: number[];
            }[];
        };
    }[];
}

export interface DeplotResponse {
    presentation_id: string;
    charts: ChartAssignmentResponse;
}

export interface ImageAssetResponse {
  message: string;
  path: string;
  id: string;
  file_url?: string;
}



export interface DefaultTheme {
    id: string;
    name: string;
    description: string;
    data: any;
}


export interface Theme {
    id: string;
    name: string;
    description: string;
    user: string;
    org_id?: string | null;
    created_by?: string | null;
    logo: string; // image id
    logo_url?: string; // preview url
    company_name?: string;
    company_website?: string | null;
    data: {
        colors: any;
        fonts: {
            fontFamily?: {
                id: string;
                name: string;
                languageSupport: string[];
                heading: string;
                body: string;
                stack: string;
            };
            headingFont?: { name: string; url: string };
            bodyFont?: { name: string; url: string };
            textFont: { name: string; url: string };
        };
        brand?: any;
        [key: string]: any;
    };
}
export interface ThemeParams {
    id?: string;
    name: string;
    description: string;
    logo: string | null; // image id
    logo_url?: string | null; // preview url
    data: any;
    company_name?: string | null;
    company_website?: string | null;
}


export interface DefaultTheme {
    id: string;
    name: string;
    description: string;
    data: any;
}
