import * as pdfjsLib from 'pdfjs-dist';

// Required for pdfjs-dist to work. Using cdnjs for the classic worker to avoid cross-origin module loading issues.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.171/pdf.worker.min.js`;

/**
 * Reads an image file and returns a base64 data URL.
 * @param file The image file to process.
 * @returns A promise that resolves with the data URL.
 */
export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(new Error("Failed to read file: " + e.target?.error));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Reads a PDF file and extracts its text content.
 * @param file The PDF file to process.
 * @returns A promise that resolves with an object containing the extracted text.
 */
export const processPdf = async (file: File): Promise<{ text: string }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => (item as any).str).join(' ') + '\n\n';
    }
    return { text: fullText };
};