import searchData from "./searchData"

interface CompanyData{
        name: string[]
        paymentText: string[]
        valueText:string[]
        fullName: string
        invoiceDate:string[]
        invoiceNo:string[]
        }


const dataFinder = (data:Record<string, CompanyData>, text:string[]) => {

     
    let companyData: CompanyData | undefined;
    let processStopped = false
    for (const key in data) {
        const name = data[key as keyof typeof data].name;
        const tempText = [];
        for (let i = 0; i < text.length; i++) {
            tempText.push(text[i]);
            if (tempText.length > name.length) {
                tempText.shift();
            }
            for (let j = 0; j < name.length; j++) {
                if (name[j] === tempText[j]) {
                    if (j + 1 === name.length) {
                        companyData = data[key as keyof typeof data]
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
        const invoiceData = {
            name: companyName,
            paymentDate: '',
            value: '',
            invoiceNo: '',
            invoiceDate: ''
        }

        invoiceData.paymentDate = searchData(text, payment, 'string') || ''
        invoiceData.invoiceNo = searchData(text, number, 'string') || ''
        invoiceData.invoiceDate = searchData(text, date, 'string') || ''
        invoiceData.value = searchData(text, value, 'string') || ''

        return invoiceData
    }

}

export default dataFinder