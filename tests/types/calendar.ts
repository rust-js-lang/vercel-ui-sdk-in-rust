import {isISODate, type ISODate} from "../../crates/core/src/foundation/date/plain_date.js";
declare const value: unknown;
if (isISODate(value)) {
  const date: string = value;
  console.log(date);
}
const typed: ISODate = "2024-02-29";
console.log(typed);

// Unknown includes null and undefined, but the input argument is required.
isISODate(null);
isISODate(undefined);
// @ts-expect-error The public validator requires its input argument.
isISODate();
