        import React, { useEffect, useState } from 'react';
        import * as pdfjsLib from 'pdfjs-dist';
        import css from './app.module.css'
        //import handleFileChange from './functions/handleFileChange';
        //import extractTextFromFile from './functions/extractTextFromFile';
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
            //const [text, setText] = useState<string[]>([])
            //const [loading, setLoading] = useState(false);
            const [imageUrl, setImageUrl] = useState<JSX.Element | JSX.Element[] | null>(null)
            ////const [fileType, setFileType] = useState<string>('')
            const [foundInvoiceData, setFoundInvoiceData] = useState<JSX.Element | null>(null);
            
            

            const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) {
                    const fileArray = Array.from(event.target.files);  // Convert FileList to an array of File objects
                    console.log(fileArray)
                    setFile({ files: fileArray });  // Update state with the actual files
                }
            };


            useEffect(() => {
                
                if (file) {
                    const imagefile:string[] = []; // Tablica dla URL-i plików
                    let tempImageFile: JSX.Element[] = [];
// Tymczasowa zmienna do renderowania

                    const download = async () => {
                        const formData = new FormData();

                        // Iteruj przez pliki
                        Array.from(file.files).forEach((fileItem) => {
                            formData.append('files', fileItem, fileItem.name);
                            console.log(fileItem);

                            // Twórz URL dla każdego pliku i dodaj do tablicy
                            imagefile.push(URL.createObjectURL(fileItem));
                        });

                        // Renderowanie w zależności od typu pliku
                        tempImageFile = imagefile.map((fileURL, index) => {
                            const fileItem = file.files[index]; // Pobierz oryginalny plik
                            if (fileItem.type === 'image/jpeg') {
                                return <img key={index} src={fileURL} alt="uploaded" />;
                            } else if (fileItem.type === 'application/pdf') {
                                return (
                                    <embed
                                        key={index}
                                        src={fileURL}
                                        width="100%"
                                        height="500px"
                                        type="application/pdf"
                                    />
                                );
                            }
                            else{
                            return <div>wrong file</div>
                            }
                        });

                        // Wyświetl wynik w konsoli i ustaw URL-e
                        console.log(tempImageFile);
                        setImageUrl(tempImageFile); // Funkcja do ustawiania stanu (zakładam React)

                        try {
                            console.log('wysyłam');
                            const response = await fetch('http://localhost:3000/ask', {
                                method: 'POST',
                                body: formData,
                            });

                            if (response.ok) {
                                const result = await response.json();
                                console.log('Plik wysłany pomyślnie:', result.files);
                                return result.files; // Zwróć pliki, jeśli serwer je obsługuje
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
            }, [ file, setFoundInvoiceData]); // Add all relevant dependencies.
            



            return (
                <div className="App">
                    <h1>Extract Text from PDF or Image</h1>
                    <input type="file" multiple accept=".pdf,image/*"  onChange={onChange} />
                    {foundInvoiceData && (
                    <div className={css.showData}>
                        <div>
                            <h2>Found Invoice Data:</h2>
                            {foundInvoiceData}
                        </div>
                        <div>
                            {imageUrl}
                        </div>

                    </div>
                    )}    
                </div>
            );
        };

        export default App;
