export type BookFormat = 'EPUB' | 'PDF' | 'MOBI' | 'CBZ' | 'FB2' | 'FBZ';
export type BookNoteType = 'bookmark' | 'annotation' | 'excerpt';
export type HighlightStyle = 'highlight' | 'underline' | 'squiggly';
export type HighlightColor = 'red' | 'yellow' | 'green' | 'blue' | 'violet';

export interface Book {
  hash: string;
  format: BookFormat;
  title: string;
  author: string;
  group?: string;
  tags?: string[];
  lastUpdated: number;
  isRemoved?: boolean;
  coverImageUrl?: string | null;
}

export interface PageInfo {
  current: number;
  next?: number;
  total: number;
}

export interface BookNote {
  id: string;
  type: BookNoteType;
  cfi: string;
  href: string;
  text?: string;
  style?: HighlightStyle;
  color?: HighlightColor;
  note: string;
  created: number;
  modified?: number;
}

export interface BookLayout {
  marginPx: number;
  gapPercent: number;
  scrolled: boolean;
  maxColumnCount: number;
  maxInlineSize: number;
  maxBlockSize: number;
  animated: boolean;
}

export interface BookStyle {
  zoomLevel: number;
  lineHeight: number;
  fullJustification: boolean;
  hyphenation: boolean;
  invert: boolean;
  theme: string;
  overrideFont: boolean;
  userStylesheet: string;
}

export interface BookFont {
  serifFont: string;
  sansSerifFont: string;
  monospaceFont: string;
  defaultFont: string;
  defaultFontSize: number;
  minimumFontSize: number;
  fontWeight: number;
}

export interface ViewSettings extends BookLayout, BookStyle, BookFont {}

export interface BookProgress {
  location: string;
  tocHref: string;
  tocLabel: string;
  tocId: number;
  section: PageInfo;
  pageinfo: PageInfo;
  range: Range;
}

export interface BookConfig {
  lastUpdated: number;
  progress?: [number, number];
  location?: string;

  booknotes?: BookNote[];
  removedNotesTimestamps?: Record<string, number>;

  viewSettings?: Partial<ViewSettings>;
}

export interface BooksGroup {
  name: string;
  books: Book[];
  lastUpdated: number;
}
export interface BookContent {
  book: Book;
  file: File;
  config: BookConfig;
}
