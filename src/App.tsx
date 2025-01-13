    import React, { useEffect, useState } from 'react';
    import * as pdfjsLib from 'pdfjs-dist';
    import handleFileChange from './functions/handleFileChange';
    import extractTextFromFile from './functions/extractTextFromFile';
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';
    
    const companiesData = {
        'Poczta Polska':{
            name: ['"POCZTA', 'POLSKA'],
            paymentText: ['Termin', 'płatności'],
            valueText: ['Pozostało', 'do', 'zapłaty',':'],
            fullName:'Poczta Polska'
        },
        'DD higiena':{
            name: ['DDD'],
            paymentText: ['Prze'],
            valueText: ['do zapłaty', 'Razem do zapłaty'],
            fullName:'DD higiena'
        },
    
    }

interface CompanyData{
    name: string[]
    paymentText: string[]
    valueText:string[]
    fullName: string
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
                console.log(data.file)
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
            console.log('start')
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
                const companyName = companyData.name;
                const payment = companyData.paymentText;
                const value = companyData.valueText;
                const invoiceData = {
                    name: companyData.fullName,
                    paymentDate: '',
                    value: ''
                }

                text.find(paymenttext => {
                    for (let i = 0; i < payment.length; i++) {
                        if (paymenttext.includes(payment[i])) {
                            const regex = /(\d{4}-\d{2}-\d{2})/
                            const match = paymenttext.match(regex);
                            if (match) {
                                invoiceData.paymentDate = match[0];
                            }
                            return true; 
                        }
                    }
                    return false; 
                });

                text.find(amount => {
                    for (let i = 0; i < value.length; i++) {

                        if (amount.includes(value[i])) {
                            const regex = /\d{1,4}(?:[\s,]?\d{5})*(?:[,.]\d+)?/g;
                            const match = amount.match(regex);
                            if (match) {
                                invoiceData.value = match[0];
                            }
                            return true; 
                        }
                    }
                    return false;
                });
                const foundData =
                    <>
                        <div>
                            <p>Nazwa Firmy:</p>
                            <p>{invoiceData.name}</p>
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
