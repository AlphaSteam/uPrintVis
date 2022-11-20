export default function convertValueFromOneRangeToAnother(
    { value, oldMin, oldMax, newMin, newMax }: {
    value: number, oldMin: number, oldMax: number,
    newMin: number, newMax: number
}): number {
    const oldRange = (oldMax - oldMin)

    let newValue : number;

    if (oldRange == 0)
        newValue = newMin
    else {
        const newRange = (newMax - newMin)

        newValue = (((value - oldMin) * newRange) / oldRange) + newMin
    }

    return newValue;
}
