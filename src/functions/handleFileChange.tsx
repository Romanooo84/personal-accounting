const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let fileType = 'Unknown'
    let file: File | null = null;

    if (event.target.files && event.target.files[0]) {
        file = event.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (fileExtension === 'pdf') {
                fileType = 'PDF'
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
                fileType = 'Image'
            } else {
                fileType = 'Unknown'
            }
        }

        return { fileType, file }
    }
}

export default handleFileChange;