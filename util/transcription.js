import numberDict from "../language/numbers_dict.json";
const numbersDict = require("../language/numbers_dict.json");

function decomposeNumber(numStr) {
    if (isNaN(numStr)) {
        throw new Error('Input must be a numeric string');
    }

    let numList = [];
    let numLength = numStr.length;

    for (let i = 0; i < numLength; i++) {
        let decomposedNum = numStr[i];
        numList.push(decomposedNum);
    }

    // If input number is less than 1000, we pad the array with zeros to ensure thousands, hundreds, tens, units positions
    while (numList.length < 4) {
        numList.unshift(0);
    }
    return numList;
}

const numberToWords = (number, prefixAllowed) =>  {

    let outputString = "";
    if (parseFloat(number) < 10000 && parseFloat(number) >0) {
        // remove point and anything after
        let toTranscribe = Math.round(parseFloat(number)).toString();

        let decomposedNumber = decomposeNumber(toTranscribe);

        let thousands = parseFloat(decomposedNumber[0]);
        let hundreds = parseFloat(decomposedNumber[1]);
        let tens = parseFloat(decomposedNumber[2]);
        let ones = parseFloat(decomposedNumber[3]);

        let tensAndUnitsString = ""
        if (tens===0 && ones===0) {
            tensAndUnitsString = "";
        }
        else {
            tensAndUnitsString = " " + numbersDict[tens.toString() + ones.toString()];
        }

        let hundredsString = "";
        if (hundreds !== 0) {
            if (thousands === 0 && hundreds === 1) {
                hundredsString += " " + numbersDict["single_hundred"] + " " + numbersDict["100"];
            }
            else {
                hundredsString += " " + numbersDict["0" + hundreds.toString()] + " " + numbersDict["100"];
            }
            if (tens === 0 && ones !== 0) {
                    hundredsString += " " + numbersDict["connector"];
            }
        }

        let thousandsString = "";
        if (thousands !== 0) {
             if (thousands === 1) {
                thousandsString = " " + numbersDict["single_hundred"] + " " + numbersDict["1000"];
            } else {
                thousandsString = " " + numbersDict["0" + thousands.toString()] + " " + numbersDict["1000"];
            }
        }
        outputString = thousandsString + hundredsString + tensAndUnitsString;

    } else if (parseFloat(number) === 0) {
        outputString = numbersDict["00"]
    }
    else {
        outputString = "";
    }

    if (outputString.length > 0) {
        outputString = outputString.trimStart();
        outputString = outputString.charAt(0).toUpperCase() + outputString.slice(1);
    }

    return outputString;
}

export const floatNumberToWords = (number) => {

    let outString = "";

    if (number < 10000) {
        console.log("floatNumberToWords <==", number)
        const roundedNumber = parseFloat(parseFloat(number).toFixed(2));
        const intPart = Math.trunc(roundedNumber);
        const decimalPart = Math.round((roundedNumber - Math.trunc(roundedNumber)) * 100);
        console.log("float number to word intPart: ", +intPart + ", decimalPart: " + decimalPart);

        outString += numberToWords(intPart.toString(), true);

        if (decimalPart !== 0) {
            outString += " " + numbersDict["point"] + " ";
            let decimal_string = decimalPart.toString()
            if (decimal_string.length === 1) { //no tenth, add "0" in front
                outString += numbersDict["0"] + " " + numberToWords(decimal_string, false)
            } else if (decimal_string.length === 2 && decimal_string[1] === "0") { //round number of tenth, remove following 0
                outString += numberToWords(decimal_string[0], false)
            } else {
                outString += numberToWords(decimal_string);
            }
        }
    }
    return outString.toLowerCase()
}

const numberToAudio = (number,prefixAllowed) => {

    let audioList = [];

    if (parseFloat(number) < 10000 && parseFloat(number) > 0) {

        let toTranscribe = Math.round(parseFloat(number)).toString();
        let decomposedNumber = decomposeNumber(toTranscribe);

        let thousands = parseFloat(decomposedNumber[0]);
        let hundreds = parseFloat(decomposedNumber[1]);
        let tens = parseFloat(decomposedNumber[2]);
        let ones = parseFloat(decomposedNumber[3]);

        //Prefix
        if (prefixAllowed) {
        if (ones===1 && tens===0 && hundreds===0 && thousands===0
        || tens===1 && hundreds===0 && thousands===0
        || hundreds===1 && thousands===0
        || thousands===1) {
            console.log("no prefix")
        } else {
            audioList.push("prefix")
        }}

        //Thousands

        if (thousands !== 0) {
            if (hundreds === 0 && tens === 0 && ones === 0) {
                audioList.push("1000");
            } else if (hundreds === 0 && tens === 0 && ones !== 0) {
                if (ones === 1) {
                    audioList.push("0" + thousands.toString());
                    audioList.push("1000");
                } else {
                    audioList.push("0" + thousands.toString());
                    audioList.push("1000");
                    audioList.push("connector2")
                }
            } else {
                audioList.push("0" + thousands.toString());
                audioList.push("1000");
            }
        }

        //Hundreds

        if (hundreds !== 0) {
            if (tens === 0 && ones === 0) {
                audioList.push("0" + hundreds.toString());
                audioList.push("100");
            } else if (tens === 0 && ones !== 0) {
                if (ones === 1) {
                    audioList.push("0" + hundreds.toString());
                    audioList.push("100");
                } else {
                    audioList.push("0" + hundreds.toString());
                    audioList.push("100");
                    audioList.push("connector2")
                }
            } else if (tens !== 0) {
                audioList.push("0" + hundreds.toString());
                audioList.push("100");
            }
        }

        //TensAndOnes
        if (tens !== 0 || ones !== 0) {
            audioList.push(tens.toString() + ones.toString());
        }
    }
    if (parseFloat(number) === 0) {
        audioList.push("00");
    }
    return audioList
}

export const floatNumberToAudio = (number) => {
    const roundedNumber = parseFloat(parseFloat(number).toFixed(2));
    const intPart = Math.trunc(roundedNumber)
    const decimalPart = Math.round((roundedNumber - Math.trunc(roundedNumber))*100);
    console.log("float number to audio: ",intPart, decimalPart)

    let audioList = numberToAudio(intPart.toString(), true)

    if (decimalPart !== 0) {
        audioList.push("point");

        let decimal_string = decimalPart.toString()
        if (decimal_string.length=== 1) { //no tenth, add "0" in front
            audioList.push("00");
            audioList.push(numberToAudio(decimal_string));
        }
        else if (decimal_string.length === 2 && decimal_string[1] === "0") { //round number of tenth, remove following 0
            audioList.push(numberToAudio(decimal_string[0]));
        }
        else {
            audioList = audioList.concat(numberToAudio(decimalPart.toString(), false))
        }
    }

    return audioList
}
