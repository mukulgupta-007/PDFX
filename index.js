import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { request } from 'http';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const upload = multer({ dest: 'database/uploads/' });
app.use('/static',express.static('public')); 
app.use(express.static(path.join(__dirname, 'client')));
app.use('server', express.static(path.join(__dirname, 'server'))); 
const port = 3000;

(async () => {
  const { mergePdfs } = await import('./server/merge.js');

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
  });

  app.post('/merge', upload.array('pdfs', 5), async (req, res, next) => {
    if (!req.files || req.files.length < 2) {
      return res.status(400).send('At least two PDF files are required.');
    }
    const order = req.body.order.split(',').map(Number);
    const pdfPaths = order.map(index => path.join(__dirname, req.files[index - 1].path));
    await mergePdfs(pdfPaths);

    res.redirect('/static/merged.pdf');
  });

  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
  });
})();
