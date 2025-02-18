import React, { useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import css from './style.module.css'
 
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

interface DataToSend {
    [key: string]: {
        name: string[];
        paymentText: string[];
        valueText: string[];
        invoiceNo: string[];
        invoiceDate: string[];
        fullName: string;
    };
}

const questionList=['nazwę kontrachenta','numer faktury','kwotę faktury', 'termin płatności', 'datę faktury']

const AnalizingInvoices = () => {
    const [file, setFile] = useState<uploadedFile | null>(null);
    const [value, setValue] = useState<string | null>(null)
    const [keyData, setKeyData] = useState<number>(0)
    //const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<JSX.Element | JSX.Element[] | null>(null)
    const [matchedValue, setMatchedValue] =useState<string[][]>([])
    const [foundInvoiceData, setFoundInvoiceData] = useState<JSX.Element | null>(null);
    const [searchDataList, setSearchDataList]=useState<string[] |null>(null)
    const [question, setQuestion] =useState<string |null>(questionList[0])
    const [clicedToMatched, setClickedToMatched] = useState<boolean>(false)
    const [isActive, setIsActive] =useState<boolean>(true)
    const [info, setInfo]=useState<JSX.Element>();
    const [name, setName]=useState<string>('')
    
    

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const fileArray = Array.from(event.target.files);  // Convert FileList to an array of File objects
            setFile({ files: fileArray }); 
            setIsActive(false)
        }
    };

    const clickToProcessData=()=>{
        handleFileProcessing()
        setIsActive(true)
    }


    const onClick = (e: React.MouseEvent<HTMLButtonElement>)=>{
        const buttonValue= e.target as HTMLButtonElement
        const buttonKey = e.currentTarget.dataset.key ? parseInt(e.currentTarget.dataset.key) : 0
        setValue(buttonValue.textContent)
        setKeyData(buttonKey)
        setClickedToMatched(true)
    }

    const clickIfCashInvoice=()=>{
        setValue('cash')
        setKeyData(4)
        setClickedToMatched(true)

    }
    const download = async () => {
        const formData = new FormData();
        const imagefile:string[]=[]
        if(!file){return null}
        Array.from(file.files).forEach((fileItem) => {
            formData.append('files', fileItem, fileItem.name);
            console.log(fileItem);
            imagefile.push(URL.createObjectURL(fileItem));
        });
        const tempImageFile: JSX.Element[] = imagefile.map((fileURL, index) => {
            const fileItem = file.files[index]; // Pobierz oryginalny plik
            if (fileItem.type === 'image/jpeg') {
                return <img width='1200px' key={index} src={fileURL} alt="uploaded" />;
            } else if (fileItem.type === 'application/pdf') {
                return (
                    <embed
                        key={index}
                        src={fileURL}
                        type="application/pdf"
                        className={css.imageFile}
                        height="700px"
                    />
                );
            }
            else{
            return <div>wrong file</div>
            }
        });
        
        const tempInfo=<div></div>
        setInfo(tempInfo)
        setImageUrl(tempImageFile); 

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
        const downloadedData = await download(); 
        const fail = downloadedData[0].data.name
        if (downloadedData&&fail) {
            const display = downloadedData.map((data:DownloadData, index:number) => {
                return (
                    <div key={index}>
                        <div className={css.invoiceInfo}>
                            <p className={css.invoiceInfoParagraph}>Nazwa Firmy:</p>
                            <p className={css.invoiceInfoParagraph}>{data.data.name}</p>
                        </div>
                        <div className={css.invoiceInfo}>
                            <p className={css.invoiceInfoParagraph}>Numer faktury:</p>
                            <p className={css.invoiceInfoParagraph}>{data.data.invoiceNo}</p>
                        </div>
                        <div className={css.invoiceInfo}>
                            <p className={css.invoiceInfoParagraph}>Data faktury:</p>
                            <p className={css.invoiceInfoParagraph}>{data.data.invoiceDate}</p>
                        </div>
                        <div className={css.invoiceInfo}>
                            <p className={css.invoiceInfoParagraph}>Kwota:</p>
                            <p className={css.invoiceInfoParagraph}>{data.data.value}</p>
                        </div>
                        <div className={css.invoiceInfo}>
                            <p className={css.invoiceInfoParagraph}>Termin płatności:</p>
                            <p className={css.invoiceInfoParagraph}>{data.data.paymentDate}</p>
                        </div>
                    </div>
                );
            });
            setFoundInvoiceData(display); // Update state with the display content.
        }
        else{
            let temptext = downloadedData&&downloadedData[0].data.foundText
            temptext = temptext.filter((text:string)=>text!='')
            setSearchDataList(temptext)
          
            const information = 
                <>
                    <p> nie udało sie odczytac danych z pliku</p>
                    {questionList[length] === questionList[3]?(
                        <>
                            <p> zaznacz {questionList[length]}</p>
                            <p>lub kliknij przycisk jeżeli faktura jest gotówkowa</p>
                            <button onClick={clickIfCashInvoice}>przycisk</button>
                        </>
                    ):(
                        <p> zaznacz {questionList[length]}</p>
                    )} 
                </>
            const displayText = temptext.map((value:[], index:number) => (
                    <button 
                    data-key={index-1}
                    onClick={onClick}
                    >
                        {value}
                    </button>
                ));
            const display=
                <div className={css.invoiceInfo}>
                    <div className={css.newDataParagraph}>{displayText}</div>
                </div>

            setInfo(information)
            setFoundInvoiceData(display)
        }
    };

    const sendData = useCallback(async (data: DataToSend)=>{
        try {
            console.log('wysyłam plik');
            const response = await fetch('https://organizerfaktur.pl/newCompanyData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Dodaj nagłówek
                },
                body: JSON.stringify(data),
            });
            console.log(data)
            if (response.ok) {
                const result = await response.json();
                console.log('Plik wysłany pomyślnie:', result);
                return result.files; // Zwróć pliki, jeśli serwer je obsługuje
            } else {
                console.error('Błąd podczas wysyłania:', response.statusText);
            }
        } catch (error) {
            console.error('Wystąpił błąd:', error);
        }
    },[])

    useEffect(()=>{
        if(value&&searchDataList&&clicedToMatched&&matchedValue.length<5){
        let stop=false
        setClickedToMatched(false)
        const tempMatchedValue:  string[][]= matchedValue; 
        if(tempMatchedValue.length===0) {setName(searchDataList[keyData+1])}
        console.log(name)
        for (let i =0; i<searchDataList.length; i++){
            if (value===searchDataList[i]){
                const machedData: string[] = [searchDataList[keyData - 1], searchDataList[keyData]];
                tempMatchedValue.push(machedData);
                setMatchedValue(tempMatchedValue)
                const length:number=tempMatchedValue.length
                if (questionList[length] === questionList[3]){
                    console.log('jest równe')
                }
                const information = 
                 <>
                    <p> nie udało sie odczytac danych z pliku</p>
                    {questionList[length] === questionList[3]?(
                        <>
                            <p> zaznacz {questionList[length]}</p>
                            <p>lub kliknij przycisk jeżeli faktura jest gotówkowa</p>
                            <button onClick={clickIfCashInvoice}>przycisk</button>
                        </>
                    ):(
                        <p> zaznacz {questionList[length]}</p>
                    )} 
                </>
                setInfo(information)
                if (tempMatchedValue.length===questionList.length){
                    const dataToSend = {
                        [name]: {
                            name: tempMatchedValue[3] ?? [], // Ensure it's string[]
                            paymentText: tempMatchedValue[3] ?? [],
                            valueText: tempMatchedValue[2] ?? [],
                            invoiceNo: tempMatchedValue[1] ?? [],
                            invoiceDate: tempMatchedValue[4] ?? [],
                            fullName: name,
                        },}
                    console.log(dataToSend)
                    setQuestion(questionList[0])
                    console.log(tempMatchedValue)
                    stop=true
                    const information = 
                    <>
                        <p> Wszystkie dane zostały zapisane. Kliknij aby wysłać</p>
                        <button
                            onClick={() => {
                                console.log('Przekazywane dane:', dataToSend);
                                sendData(dataToSend);
                                
                            }}
                        > 
                        Wyślij dane do weryfikacji
                    </button>      
                    </>
                    console.log(dataToSend)
                    setInfo(information)
                }
                break
            }
            if (stop){break}
        }
        
    }
    },[value,searchDataList, sendData, keyData, matchedValue, clicedToMatched, name])



    return (
        <div className={css.mainDiv}>
            <h1>Wprowadzanie faktury do bazy danych</h1>
            <input type="file" multiple accept=".pdf,image/*"  onChange={onChange} />
            <button onClick={clickToProcessData} disabled={isActive}>Analizuj Dane</button>
            {foundInvoiceData && (
            <div className={css.showData}>
                <div>
                    <h2>Found Invoice Data:</h2>
                    {info}
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

export default AnalizingInvoices;
