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
