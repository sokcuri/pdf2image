export enum PDFiumRenderFlags {
  NONE = 0, // None
  ANNOT = 1, // Set if annotations are to be rendered.
  LCD_TEXT = 2, // Set if using text rendering optimized for LCD display.
  NO_NATIVETEXT = 4, // Don't use the native text output available on some platforms
  GRAYSCALE = 8, // Grayscale output.
  REVERSE_BYTE_ORDER = 16, // set whether render in a reverse Byte order, this flag only enable when render to a bitmap.
  DEBUG_INFO = 128, // Set if you want to get some debug info. Please discuss with Foxit first if you need to collect debug info.
  NO_CATCH = 256, // Set if you don't want to catch exception.
  RENDER_LIMITEDIMAGECACHE = 512, // Limit image cache size.
  RENDER_FORCEHALFTONE = 1024, // Always use halftone for image stretching.
  PRINTING = 2048, // Render for printing.
  RENDER_NO_SMOOTHTEXT = 4096, // Set to disable anti-aliasing on text.
  RENDER_NO_SMOOTHIMAGE = 8192, // Set to disable anti-aliasing on images.
  RENDER_NO_SMOOTHPATH = 16384, // Set to disable anti-aliasing on paths.
  THUMBNAIL = 32768 // Render page as a thumbnail
}

export enum PDFiumBitmapFormats {
  Bitmap_Gray = 1,
  Bitmap_BGR = 2,
  Bitmap_BGRx = 3,
  Bitmap_BGRA = 4,
}

export enum PDFiumLastErrors {
  // Last error types
  SUCCESS = 0,
  UNKNOWN = 1,
  FILE = 2,
  FORMAT = 3,
  PASSWORD = 4,
  SECURITY = 5,
  PAGE = 6,
}

export enum PDFiumPageRotate {
  NORMAL = 0,
  ROTATE_90 = 1,
  ROTATE_180 = 2,
  ROTATE_270 = 3
}

const FPDFDocument = Symbol('FPDFDocument');
type FPDFDocument = typeof FPDFDocument;

const FPDFPage = typeof Symbol('FPDFPage');
type FPDFPage = typeof FPDFPage;

const FPDFTextPage = typeof Symbol('FPDFTextPage');
type FPDFTextPage = typeof FPDFTextPage;

const FPDFBitmap = typeof Symbol('FPDFBitmap');
type FPDFBitmap = typeof FPDFBitmap;

export interface FPDFiumFunctions {
  Init(): void;
  LoadMemDocument(byteArray: unknown, length: number, noused: string): FPDFDocument;
  LoadPage(document: FPDFDocument, index: number): FPDFPage;
  ClosePage(page: FPDFPage): void;

  Text_LoadPage(page: FPDFPage): FPDFTextPage;
  Text_GetText(page: FPDFTextPage, startIndex: number, count: number, outBuffer: unknown): void;
  Text_GetCharacterCount(page: FPDFTextPage): number;

  Bitmap_CreateEx(width: number, height: number, format: PDFiumBitmapFormats, firstScan: unknown, stride: number): FPDFBitmap;
  RenderPageBitmap(bitmap: FPDFBitmap, page: FPDFPage, startX: number, startY: number, sizeX: number, sizeY: number, rotate: PDFiumPageRotate, flags: PDFiumRenderFlags): void;

  Bitmap_FillRect(bitmap: FPDFBitmap, left: number, top: number, width: number, height: number, colorARGB8888: number): void;
  Bitmap_Destroy(bitmap: FPDFBitmap): void;

  GetPageSizeByIndex(document: FPDFDocument, pageIndex: number, width: number, height: number): number;

  GetLastError(): PDFiumLastErrors;
  GetPageCount(document: FPDFDocument): number;
  CloseDocument(document: FPDFDocument): void;
  DestroyLibrary(): void;
}

export const GetPDFiumFunc = (pdfium: any) => {
  return {
    Init: pdfium.cwrap('PDFium_Init'),
    LoadMemDocument: pdfium.cwrap('FPDF_LoadMemDocument', 'number', ['number', 'number', 'string']),
    LoadPage: pdfium.cwrap('FPDF_LoadPage', 'number', ['number', 'number']),
    ClosePage: pdfium.cwrap('FPDF_ClosePage', '', ['number']),

    Text_LoadPage: pdfium.cwrap('FPDFText_LoadPage', 'number', ['number']),
    Text_GetText: pdfium.cwrap('FPDFText_GetText', '', ['number', 'number', 'number', 'number']),
    Text_GetCharacterCount: pdfium.cwrap('FPDFText_CountChars', 'number', ['number', 'number']),
    RenderPageBitmap: pdfium.cwrap('FPDF_RenderPageBitmap', '', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']),

    Bitmap_FillRect: pdfium.cwrap('FPDFBitmap_FillRect', '', ['number', 'number', 'number', 'number', 'number', 'number']),
    Bitmap_CreateEx: pdfium.cwrap('FPDFBitmap_CreateEx', 'number', ['number', 'number', 'number', 'number', 'number']),
    Bitmap_Destroy: pdfium.cwrap('FPDFBitmap_Destroy', '', ['number']),


    GetPageSizeByIndex: pdfium.cwrap('FPDF_GetPageSizeByIndex', 'number', ['number', 'number', 'number', 'number']),
    GetLastError: pdfium.cwrap('FPDF_GetLastError', 'number'),
    GetPageCount: pdfium.cwrap('FPDF_GetPageCount', 'number', ['number']),
    CloseDocument: pdfium.cwrap('FPDF_CloseDocument', '', ['number']),
    DestroyLibrary: pdfium.cwrap('FPDF_DestroyLibrary'),
  } as FPDFiumFunctions;
}

export const GetPDFiumHeap = (pdfium: any, J, s) => {
  let E;
  switch (J) {
    case Int8Array: E = pdfium.HEAP8; break;
    case Int16Array: E = pdfium.HEAP16; break;
    case Int32Array: E = pdfium.HEAP32; break;
    case Uint8Array: E = pdfium.HEAPU8; break;
    case Uint16Array: E = pdfium.HEAPU16; break;
    case Uint32Array: E = pdfium.HEAPU32; break;
    case Float32Array: E = pdfium.HEAPF32; break;
    case Float64Array: E = pdfium.HEAPF64; break;
  }
  const Z = J.BYTES_PER_ELEMENT; const m = pdfium._malloc(s * Z);
  const a = Array(1 + s); a[0] = ({ s, J, Z, E, m, free: () => pdfium._free(m) });
  for (let i = 0; i < s; i++) a[i + 1] = ({ p: m + (i * Z), get v() { return E[m / Z + i]; } });
  return a;
};
