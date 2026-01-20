import type { CSSProperties } from "react";

export type OutlineEntry = {
  title: string;
  pageNumber: number | null;
  depth: number;
};

type OutlinePanelProps = {
  entries: OutlineEntry[];
  currentEntry: OutlineEntry | null;
  error: string | null;
};

function OutlinePanel({ entries, currentEntry, error }: OutlinePanelProps) {
  return (
    <div className="outline-panel">
      <div className="outline-panel__header">
        <h2>Outline</h2>
      </div>
      {error && <p className="error">{error}</p>}
      {entries.length === 0 ? (
        <p className="muted">No outline available.</p>
      ) : (
        <ol className="outline-list">
          {entries.map((entry, index) => {
            const isActive =
              currentEntry &&
              entry.title === currentEntry.title &&
              entry.pageNumber === currentEntry.pageNumber &&
              entry.depth === currentEntry.depth;
            const style = { "--depth": entry.depth } as CSSProperties;
            return (
              <li
                key={`${entry.title}-${entry.pageNumber}-${entry.depth}-${index}`}
                className={`outline-item${isActive ? " outline-item--active" : ""}`}
                style={style}
              >
                <span className="outline-item__title">{entry.title}</span>
                <span className="outline-item__meta">
                  {entry.pageNumber ? `p${entry.pageNumber}` : "—"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default OutlinePanel;
