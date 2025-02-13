var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import css from './app.module.css';
pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.mjs';
const questionList = ['nazwę kontrachenta', 'numer faktury', 'kwotę faktury', 'termin płatności', 'datę faktury'];
const App = () => {
    const [file, setFile] = useState(null);
    const [value, setValue] = useState(null);
    const [keyData, setKeyData] = useState(0);
    //const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [matchedValue, setMatchedValue] = useState([]);
    const [foundInvoiceData, setFoundInvoiceData] = useState(null);
    const [searchDataList, setSearchDataList] = useState(null);
    const [question, setQuestion] = useState(questionList[0]);
    const [clickedToExtract, setClickedToExtract] = useState(false);
    const [clicedToMatched, setClickedToMatched] = useState(false);
    const [info, setInfo] = useState();
    const [name, setName] = useState('');
    const onChange = (event) => {
        if (event.target.files) {
            const fileArray = Array.from(event.target.files); // Convert FileList to an array of File objects
            setFile({ files: fileArray });
            setClickedToExtract(true);
            //setMatchedValue([])
        }
    };
    const onClick = (e) => {
        const buttonValue = e.target;
        const buttonKey = e.currentTarget.dataset.key ? parseInt(e.currentTarget.dataset.key) : 0;
        setValue(buttonValue.textContent);
        setKeyData(buttonKey);
        setClickedToMatched(true);
    };
    const sendData = useCallback((data) => __awaiter(void 0, void 0, void 0, function* () {
        //console.log(data)
        try {
            console.log('wysyłam plik');
            const response = yield fetch('https://organizerfaktur.pl/newCompanyData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Dodaj nagłówek
                },
                body: JSON.stringify(data),
            });
            console.log(data);
            if (response.ok) {
                const result = yield response.json();
                console.log('Plik wysłany pomyślnie:', result);
                return result.files; // Zwróć pliki, jeśli serwer je obsługuje
            }
            else {
                console.error('Błąd podczas wysyłania:', response.statusText);
            }
        }
        catch (error) {
            console.error('Wystąpił błąd:', error);
        }
    }), []);
    useEffect(() => {
        var _a, _b, _c, _d, _e;
        if (value && searchDataList && clicedToMatched && matchedValue.length < 5) {
            let stop = false;
            setClickedToMatched(false);
            const tempMatchedValue = matchedValue;
            if (tempMatchedValue.length === 0) {
                setName(searchDataList[keyData + 1]);
            }
            console.log(name);
            for (let i = 0; i < searchDataList.length; i++) {
                if (value === searchDataList[i]) {
                    const machedData = [searchDataList[keyData - 1], searchDataList[keyData]];
                    tempMatchedValue.push(machedData);
                    setMatchedValue(tempMatchedValue);
                    const length = tempMatchedValue.length;
                    console.log(tempMatchedValue);
                    console.log(questionList[length]);
                    const information = _jsxs(_Fragment, { children: [_jsx("p", { children: " nie uda\u0142o sie odczytac danych z pliku" }), _jsxs("p", { children: [" zaznacz ", questionList[length]] })] });
                    setInfo(information);
                    if (tempMatchedValue.length === questionList.length) {
                        const dataToSend = {
                            [name]: {
                                name: (_a = tempMatchedValue[3]) !== null && _a !== void 0 ? _a : [], // Ensure it's string[]
                                paymentText: (_b = tempMatchedValue[3]) !== null && _b !== void 0 ? _b : [],
                                valueText: (_c = tempMatchedValue[2]) !== null && _c !== void 0 ? _c : [],
                                invoiceNo: (_d = tempMatchedValue[1]) !== null && _d !== void 0 ? _d : [],
                                invoiceDate: (_e = tempMatchedValue[4]) !== null && _e !== void 0 ? _e : [],
                                fullName: name,
                            },
                        };
                        console.log(dataToSend);
                        setQuestion(questionList[0]);
                        console.log(tempMatchedValue);
                        stop = true;
                        const information = _jsxs(_Fragment, { children: [_jsx("p", { children: " Wszystkie dane zosta\u0142y zapisane. Kliknij aby wys\u0142a\u0107" }), _jsx("button", { onClick: () => {
                                        console.log('Przekazywane dane:', dataToSend);
                                        sendData(dataToSend);
                                    }, children: "Wy\u015Blij dane do weryfikacji" })] });
                        setInfo(information);
                    }
                    break;
                }
                if (stop) {
                    break;
                }
            }
        }
    }, [value, searchDataList, sendData, keyData, matchedValue, clicedToMatched, name]);
    useEffect(() => {
        if (file && clickedToExtract === true) {
            setClickedToExtract(false);
            const imagefile = []; // Tablica dla URL-i plików
            let tempImageFile = [];
            const download = () => __awaiter(void 0, void 0, void 0, function* () {
                const formData = new FormData();
                Array.from(file.files).forEach((fileItem) => {
                    formData.append('files', fileItem, fileItem.name);
                    console.log(fileItem);
                    imagefile.push(URL.createObjectURL(fileItem));
                });
                tempImageFile = imagefile.map((fileURL, index) => {
                    const fileItem = file.files[index]; // Pobierz oryginalny plik
                    if (fileItem.type === 'image/jpeg') {
                        return _jsx("img", { width: '1200px', src: fileURL, alt: "uploaded" }, index);
                    }
                    else if (fileItem.type === 'application/pdf') {
                        return (_jsx("embed", { src: fileURL, type: "application/pdf", className: css.imageFile, height: "700px" }, index));
                    }
                    else {
                        return _jsx("div", { children: "wrong file" });
                    }
                });
                const tempInfo = _jsx("div", {});
                setInfo(tempInfo);
                setImageUrl(tempImageFile);
                try {
                    console.log('wysyłam');
                    const response = yield fetch('https://organizerfaktur.pl/ask', {
                        method: 'POST',
                        body: formData,
                    });
                    if (response.ok) {
                        const result = yield response.json();
                        console.log('Plik wysłany pomyślnie:', result.files);
                        return result.files; // Zwróć pliki, jeśli serwer je obsługuje
                    }
                    else {
                        console.error('Błąd podczas wysyłania:', response.statusText);
                    }
                }
                catch (error) {
                    console.error('Wystąpił błąd:', error);
                }
            });
            const handleFileProcessing = () => __awaiter(void 0, void 0, void 0, function* () {
                const downloadedData = yield download(); // Assign the result to a variable.
                const fail = downloadedData[0].data.name;
                if (downloadedData && fail) {
                    const display = downloadedData.map((data, index) => {
                        return (_jsxs("div", { children: [_jsxs("div", { className: css.invoiceInfo, children: [_jsx("p", { className: css.invoiceInfoParagraph, children: "Nazwa Firmy:" }), _jsx("p", { className: css.invoiceInfoParagraph, children: data.data.name })] }), _jsxs("div", { className: css.invoiceInfo, children: [_jsx("p", { className: css.invoiceInfoParagraph, children: "Numer faktury:" }), _jsx("p", { className: css.invoiceInfoParagraph, children: data.data.invoiceNo })] }), _jsxs("div", { className: css.invoiceInfo, children: [_jsx("p", { className: css.invoiceInfoParagraph, children: "Data faktury:" }), _jsx("p", { className: css.invoiceInfoParagraph, children: data.data.invoiceDate })] }), _jsxs("div", { className: css.invoiceInfo, children: [_jsx("p", { className: css.invoiceInfoParagraph, children: "Kwota:" }), _jsx("p", { className: css.invoiceInfoParagraph, children: data.data.value })] }), _jsxs("div", { className: css.invoiceInfo, children: [_jsx("p", { className: css.invoiceInfoParagraph, children: "Termin p\u0142atno\u015Bci:" }), _jsx("p", { className: css.invoiceInfoParagraph, children: data.data.paymentDate })] })] }, index));
                    });
                    setFoundInvoiceData(display); // Update state with the display content.
                }
                else {
                    let temptext = downloadedData && downloadedData[0].data.foundText;
                    console.log(temptext);
                    temptext = temptext.filter((text) => text != '');
                    console.log(temptext);
                    setSearchDataList(temptext);
                    const information = _jsxs(_Fragment, { children: [_jsx("p", { children: " nie uda\u0142o sie odczytac danych z pliku" }), _jsxs("p", { children: [" zaznacz ", question] })] });
                    const displayText = temptext.map((value, index) => (_jsx("button", { "data-key": index - 1, onClick: onClick, children: value })));
                    const display = _jsx("div", { className: css.invoiceInfo, children: _jsx("div", { className: css.newDataParagraph, children: displayText }) });
                    setInfo(information);
                    setFoundInvoiceData(display);
                }
            });
            handleFileProcessing(); // Trigger the file processing.
        }
    }, [file, setFoundInvoiceData, question, clickedToExtract]); // Add all relevant dependencies.
    return (_jsxs("div", { className: css.mainDiv, children: [_jsx("h1", { children: "Extract Text from PDF or Image" }), _jsx("input", { type: "file", multiple: true, accept: ".pdf,image/*", onChange: onChange }), foundInvoiceData && (_jsxs("div", { className: css.showData, children: [_jsxs("div", { children: [_jsx("h2", { children: "Found Invoice Data:" }), info, foundInvoiceData] }), _jsx("div", { children: imageUrl })] }))] }));
};
export default App;
