export default function transformRectArrayIntoObject (rectArray: SVGRectElement[]) {
    const parsedObject: any = {};

    rectArray.forEach((rect: SVGRectElement, index) => {
        const textLine: string | undefined = rect.attributes
            .getNamedItem("data-text-line")?.value || index.toString();

        parsedObject[textLine] = rect;
    })
    return parsedObject;
}