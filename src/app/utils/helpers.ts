export const maskEmail = (email: string | undefined) => {
  if (!email) {
    return "";
  }
  const [localPart, domain] = email.split("@");
  if (localPart && localPart.length < 4) {
    return email;
  }
  const maskedLocalPart = localPart?.slice(0, 3) + "********";
  return `${maskedLocalPart}@${domain ?? ""}`;
};

export const toTitleCase = (text: string | undefined) => {
  if (!text) {
    return "";
  }
  const parts = text.split("-");
  return parts.map((part) => part.charAt(0).toUpperCase() + part.toLowerCase().slice(1)).join(" ");
};

export const dollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});


export const slugify = (text?: string) => {
  return !text ? '' : text
    .normalize("NFD") // Normalize Unicode (é → e, ñ → n)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with '-'
    .replace(/^-+|-+$/g, '') // Remove leading & trailing hyphens
}


type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | Date
  | JSONObject 
  | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

export function removeNullsRecursively<T extends JSONValue>(input: T | Partial<T>): T {
  if (input === null) {
    return undefined as unknown as T; // gets removed by parent
  }

  if (Array.isArray(input)) {
    const cleanedArray = input
      .map(item => removeNullsRecursively(item))
      .filter(item => item !== undefined);
    return cleanedArray as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanedObj: JSONObject = {};
    for (const [key, value] of Object.entries(input)) {
      const cleanedValue = removeNullsRecursively(value);
      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue;
      }
    }
    return cleanedObj as T;
  }

  return input;
}
