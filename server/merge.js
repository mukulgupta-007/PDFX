import PDFMerger from 'pdf-merger-js';

const mergePdfs = async (pdfPaths) => {
  const merger = new PDFMerger();
  try {
    for (const path of pdfPaths) {
      await merger.add(path);
    }
    await merger.save('database/downloads/merged.pdf');
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('Failed to merge PDFs');
  }
};

export { mergePdfs };



