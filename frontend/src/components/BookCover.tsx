import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type BookCoverProps = {
  fileUrl: string;
  title: string;
};

function BookCover({ fileUrl, title }: BookCoverProps) {
  return (
    <div className="book-cover">
      <Document
        file={fileUrl}
        loading={<div className="book-cover__placeholder" />}
        error={<div className="book-cover__placeholder" />}
      >
        <Page
          pageNumber={1}
          width={140}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          aria-label={`Cover preview for ${title}`}
        />
      </Document>
    </div>
  );
}

export default BookCover;
