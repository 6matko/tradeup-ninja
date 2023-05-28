import { DecodedSkinInfo } from '@server/core/interfaces/utils.interface';
import { decompress } from 'lzutf8';

/**
 * Method removes time from provided date and returns it
 *
 * @export
 * @param {(Date | string)} date Date from which time should be stripped off
 * @param {boolean} [returnAsDate] Optional flag that will return converted date as `Date` object instead
 * of numeric value.
 * @returns {(number | Date)} Returns `number` which represents Date in numeric value if `returnAsDate` flag was falsy.
 * Returns `Date` object with date (without time) if `returnAsDate` flag was `true`
 */
export function getDateWithoutTime(date: Date | string, returnAsDate?: boolean): number | Date {
  // Not doing anything if date not provided
  if (!date) {
    return;
  }

  // If date is string then converting it to Date object
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const dateWithoutTime = getUTCDate(date as Date).getTime();
  return returnAsDate ? new Date(dateWithoutTime) : dateWithoutTime;
}

/**
 * Method checks if provided object is valid Date object
 *
 * @param {Date} obj Date object to validate
 * @returns {boolean} Returns `true` if provided object is valid Date object
 */
function isValidDate(obj: Date): boolean {
  return !(obj === null || typeof obj === 'undefined' || typeof obj.getFullYear !== 'function');
}

/**
 * Method gets UTC date without time offset
 *
 * @export
 * @param {Date} date Date object
 * @returns {Date} Returns UTC date without time offset
 */
export function getUTCDate(date: Date): Date {
  // Checking if date is valid. If its not valid date then returning it back
  if (!isValidDate(date)) {
    return date;
  }
  // Setting year, month and day for quick access
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  // Creating date without time
  const dateWithoutTime = new Date(year, month, day);
  // Getting time offset
  const offset = -dateWithoutTime.getTimezoneOffset();
  // Adding local offset
  const utcDate = dateWithoutTime.setUTCMinutes(offset);
  // Returning our UTC date without time offset
  return new Date(utcDate);
}

/**
 * Method copies provided value to clipboard.
 * Src: https://stackoverflow.com/a/49121680/5347059
 *
 * @export
 * @param {string} val Value that has to be copied to clipboard
 */
export function copyToClipboard(val: string) {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = val;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);
}

/**
 * Method decompresses information in query string and returns parsed tradeup information
 *
 * @export
 * @template T
 * @param {string} queryParams Query params that have to be decompreessed (contain compreessed tradeup info)
 * @returns {T} Returns decompressed tradeup information for recreation
 * @memberof TradeupShareResolverService
 */
export function decompressQuery<T>(queryParams: string): T {
  // Getting byte array from query string
  const compressedByteArray = queryParams
    // Since its a string them making it to string array
    .split(',')
    // And since we need byte array then converting string to number (int)
    .map((byte) => +byte);

  // Decompressing string
  const decompressed = decompress(new Uint8Array(compressedByteArray));
  // Parsing stringified value that was compreessed. It should contain information about tradeup
  // that should be recreated
  return JSON.parse(decompressed) as T;
}

export function sortAlphabeticallyByKey(a: unknown, b: unknown, key: string) {
  if (a[key] < b[key]) {
    return -1;
  }
  if (a[key] > b[key]) {
    return 1;
  }
  return 0;
}

export function decodeIdToSkin(id: string): DecodedSkinInfo {
  const content = atob(id).split('--');
  // If we have information about ST then length will be 3 items and therefore
  // we can splice array and convert it to true so our content array will consist
  // only of wear index and skin name
  const isStattrak = content.length === 3 ? !!content.splice(0, 1) : false;
  return {
    stattrak: isStattrak,
    wearIndex: +content[0],
    name: content[1]
  };
}

export function decodeWeaponName(id: string): string {
  try {
    return decodeIdToSkin(id)?.name;
  } catch (err) {
    return undefined;
  }
}
