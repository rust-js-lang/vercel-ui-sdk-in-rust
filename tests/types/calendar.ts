import {isISODate, type ISODate} from "../../crates/core/src/foundation/date/plain_date.js";
declare const value: unknown;
if (isISODate(value)) {
  const date: string = value;
  console.log(date);
}
const typed: ISODate = "2024-02-29";
console.log(typed);
