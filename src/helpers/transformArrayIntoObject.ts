export default function transformRectArrayIntoObject (rectArray: SVGRectElement[]) {
    const parsedObject: any = {};

    rectArray.forEach((rect: SVGRectElement) => {
        const textLine: string | undefined = rect.attributes
            .getNamedItem("data-text-line")?.value;

        if (!textLine) return;

        parsedObject[textLine] = rect;
    })
    return parsedObject;
}