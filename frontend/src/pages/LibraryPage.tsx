import { useEffect, useMemo, useState } from "react";
import type { UploadProps } from "antd";
import { Button, Card, Col, Empty, Modal, Row, Space, Typography, Upload } from "antd";
import type { BookDto } from "@shared/types/api";
import DebugPanel from "../components/DebugPanel";
import BookCover from "../components/BookCover";
import { formatDate } from "../lib/ui";

type LibraryPageProps = {
  books: BookDto[];
  uploading: boolean;
  status: string | null;
  error: string | null;
  onUpload: (file: File) => Promise<boolean>;
  onOpenBook: (bookId: string) => void;
  showUpload: boolean;
  onOpenUpload: () => void;
  onCloseUpload: () => void;
  debugEnabled: boolean;
};

function LibraryPage({
  books,
  uploading,
  status,
  error,
  onUpload,
  onOpenBook,
  showUpload,
  onOpenUpload,
  onCloseUpload,
  debugEnabled
}: LibraryPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const uploadProps = useMemo<UploadProps>(
    () => ({
      accept: "application/pdf",
      maxCount: 1,
      beforeUpload: (file) => {
        setSelectedFile(file);
        setLocalError(null);
        return false;
      },
      onRemove: () => {
        setSelectedFile(null);
      }
    }),
    []
  );

  useEffect(() => {
    if (!showUpload) {
      setSelectedFile(null);
      setLocalError(null);
    }
  }, [showUpload]);

  async function handleUploadConfirm() {
    if (!selectedFile) {
      setLocalError("Pick a PDF to upload.");
      return;
    }
    const ok = await onUpload(selectedFile);
    if (ok) {
      onCloseUpload();
      setSelectedFile(null);
    }
  }

  function handleBookOpen(bookId: string) {
    onOpenBook(bookId);
  }

  return (
    <div className="library">
      {books.length === 0 ? (
        <Card className="library-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No books uploaded yet."
          />
          <Button type="primary" onClick={onOpenUpload}>
            Add your first book
          </Button>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {books.map((book) => (
            <Col key={book.id} xs={24} sm={12} lg={6}>
              <Card
                hoverable
                className="library-book-card"
                onClick={() => handleBookOpen(book.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleBookOpen(book.id);
                  }
                }}
                cover={<BookCover fileUrl={`/api/books/${book.id}/file`} title={book.title} />}
              >
              <div className="library-book-content">
                <Typography.Text className="library-book__title">{book.title}</Typography.Text>
                <Typography.Text type="secondary" className="library-book__filename">
                  {book.source_filename}
                </Typography.Text>
                <div className="library-book__footer">
                  <Typography.Text type="secondary" className="library-book__date">
                    Uploaded: {formatDate(book.created_at)}
                  </Typography.Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      )}

      {debugEnabled && <DebugPanel books={books} />}

      <Modal
        open={showUpload}
        onCancel={onCloseUpload}
        onOk={handleUploadConfirm}
        okText="Upload PDF"
        okButtonProps={{ size: "middle" }}
        cancelButtonProps={{ size: "middle" }}
        confirmLoading={uploading}
        title="Add a book"
      >
        <div className="library-upload-modal">
          <Upload {...uploadProps}>
            <Button size="middle">Select PDF</Button>
          </Upload>
          {selectedFile && (
            <Typography.Text type="secondary">
              Selected: {selectedFile.name}
            </Typography.Text>
          )}
          {localError && <Typography.Text type="danger">{localError}</Typography.Text>}
          {status && <Typography.Text type="success">{status}</Typography.Text>}
          {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </div>
      </Modal>
    </div>
  );
}

export default LibraryPage;
