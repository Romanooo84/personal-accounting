        import React, { useEffect, useState } from 'react';
        import * as pdfjsLib from 'pdfjs-dist';
        import handleFileChange from './functions/handleFileChange';
        import extractTextFromFile from './functions/extractTextFromFile';
        //import dataFinder from './functions/dataFinder/dataFinder';
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
                //const foundData = dataFinder(companiesData, text);
            
                if (file) {
                    const download = async () => {
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                            console.log('wysyłam');
                            const response = await fetch('http://localhost:3000/ask', {
                                method: 'POST',
                                body: formData,
                            });
                            if (response.ok) {
                                const result = await response.json();
                                console.log('Plik wysłany pomyślnie:', result);
                                return result.data; // Ensure the returned data is assigned.
                            } else {
                                console.error('Błąd podczas wysyłania:', response.statusText);
                            }
                        } catch (error) {
                            console.error('Wystąpił błąd:', error);
                        }
                    };
            
                    const handleFileProcessing = async () => {
                        const downloadedData = await download(); // Assign the result to a variable.
                        if (downloadedData) {
                            console.log(downloadedData);
                            const display = (
                                <>
                                    <div>
                                        <p>Nazwa Firmy:</p>
                                        <p>{downloadedData.name}</p>
                                    </div>
                                    <div>
                                        <p>Numer fakury:</p>
                                        <p>{downloadedData.invoiceNo}</p>
                                    </div>
                                    <div>
                                        <p>Data fakury:</p>
                                        <p>{downloadedData.invoiceDate}</p>
                                    </div>
                                    <div>
                                        <p>Kwota:</p>
                                        <p>{downloadedData.value}</p>
                                    </div>
                                    <div>
                                        <p>Termin płatności:</p>
                                        <p>{downloadedData.paymentDate}</p>
                                    </div>
                                </>
                            );
                            setFoundInvoiceData(display); // Update state with the display content.
                        }
                    };
            
                    handleFileProcessing(); // Trigger the file processing.
                }
            }, [text, file, setFoundInvoiceData]); // Add all relevant dependencies.
            



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
