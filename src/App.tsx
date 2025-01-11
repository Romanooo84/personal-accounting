  import React, { useState } from 'react';
  import Tesseract from 'tesseract.js';
  import * as pdfjsLib from 'pdfjs-dist';

  const App = () => {
      const [pdfFile, setPdfFile] = useState<File | null>(null);
      const [text, setText] = useState('');
      const [loading, setLoading] = useState(false);
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../public/pdf.worker.mjs';

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          if (event.target.files && event.target.files[0]) {
              setPdfFile(event.target.files[0]);
          }
      };

      const extractTextFromPdf = async () => {
          if (!pdfFile) {
              alert('Please upload a PDF file first.');
              return;
          }

          setLoading(true);
          setText('');

          try {
              const arrayBuffer = await pdfFile.arrayBuffer();
              const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
              console.log(pdf)
              const numPages = pdf.numPages;

            let extractedText = '';
            const extractedData=[]

              for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                  const page = await pdf.getPage(pageNum);
                  const viewport = page.getViewport({ scale: 1 });
                  const canvas = document.createElement('canvas');
                  const canvasContext = canvas.getContext('2d');

                  if (!canvasContext) continue;

                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  const renderContext = {
                      canvasContext,
                      viewport,
                  };

                  await page.render(renderContext).promise;

                  const dataUrl = canvas.toDataURL('image/png');

                  // Use Tesseract.js to recognize text from the image
                const { data } = await Tesseract.recognize(dataUrl, 'pol', {// Używamy folderu public/tessdata
              logger: (info) => console.log(info), // Logowanie postępu
                })
                  extractedData.push(data.text + '\n ')
                  extractedText += data.text + '\n';
              }
              console.log(extractedData)
              console.log(extractedText)
              setText(extractedText);
          } catch (error) {
              console.error('Error processing PDF:', error);
          } finally {
              setLoading(false);
          }
      };

      return (
          <div className="App">
              <h1>Extract Text from PDF</h1>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
              <button onClick={extractTextFromPdf} disabled={loading}>
                  {loading ? 'Processing...' : 'Extract Text'}
              </button>
              <div>
                  <h2>Extracted Text:</h2>
                  <pre>{text}</pre>
              </div>
          </div>
      );
  };

  export default App;
