import crypto from "node:crypto";
/**
 * Sets an expiry date based on a validity period string.
 * @param {string} validityPeriod - A string like "10 minutes" or "2 hours".
 * @returns {Date} The expiry date and time.
 * @throws {Error} If the time unit is invalid.
 */
export function setExpiryDate(validityPeriod) {
    const [n, t] = validityPeriod.split(" ");
    const num = parseInt(n, 10);
    let multiplier;
    const time = t.toLowerCase();
    if (time.includes("second"))
        multiplier = 1000;
    else if (time.includes("minute"))
        multiplier = 60 * 1000;
    else if (time.includes("hour"))
        multiplier = 60 * 60 * 1000;
    else
        throw new Error("Invalid time unit. Only 'seconds', 'minutes' or 'hours' are supported.");
    const expiryTime = Date.now() + num * multiplier;
    return new Date(expiryTime);
}
/**
 * Checks if the supplied date has expired.
 * @param {Date | string | number} expiryTime - The expiry time as a Date object, timestamp, or ISO string.
 * @returns {boolean} True if expired, otherwise false.
 */
export function isDateExpired(expiryTime) {
    if (!expiryTime)
        return true;
    return Date.now() > new Date(expiryTime).getTime();
}
export function randomString(lengthOrPattern, type) {
    const DEFAULT_STR_LENGTH = 16;
    // Define character sets
    const charSets = {
        numeric: "0123456789",
        num: "0123456789",
        alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        alphanum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    };
    const getUnbiasedRandomChar = (charset) => {
        const charsetLength = charset.length;
        const bytesNeeded = Math.ceil(Math.log(charsetLength) / Math.log(256));
        const maxValidValue = Math.floor(256 ** bytesNeeded / charsetLength) * charsetLength;
        while (true) {
            const randomBytes = crypto.randomBytes(bytesNeeded);
            let randomValue = 0;
            for (let i = 0; i < bytesNeeded; i++) {
                randomValue = randomValue * 256 + randomBytes[i];
            }
            if (randomValue < maxValidValue) {
                return charset[randomValue % charsetLength];
            }
        }
    };
    if (lengthOrPattern === undefined ||
        lengthOrPattern === null ||
        typeof lengthOrPattern === "number") {
        const length = lengthOrPattern || DEFAULT_STR_LENGTH;
        const charset = type ? charSets[type] : charSets["alphanumeric"];
        // Generate token of specified length
        let token = "";
        for (let i = 0; i < length; i++) {
            token += getUnbiasedRandomChar(charset);
        }
        return token;
    }
    // Handle pattern string
    const pattern = lengthOrPattern;
    return pattern.replace(/[9aA]/g, (match) => {
        let charset = "";
        if (match === "9")
            charset = charSets.numeric;
        else if (match === "A")
            charset = charSets.uppercase;
        else if (match === "a")
            charset = charSets.alphabetic;
        return getUnbiasedRandomChar(charset);
    });
}
