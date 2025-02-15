import React, { useState } from 'react';

interface uploadedFile{
    files: File[]
}

const AddInvoice=()=>{

     const [file, setFile] = useState<uploadedFile | null>(null);
     const [isActive, setIsActive] =useState<boolean>(true)

     const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) {
                const fileArray = Array.from(event.target.files);  // Convert FileList to an array of File objects
                setFile({ files: fileArray }); 
                setIsActive(false)
            }
        };

    const clickToProcessData=()=>{
        setIsActive(true)
        sendInvoice()
    }

    const sendInvoice=async()=>{
        const formData = new FormData();
        const imagefile:string[]=[]
        if(!file){return null}
        Array.from(file.files).forEach((fileItem) => {
            formData.append('files', fileItem, fileItem.name);
            console.log(fileItem);
            imagefile.push(URL.createObjectURL(fileItem));
        });

       /* const tempImageFile: JSX.Element[] = imagefile.map((fileURL, index) => {
            const fileItem = file.files[index]; // Pobierz oryginalny plik
            if (fileItem.type === 'image/jpeg') {
                return <img width='1200px' key={index} src={fileURL} alt="uploaded" />;
            } else if (fileItem.type === 'application/pdf') {
                return (
                    <embed
                        key={index}
                        src={fileURL}
                        type="application/pdf"
                        //className={css.imageFile}
                        height="700px"
                    />
                );
            }
            else{
            return <div>wrong file</div>
            }
        });
        */
        try {
            console.log('wysyłam');
            const response = await fetch('http://localhost:3000/cashInvoice', {
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



    return(
        <div>
              <h1>Wprowadzanie faktury gotówkowej do bazy danych</h1>
            <input type="file" multiple accept=".pdf,image/*"  onChange={onChange}/>
            <button  onClick={clickToProcessData} disabled={isActive}  >Analizuj Dane</button>
        </div>
    )
}

export default AddInvoice