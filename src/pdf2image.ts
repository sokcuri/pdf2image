// @ts-ignore
import pdfium from "./pdfium";
import sharp from "sharp";
import fs from "fs";
import {
  GetPDFiumFunc,
  PDFiumBitmapFormats,
  GetPDFiumHeap,
  FPDFiumFunctions,
  PDFiumRenderFlags,
  PDFiumLastErrors,
  PDFiumPageRotate,
} from "./FPDF";

export const pdfiumFunc = { ...GetPDFiumFunc(pdfium) } as FPDFiumFunctions;

const I8 = Int8Array;
const I16 = Int16Array;
const I32 = Int32Array;
const U8 = Uint8Array;
const CH = U8;
const U16 = Uint16Array;
const U32 = Uint32Array;
const F32 = Float32Array;
const F64 = Float64Array;

const H = (t, s, d) => (f) => {
  const [m, ...a] = GetPDFiumHeap(pdfium, t, s);
  const v = f(...a.map((x) => x.p));

  if (!v) {
    m.free();
    return d;
  }

  const r = a.map((x) => x.v);
  m.free();
  return r;
};

// classes
export class Page {
  public loaded = false;
  constructor(private index: number, private processor: Processor) {}

  async render() {
    return this.processor.render(this.index, 3.0, 90);
  }
}

class Processor {
  constructor(public wasmData: any) {}

  getPageSize(i = 0, s = 2) {
    return H(
      F64,
      2,
      [-1, -1]
    )((w, h) => pdfiumFunc.GetPageSizeByIndex(this.wasmData.wasm, i, w, h)).map(
      (v) => parseInt(v) * s
    );
  }

  getRender(index = 0, width: number, height: number) {
    const flag = PDFiumRenderFlags.REVERSE_BYTE_ORDER | PDFiumRenderFlags.ANNOT;
    const heap = pdfium._malloc(width * height * 4);

    for (let i = 0; i < width * height * 4; i++) {
      pdfium.HEAPU8[heap + i] = 0;
    }

    const bmap = pdfiumFunc.Bitmap_CreateEx(width, height, PDFiumBitmapFormats.Bitmap_BGRA, heap, width * 4);
    const page = pdfiumFunc.LoadPage(this.wasmData.wasm, index);

    pdfiumFunc.Bitmap_FillRect(bmap, 0, 0, width, height, 0xffffffff);
    pdfiumFunc.RenderPageBitmap(bmap, page, 0, 0, width, height, 0, flag);
    pdfiumFunc.Bitmap_Destroy(bmap);
    pdfiumFunc.ClosePage(page);

    return heap;
  }

  getPageRender(
    n = 0,
    width: number,
    height: number,
    rotation: PDFiumPageRotate
  ) {
    let pageRenderPtr = this.getRender(n, width, height);
    let pageRenderData = [];

    for (let v = 0; v < width * height * 4; v++) {
      pageRenderData.push(pdfium.HEAPU8[pageRenderPtr + v]);
    }

    pdfium._free(pageRenderPtr);
    return pageRenderData;
  }

  async render(n = 0, scale: number, rotation: PDFiumPageRotate) {
    const [w, h] = this.getPageSize(n, scale);
    const src = this.getPageRender(n, w, h, rotation);
    const data = new Uint8Array(src.length);
    var n = 4 * w * h;
    var s = 0,
      d = 0;
    while (d < n) {
      data[d++] = src[s++];
      data[d++] = src[s++];
      data[d++] = src[s++];
      data[d++] = src[s++];
    }

    return {
      data,
      width: w,
      height: h,
    };
  }

  getLastError() {
    let lastError = pdfiumFunc.GetLastError();

    switch (lastError) {
      case PDFiumLastErrors.SUCCESS:
        return "success";
      case PDFiumLastErrors.UNKNOWN:
        return "unknown error";
      case PDFiumLastErrors.FILE:
        return "file not found or could not be opened";
      case PDFiumLastErrors.FORMAT:
        return "file not in PDF format or corrupted";
      case PDFiumLastErrors.PASSWORD:
        return "password required or incorrect password";
      case PDFiumLastErrors.SECURITY:
        return "unsupported security scheme";
      case PDFiumLastErrors.PAGE:
        return "page not found or content error";
      default:
        return "unknown error";
    }
  }
}

class Doc {
  public processor: Processor;
  private pages: Page[];
  constructor(wasmData: any) {
    this.processor = new Processor(wasmData);
  }

  setPages(pagesCount: number) {
    this.pages = Array(pagesCount).fill(null);
  }

  createAllPages() {
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i] = new Page(i, this.processor);
    }
  }

  getPage(index: number) {
    let page = this.pages[index];

    if (!page) {
      page = new Page(index, this.processor);
      this.pages[index] = page;
    }

    return page;
  }

  async renderPages() {
    const wasmBuffer = this.processor.wasmData.wasmBuffer;
    const wasm = this.processor.wasmData.wasm;

    const result: {
      data: Uint8Array;
      width: number;
      height: number;
    }[] = [];
    
    for (let index = 0; index < this.pages.length; index++) {
      const page = this.pages[index];
      console.log(`Rendering pdfs... ${index + 1} / ${this.pages.length}`);
      result.push(await page.render());
    }
    
    pdfium._free(wasmBuffer);
    pdfiumFunc.CloseDocument(wasm);
    pdfiumFunc.DestroyLibrary();
    return result;
  }
}

async function processPDF(fileByteArray: Buffer, filename: string, toExt: string) {
  console.log("Getting file size...");

  let fileSize = fileByteArray.byteLength;
  console.log("File size: " + fileSize + " bytes");

  // init library
  console.log("Initializing library...");

  pdfiumFunc.Init();

  // load document to memory
  console.log("Loading data to buffer...");

  let wasmBuffer = pdfium._malloc(fileSize);
  pdfium.HEAPU8.set(fileByteArray, wasmBuffer);

  // create document
  console.log("Loading document...");

  const doc = new Doc({
    wasm: pdfiumFunc.LoadMemDocument(wasmBuffer, fileSize, ""),
    wasmBuffer: wasmBuffer,
  });

  // check last error
  let lastError = doc.processor.getLastError();
  console.log("Load document state: " + lastError);

  // count page
  console.log("Couting pages...");

  let pages = pdfiumFunc.GetPageCount(doc.processor.wasmData.wasm);
  console.log("Pages: " + pages);

  // list all pages
  if (pages > 0) {
    console.log("Rendering " + pages + " PDF pages...");

    doc.setPages(pages);
    doc.createAllPages();
    const rendered = await doc.renderPages();
    let pageNumber = 1;
    for (const item of rendered) {
      await sharp(item.data, {
        raw: {
          width: item.width,
          height: item.height,
          channels: 4,
        },
      })
        .toFile(`output/${filename}_${pageNumber}.${toExt}`);
        console.log(`Save ${filename}_${pageNumber}.${toExt}... ${pageNumber} / ${rendered.length}`);
        pageNumber++;
    }
  } else {
    console.log("Cannot render PDF pages: PDF is empty");
  }
  console.log("Finished");
}

function startApp() {
  const args = process.argv.slice(2);
  const input = args[0];
  const toExt = args[1];

  const availableExtensions = ['jpg', 'jpeg', 'png', 'tiff', 'webp', 'avif'];
  if (!input || !toExt || !availableExtensions.includes(toExt)) {
    console.log('pdf to image by pdfium');
    console.log('');
    console.log('usage:')
    console.log('pnpm start <input.pdf> <extension>');
    console.log('')
    console.log('available extension: jpg, jpeg, png, tiff, webp, avif');
    return -1;
  }

  const fileBuffer = fs.readFileSync(input);
  const filename = input.substring(0, input.lastIndexOf('.'));
  processPDF(fileBuffer, filename, toExt);
}

setTimeout(() => {
  startApp();
}, 300);
