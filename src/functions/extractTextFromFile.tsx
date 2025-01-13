import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfToText from 'react-pdftotext'
pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';

const extractTextFromFile = async (file: File, fileType: string) => {
            if (!file) {
                alert('Please upload a PDF or image file first.');
                return;
            }

            if (fileType === 'Unknown') {
            alert('Please upload a supported file type (PDF or Image).');
            return;
            }

            let extractedText = ''
            let dataUrl
            let lines
    
            pdfToText(file)
                .then(text => {
                    extractedText = text 
                    lines = extractedText.split(' ').filter(line => line.trim() !== '');
                    console.log(lines)
                })
            .catch(error => console.log(error+"Failed to extract text from pdf"))
            
    
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

                        dataUrl = canvas.toDataURL('image/png');
                
                        const { data } = await Tesseract.recognize(dataUrl, 'pol', {
                        })
                        extractedText += data.text;
                    }
                    //lines = extractedText.split('\n').filter(line => line.trim() !== '');
                    
                } catch (error) {
                    console.error('Error processing PDF:', error);
                } 
            }
            else if (fileType === 'Image') {
                const imageUrl = URL.createObjectURL(file);
                
                try {
                const { data } = await Tesseract.recognize(imageUrl, 'pol', {
                    logger: (m) => console.log(m), // logowanie postępu procesu OCR
                });

                const extractedText=data.text
                lines = extractedText.split('\n').filter(line => line.trim() !== '');
            } catch (error) {
                console.error('Error recognizing text from image:', error);
            } 
                
            }
    return { dataUrl, lines } 
};

export default extractTextFromFile