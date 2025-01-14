const searchData = (text:string[], listToCompare:string[], dataType:string) => {
    let processStopped = false;
    const tempFindList:string[]=[]
     for (let i = 0; i < text.length; i++) {
                    tempFindList.push(text[i]);
                    if (tempFindList.length > listToCompare.length) {
                        tempFindList.shift();
                    }
                    for (let j = 0; j < listToCompare.length; j++) {
                        if (tempFindList[j] === listToCompare[j]) {

                            if (j + 1 === listToCompare.length) {
                                processStopped = true;
                                if (dataType === 'value') {
                                    let foundValue=''
                                    for (let k = i + 1; k < text.length; k++){
                                        const formattedValue = text[k].replace(',', '.');
                                        if (isNaN(Number(formattedValue))) {
                                            console.log(foundValue)
                                            return  foundValue
                                        break
                                        }
                                        else {
                                            foundValue += formattedValue
                                        }
                                    }  
                                }
                                else if (dataType === 'string') {
                                    console.log(text[i + 1])
                                    return (text[i + 1])
                                    }
                            }
                        } else {
                            break; 
                        }
                    }
                    if (processStopped) {
                        break; 
                    }
                }
}

export default searchData

