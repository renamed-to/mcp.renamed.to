/** Input for the rename tool — AI-powered file renaming based on content analysis. */
export interface RenameInput {
  /** Absolute or relative paths to the files to rename. */
  filePaths: string[];
  /** Directory to write renamed files to. Defaults to the same directory as the source. */
  outputDir?: string;
  /** Format template for the new filename (e.g. "{date} - {title}"). */
  format?: string;
  /** Preview the rename without writing any files. */
  dryRun?: boolean;
}

// TODO: Add ExtractInput when the extract API is publicly available

/** Input for the pdf_split tool — split PDFs by content, bookmarks, or page ranges. */
export interface PdfSplitInput {
  /** Path to the PDF file to split. */
  filePath: string;
  /** Splitting strategy. "ai" uses content analysis, "bookmarks" uses PDF bookmarks, "pages" uses page ranges. */
  strategy?: "ai" | "bookmarks" | "pages";
  /** Directory to write the split PDF files to. */
  outputDir?: string;
}

/** Input for the watch tool — watch a directory and auto-process new files. */
export interface WatchInput {
  /** Directory to watch for new files. */
  directory: string;
  /** Action to perform on new files. */
  action: "rename" | "pdf-split";
  /** Action-specific configuration. */
  config?: {
    /** Format template (for rename action). */
    format?: string;
    /** Split strategy (for pdf-split action). */
    strategy?: "ai" | "bookmarks" | "pages";
  };
}
