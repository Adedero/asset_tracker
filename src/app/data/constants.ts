import { APP_NAME as applicationName, AVAILABLE_EMAILS } from "@/utils/constants";

export const APP_NAME = applicationName;
export const COPYRIGHT_YEAR = 2022;
export const SUPPORT_EMAIL = AVAILABLE_EMAILS.Support;

export const ALL_EMAILS = Object.entries(AVAILABLE_EMAILS).map(([key, value]) => ({
  name: key,
  address: value
}));

export const FETCH_TIMEOUT = 30 * 1000; //30 seconds;
export const MAX_PROFILE_IMG_SIZE = 2 * 1024 * 1024; //2MB
export const GIFT_CARD_TYPES = [
  "Apple/iTunes",
  "Amazon",
  "Google Play",
  "Steam",
  "Razer Gold",
  "eBay",
  "American Express",
  "Nordstrom",
  "Nike"
];
export const GIFT_CARD_COUNTRIES = ["Canada", "United Kingdom", "United States"];
export const MAX_CURRENCY_IMG_SIZE = 1024 * 1024; //1MB

export const EMAIL_MAX_FILES = 20;
export const EMAIL_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const EMAIL_ATTACHMENT_ACCEPT = `
  image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml,
  application/pdf,
  application/msword,
  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
  application/vnd.ms-excel,
  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
  application/vnd.ms-powerpoint,
  application/vnd.openxmlformats-officedocument.presentationml.presentation,
  text/plain,text/csv,
  application/zip,application/x-rar-compressed,application/x-7z-compressed,
  application/vnd.oasis.opendocument.text,
  application/vnd.oasis.opendocument.spreadsheet,
  audio/mpeg,audio/wav,audio/ogg,
  video/mp4,video/x-msvideo,video/quicktime
`;

export const EMAIL_FILES_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "tiff",
  "svg",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
  "rar",
  "7z",
  "odt",
  "ods",
  "mp3",
  "wav",
  "ogg",
  "mp4",
  "avi",
  "mov"
];
