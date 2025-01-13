    import React, { useEffect, useState } from 'react';
    import * as pdfjsLib from 'pdfjs-dist';
    import handleFileChange from './functions/handleFileChange';
    import extractTextFromFile from './functions/extractTextFromFile';
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';
    
    const companiesData = {
        'Poczta Polska':{
            name: ['"POCZTA', 'POLSKA'],
            paymentText: ['Termin', 'płatności:'],
            valueText: ['Pozostało', 'do', 'zapłaty', ':'],
            invoiceNo: ['Faktura'],
            invoiceDate:['Data','wystawienia:'],
            fullName:'Poczta Polska'
        },
        'DD higiena':{
            name: ['DDD-Higiena'],
            paymentText: ['Forma','płatności','Termin','Kwota','przelew'],
            valueText: ['Pozostaje:'],
            invoiceNo: ['Faktura', 'VAT', 'nr'],
            invoiceDate:['Data','wystawienia:'],
            fullName:'DD higiena'
        },
    
    }

interface CompanyData{
    name: string[]
    paymentText: string[]
    valueText:string[]
    fullName: string
    invoiceDate:string[]
    invoiceNo:string[]
    }

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
            let companyData: CompanyData | undefined;
            let processStopped = false
            for (const key in companiesData) {
                const name = companiesData[key as keyof typeof companiesData].name;
                const tempText = [];
                for (let i = 0; i < text.length; i++) {
                    tempText.push(text[i]);
                    if (tempText.length > name.length) {
                        tempText.shift();
                    }
                    for (let j = 0; j < name.length; j++) {
                        if (name[j] === tempText[j]) {
                            if (j + 1 === name.length) {
                                companyData=companiesData[key as keyof typeof companiesData]
                                processStopped = true; 
                                break;
                            }
                            continue;
                        } else {
                            break;
                        }
                    }
            
                    if (processStopped) break; 
                }
            
                if (processStopped) break; 
            }
            
            if (companyData) {
                const companyName: string = companyData.fullName;
                const payment = companyData.paymentText;
                const value = companyData.valueText;
                const number = companyData.invoiceNo
                const date = companyData.invoiceDate
                let tempFindList:string[]=[]
                const invoiceData = {
                    name: companyName,
                    paymentDate: '',
                    value: '',
                    invoiceNo: '',
                    invoiceDate: ''
                }

                let processStopped = false;

                for (let i = 0; i < text.length; i++) {
                    tempFindList.push(text[i]);
                    if (tempFindList.length > payment.length) {
                        tempFindList.shift();
                    }
                    for (let j = 0; j < payment.length; j++) {
                        
                        if (tempFindList[j] === payment[j]) {
                            console.log(tempFindList)
                            if (j + 1 === payment.length) {
                                console.log(tempFindList)
                                console.log(text[i])
                                processStopped = true;
                                invoiceData.paymentDate=text[i+1]
                                break; 
                            }
                        } else {
                            break; 
                        }
                    }
                    if (processStopped) {
                        processStopped = false;
                        tempFindList=[]
                        break; 
                    }
                }

                for (let i = 0; i < text.length; i++) {
                    tempFindList.push(text[i]);
                    if (tempFindList.length > number.length) {
                        tempFindList.shift();
                    }
                    for (let j = 0; j < number.length; j++) {
                        
                        if (tempFindList[j] === number[j]) {
                            console.log(tempFindList)
                            if (j + 1 === number.length) {
  
                                processStopped = true;
                                invoiceData.invoiceNo=text[i+1]
                                break; 
                            }
                        } else {
                            break; 
                        }
                    }
                    if (processStopped) {
                        processStopped = false;
                        tempFindList=[]
                        break; 
                    }
                }

                for (let i = 0; i < text.length; i++) {
                    tempFindList.push(text[i]);
                    if (tempFindList.length > date.length) {
                        tempFindList.shift();
                    }
                    for (let j = 0; j < date.length; j++) {
                        
                        if (tempFindList[j] === date[j]) {
                            console.log(tempFindList)
                            if (j + 1 === date.length) {
                                processStopped = true;
                                invoiceData.invoiceDate=text[i+1]
                                break; 
                            }
                        } else {
                            break; 
                        }
                    }
                    if (processStopped) {
                        processStopped = false;
                        tempFindList=[]
                        break; 
                    }
                }


                for (let i = 0; i < text.length; i++) {
                    tempFindList.push(text[i]);
                    if (tempFindList.length > value.length) {
                        tempFindList.shift();
                    }
                    for (let j = 0; j < value.length; j++) {
                        if (tempFindList[j] === value[j]) {
                            if (j + 1 === value.length) {
                                processStopped = true;                                
                                let foundValue=''
                                for (let k = i + 1; k < text.length; k++){
                                    const formattedValue = text[k].replace(',', '.');
                                    if (isNaN(Number(formattedValue))) {
                                        invoiceData.value = foundValue
                                       break
                                    }
                                    else {
                                        foundValue += formattedValue
                                    }
                                }
                                break; 
                            }
                        } else {
                            break; 
                        }
                    }
                    if (processStopped) {
                        processStopped = false;
                        tempFindList=[]
                        break; 
                    }
                }
                    
                const foundData =
                    <>
                        <div>
                            <p>Nazwa Firmy:</p>
                            <p>{invoiceData.name}</p>
                        </div>
                         <div>
                            <p>Numer fakury:</p>
                            <p>{invoiceData.invoiceNo}</p>
                        </div>
                        <div>
                            <p>Data fakury:</p>
                            <p>{invoiceData.invoiceDate}</p>
                        </div>
                        <div>
                            <p>Kwota:</p>
                            <p>{invoiceData.value}</p>
                        </div>
                        <div>
                            <p>Termin płatności:</p>
                            <p>{invoiceData.paymentDate}</p>
                        </div>
                    </>
                setFoundInvoiceData(foundData)
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
