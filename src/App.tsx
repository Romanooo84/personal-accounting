        import React, { useEffect, useState } from 'react';
        import * as pdfjsLib from 'pdfjs-dist';
        import handleFileChange from './functions/handleFileChange';
        import extractTextFromFile from './functions/extractTextFromFile';
        import dataFinder from './functions/dataFinder/dataFinder';
        import { companiesData } from './data/companiesData';
         
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';
          
        const App = () => {
            const [file, setFile] = useState<File | null>(null);
            const [text, setText] = useState<string[]>([])
            const [loading, setLoading] = useState(false);
            const [imageUrl, setImageUrl] = useState('')
            const [fileType, setFileType] = useState<string>('')
            const [foundInvoiceData, setFoundInvoiceData] = useState<JSX.Element | null>(null);
            
            

            const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const data = handleFileChange(event);
                if (data) {
                    setFileType(data.fileType);
                    setFile(data.file);
                    }
        };

            const extractText = async () => {
                if (file) {
                    setLoading(true)
                    const data = await extractTextFromFile(file, fileType)
                    if (data && data.dataUrl && data.lines) {
                        setImageUrl(data.dataUrl)
                        setText(data.lines)
                        setLoading(false)
                    }
                }
            }

            useEffect(() => {
                
                const foundData=dataFinder(companiesData,text)
                console.log(foundData)
               
                if (foundData) {
                    console.log(foundData)
                     fetch('http://localhost:3000/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(foundData),
                    })
                    .then(response => response.json())
                    .then(result => {
                        console.log('Odpowiedź serwera:', result);
                    })
                    .catch(error => {
                        console.error('Błąd:', error);
                    });
                    const display =
                        <>
                            <div>
                                <p>Nazwa Firmy:</p>
                                <p>{foundData.name}</p>
                            </div>
                            <div>
                                <p>Numer fakury:</p>
                                <p>{foundData.invoiceNo}</p>
                            </div>
                            <div>
                                <p>Data fakury:</p>
                                <p>{foundData.invoiceDate}</p>
                            </div>
                            <div>
                                <p>Kwota:</p>
                                <p>{foundData.value}</p>
                            </div>
                            <div>
                                <p>Termin płatności:</p>
                                <p>{foundData.paymentDate}</p>
                            </div>
                        </>
                    setFoundInvoiceData(display)
                }
            }, [text]);



            return (
                <div className="App">
                    <h1>Extract Text from PDF or Image</h1>
                    <input type="file" accept=".pdf,image/*"  onChange={onChange} />
                    <button onClick={extractText} disabled={loading}>
                        {loading ? 'Processing...' : 'Extract Text'}
                    </button>
                    {foundInvoiceData && (
                    <div>
                        <h2>Found Invoice Data:</h2>
                        {foundInvoiceData}
                    </div>
                )}
                    <div>
                        <h2>Extracted Text:</h2>
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
