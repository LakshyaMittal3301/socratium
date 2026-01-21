export type HealthResponse = {
  status: "ok";
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type BookDto = {
  id: string;
  title: string;
  source_filename: string;
  pdf_path: string;
  created_at: string;
};

export type BookListResponse = BookDto[];

export type UploadBookResponse = {
  id: string;
};

export type OutlineNode = {
  title: string;
  pageNumber: number | null;
  children: OutlineNode[];
};

export type BookOutlineResponse = {
  outline: OutlineNode[] | null;
};

export type BookTextSampleResponse = {
  text: string;
};

export type BookMetaResponse = BookDto & {
  has_text: boolean;
  has_outline: boolean;
};

export type PageMapEntry = {
  page_number: number;
  start_offset: number;
  end_offset: number;
};

export type PageMapResponse = {
  entries: PageMapEntry[];
};

export type PageTextResponse = {
  page_number: number;
  text: string;
};

export type ChatRequest = {
  bookId: string;
  pageNumber: number;
  sectionTitle: string | null;
  message: string;
};

export type ChatResponse = {
  reply: string;
  pageNumber: number;
  sectionTitle: string | null;
  contextText: string;
};
