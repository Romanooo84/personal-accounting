  import React, { useState } from 'react';
  import Tesseract from 'tesseract.js';
  import * as pdfjsLib from 'pdfjs-dist';
  
  pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';

  const App = () => {
      const [file, setfile] = useState<File | null>(null);
      const [text, setText] = useState<string[]>([])
      const [loading, setLoading] = useState(false);
      const [imageUrl, setImageUrl] = useState('')
      const [fileType, setFileType] = useState<string>('')
    
    

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (fileExtension === 'pdf') {
                setFileType('PDF');
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
                setFileType('Image');
            } else {
                setFileType('Unknown');
            }
            setfile(file);
        }
    } else {
        // Handle case when no file is selected or files are empty
        setFileType('Unknown');
    }
};

      const extractTextFromPdf = async () => {
          if (!file) {
              alert('Please upload a PDF or image file first.');
              return;
          }

        if (fileType === 'Unknown') {
        alert('Please upload a supported file type (PDF or Image).');
        return;
         }

          setLoading(true);
          setText([]);

          let extractedText = ''
          
          if (fileType === 'PDF') {
              try {
                  const arrayBuffer = await file.arrayBuffer();
                  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                  const numPages = pdf.numPages;

            

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
                      setImageUrl(dataUrl)
              
                      // Use Tesseract.js to recognize text from the image
                      const { data } = await Tesseract.recognize(dataUrl, 'pol', {
                      })
                      extractedText += data.text;
                  }
                  console.log(extractedText)
                  const lines = extractedText.split('\n').filter(line => line.trim() !== '');
                  setText(lines);
              } catch (error) {
                  console.error('Error processing PDF:', error);
              } finally {
                  setLoading(false);
              }
          }
          else if (fileType === 'Image') {
             const imageUrl = URL.createObjectURL(file);
              setImageUrl(imageUrl);
              
              try {
            const { data } = await Tesseract.recognize(imageUrl, 'pol', {
                logger: (m) => console.log(m), // logowanie postępu procesu OCR
            });

            const extractedText=data.text
            const lines = extractedText.split('\n').filter(line => line.trim() !== '');
            setText(lines);
        } catch (error) {
            console.error('Error recognizing text from image:', error);
        } finally {
            setLoading(false);
        }
              
          }
      };

      return (
          <div className="App">
              <h1>Extract Text from PDF or Image</h1>
              <input type="file" accept=".pdf,image/*"  onChange={handleFileChange} />
              <button onClick={extractTextFromPdf} disabled={loading}>
                  {loading ? 'Processing...' : 'Extract Text'}
              </button>
              <div>
                  <h2>Extracted Text:</h2>
                  <pre>{text}</pre>
              </div>
               <div>
        {!!text && text.map((line, index) => (
          <button key={index} onClick={(e) => console.log(e.target)}>
            {line}
          </button>
        ))}
      </div>
              {!!text && <img src={imageUrl} alt="Canvas to Image" />}
          </div>
      );
  };

  export default App;
