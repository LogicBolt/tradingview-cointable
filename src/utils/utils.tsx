export const roundBigUnit = (number: number, digits: number = 3) => {

    let unitNum = 0
    const unitName = ['', 'K', 'M', 'B','T']
    while (number >= 1000) {

        unitNum++
        number /= 1000

        if (unitNum > 3) {
            break
        }
    }

    return `${roundDecimal(number, digits)} ${unitName[unitNum]}`
}

export const roundDecimal = (number: number, digits: number = 3) => {
    return number.toLocaleString('en-US', { maximumFractionDigits: digits });
}