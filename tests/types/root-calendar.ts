import {isoDate, type ISODate} from "../../crates/core/src/lib.js";
const value: ISODate = "2024-02-29";
const formatted: ISODate | null | undefined = isoDate(2024, 2, 29);
// @ts-expect-error ISO dates retain the string representation.
const invalid: ISODate = 20240229;
void [value, formatted, invalid];
