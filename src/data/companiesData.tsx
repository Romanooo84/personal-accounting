
interface CompanyData {
    name: string[];
    paymentText: string[];
    valueText: string[];
    fullName: string;
    invoiceDate: string[];
    invoiceNo: string[];
}

export const companiesData: Record<string, CompanyData> = {
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
        'SPC':{
            name: ['Spódzielnia', 'Piekarsko-Ciastkarska'],
            paymentText: ['Dzień','wymagalności:'],
            valueText: ['Do', 'zapłaty:', ':'],
            invoiceNo: ['FAKTURA', 'nr'],
            invoiceDate:['Data','wystawienia:'],
            fullName:'SPC'
        },
        'Oskroba':{
            name: ['Piekarnia', 'OSKROBA'],
            paymentText: ['Termin','płatności:'],
            valueText: ['Do', 'zapłaty'],
            invoiceNo: ['Faktura'],
            invoiceDate:['Data','wystawienia:'],
            fullName:'Oskroba'
        },
        
}