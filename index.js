import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { Poppler } from 'node-poppler';
import fs from 'fs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  dest: 'database/uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

app.use('/static', express.static('database/downloads'));
app.use(express.static(path.join(__dirname, 'client')));
app.use('/server', express.static(path.join(__dirname, 'server')));
const port = 3000;

const generatePreview = async (pdfPath, outputImagePath, pageNumber = 1) => {
  const poppler = new Poppler();

  const options = {
    firstPageToConvert: pageNumber,
    lastPageToConvert: pageNumber,
    pngFile: true,
  };

  try {
    await poppler.pdfToCairo(pdfPath, outputImagePath, options);
    console.log(`Preview image generated at: ${outputImagePath}`);
  } catch (error) {
    console.error(`Error generating preview: ${error}`);
  }
};

(async () => {
  const { mergePdfs } = await import('./server/merge.js');

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
  });

  app.post('/merge', upload.array('pdfs', 5), async (req, res, next) => {
    try {
      if (!req.files || req.files.length < 2) {
        return res.status(400).send('At least two PDF files are required.');
      }
      const order = req.body.order.split(',').map(Number);
      const pdfPaths = order.map(index => path.join(__dirname, req.files[index - 1].path));
      console.log(pdfPaths);
      await mergePdfs(pdfPaths);

      res.redirect('/static/merged.pdf');
    } catch (error) {
      console.error('Error during PDF merging:', error);
      res.status(500).send('An error occurred while merging PDFs.');
    }
  });

  app.post('/preview', upload.single('pdf'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).send('A PDF file is required.');
      }
      const pdfPath = path.join(__dirname, req.file.path);
      const outputImagePath = path.join(__dirname, 'database/downloads', 'preview.png');
      await generatePreview(pdfPath, outputImagePath);
      res.status(200).send('Preview generated');
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).send('An error occurred while generating the preview.');
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
  });
})();
