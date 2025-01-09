export class Util {
    asciiDifferenceFlexible (str1: string | null | undefined, str2: string | null | undefined): number {
        if (str1 && str2) {
            const minLength = Math.min(str1.length, str2.length);
            for (let i = 0; i < minLength; i++) {
                const char1 = str1.charCodeAt(i);
                const char2 = str2.charCodeAt(i);
                if (char1 !== char2) {
                    return char1 - char2;
                }
            }
            return str1.length - str2.length;
        } else if (!str1 && str2) {
            return -1;
        } else if (str1 && !str2) {
            return 1;
        } else {
            return 0;
        }
    }

    getIntersection<T>(array1: T[], array2: T[], ...keys: Array<keyof T>) {
        return array1.filter((obj1) =>
            array2.find((obj2) => keys.every((k) => obj1[k] === obj2[k]))
        );
    }
}

export default Util;