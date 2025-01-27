        import React, { useEffect, useState } from 'react';
        import * as pdfjsLib from 'pdfjs-dist';
        //import handleFileChange from './functions/handleFileChange';
        import extractTextFromFile from './functions/extractTextFromFile';
        //import dataFinder from './functions/dataFinder/dataFinder';
        //import { companiesData } from './data/companiesData';
         
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';

        interface uploadedFile{
            files: File[]
        }
          
        interface DownloadData {
            data: {
                name: string;
                paymentDate: string;
                value: string;
                invoiceNo: string;
                invoiceDate: string;
            };
        }
        const App = () => {
            const [file, setFile] = useState<uploadedFile | null>(null);
            const [text, setText] = useState<string[]>([])
            const [loading, setLoading] = useState(false);
            const [imageUrl, setImageUrl] = useState('')
            const [fileType, setFileType] = useState<string>('')
            const [foundInvoiceData, setFoundInvoiceData] = useState<JSX.Element | null>(null);
            
            

            const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) {
                    const fileArray = Array.from(event.target.files);  // Convert FileList to an array of File objects
                    setFile({ files: fileArray });  // Update state with the actual files
                }
            };


            useEffect(() => {
                //const foundData = dataFinder(companiesData, text);
                
                if (file) {
                    const download = async () => {
                        const formData = new FormData();
                        file.files.forEach((fileItem, index) => {
                            formData.append('files', fileItem, fileItem.name);  // 'files' to klucz, 'fileItem' to plik, a 'fileItem.name' to nazwa pliku
                        });
                        try {
                            console.log('wysyłam');
                            const response = await fetch('http://localhost:3000/ask', {
                                method: 'POST',
                                body: formData,
                            });
                            if (response.ok) {
                                const result = await response.json();
                                console.log('Plik wysłany pomyślnie:', result.files);
                                return result.files; // Ensure the returned data is assigned.
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
                            const display = downloadedData.map((data:DownloadData, index:number) => {
                                return (
                                    <div key={index}>
                                        <div>
                                            <p>Nazwa Firmy:</p>
                                            <p>{data.data.name}</p>
                                        </div>
                                        <div>
                                            <p>Numer faktury:</p>
                                            <p>{data.data.invoiceNo}</p>
                                        </div>
                                        <div>
                                            <p>Data faktury:</p>
                                            <p>{data.data.invoiceDate}</p>
                                        </div>
                                        <div>
                                            <p>Kwota:</p>
                                            <p>{data.data.value}</p>
                                        </div>
                                        <div>
                                            <p>Termin płatności:</p>
                                            <p>{data.data.paymentDate}</p>
                                        </div>
                                    </div>
                                );
                            });
                            setFoundInvoiceData(display); // Update state with the display content.
                        }
                    };
            
                    handleFileProcessing(); // Trigger the file processing.
                }
            }, [text, file, setFoundInvoiceData]); // Add all relevant dependencies.
            



            return (
                <div className="App">
                    <h1>Extract Text from PDF or Image</h1>
                    <input type="file" multiple accept=".pdf,image/*"  onChange={onChange} />
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
