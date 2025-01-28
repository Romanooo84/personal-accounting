        import React, { useEffect, useState, useCallback } from 'react';
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

        const questionList=['kwotę faktury', 'termin płatności', 'nazwę kontrachenta', 'datę faktury']

        const App = () => {
            const [file, setFile] = useState<uploadedFile | null>(null);
            const [value, setValue] = useState<string | null>(null)
            //const [loading, setLoading] = useState(false);
            const [imageUrl, setImageUrl] = useState<JSX.Element | JSX.Element[] | null>(null)
            const [matchedValue, setMatchedValue] =useState<string[]>([])
            const [foundInvoiceData, setFoundInvoiceData] = useState<JSX.Element | null>(null);
            const [searchDataList, setSearchDataList]=useState<string[] |null>(null)
            const [question, setQuestion] =useState<string |null>('numer faktury')
            
            

            const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) {
                    const fileArray = Array.from(event.target.files);  // Convert FileList to an array of File objects
                    console.log(fileArray)
                    setFile({ files: fileArray });  // Update state with the actual files
                }
            };

            const onClick = (e: React.MouseEvent<HTMLButtonElement>)=>{
                const buttonValue= e.target as HTMLButtonElement
                setValue(buttonValue.textContent)
            }
      
            useEffect(()=>{
                if(value&&searchDataList){
                for (let i =0; i<searchDataList.length; i++){
                    if (value===searchDataList[i]){
                        let tempMatchedValue: string[] = matchedValue; 
                        tempMatchedValue.push(searchDataList[i-1])
                        setMatchedValue(tempMatchedValue)
                        const listLength=tempMatchedValue.length
                        setQuestion(questionList[length])
                        console.log(tempMatchedValue)
                        if (tempMatchedValue.length===questionList.length+1){
                            setQuestion(questionList[0])
                            setMatchedValue([])

                        }
                        break
                    }
                    
                }
                
            }
            },[value,searchDataList])


            useEffect(() => {
                
                if (file) {
                    const imagefile:string[] = []; // Tablica dla URL-i plików
                    let tempImageFile: JSX.Element[] = [];
                    const download = async () => {
                        const formData = new FormData();
                        Array.from(file.files).forEach((fileItem) => {
                            formData.append('files', fileItem, fileItem.name);
                            console.log(fileItem);
                            imagefile.push(URL.createObjectURL(fileItem));
                        });

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
                        console.log(downloadedData&&downloadedData[0].data)
                        if (downloadedData&&downloadedData[0].data && downloadedData&&downloadedData[0].data.data!=null) {
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
                        else{
                            let temptext = downloadedData&&downloadedData[0].data.foundText
                            temptext = temptext.filter((text:string)=>text!='')
                            console.log(temptext)
                            setSearchDataList(temptext)
                            const displayText = temptext.map((value:[], index:number) => (
                                    <button 
                                    key={index}
                                    onClick={onClick}
                                    >
                                        {value}
                                    </button>
                                ));
                            const display=
                                <div>
                                    <p> nie udało sie odczytac danych z pliku</p>
                                    <p> zaznacz {question}</p>
                                    <div>{displayText}</div>
                                </div>
                            
                            setFoundInvoiceData(display)
                        }
                    };
                    handleFileProcessing(); // Trigger the file processing.
                }
            }, [ file, setFoundInvoiceData, question]); // Add all relevant dependencies.
            



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
