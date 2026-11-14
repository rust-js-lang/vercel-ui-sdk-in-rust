//! Rust adaptation of UI SDK foundation/date/plain-date.ts; see UPSTREAM.md.
// Calendar dates have no time zone. Arithmetic uses Gregorian day numbers,
// never a Date at midnight that could shift across daylight-saving changes.

#[cfg_attr(rust_js, rust_js::name = "ISODate")]
pub type IsoDate = String;

/// Calendar fields: year 1..9999, month 1..12, and a day from 1.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DateParts {
    pub year: f64,
    pub month: f64,
    pub day: f64,
}

#[cfg_attr(rust_js, rust_js::untagged)]
pub enum DateInput<'a> {
    Text(&'a str),
    Date(&'a js::Date),
    Parts(&'a DateParts),
}

// Every payload is a string or an object, never null or undefined.
unsafe impl js::Defined for DateInput<'_> {}

thread_local! {
    static FIRST_DAY: f64 = to_days(1.0, 1.0, 1.0);
    static LAST_DAY: f64 = to_days(9999.0, 12.0, 31.0);
}

/// Whether a value is a real ISO calendar date.
#[cfg_attr(rust_js, rust_js::name = "isISODate")]
pub fn is_iso_date(value: Option<&js::Unknown>) -> js::Is<IsoDate> {
    js::Is::when(value, |text| date_parts(Some(text)).is_some())
}

/// Reads calendar fields, or None for an invalid date.
pub fn date_parts(date: Option<&str>) -> Option<DateParts> {
    let date = date?;
    if date.is_empty() {
        return None;
    }
    let matched = js::reg_exp::new(r"^(\d{4})-(\d{2})-(\d{2})$", "").exec(date)?;
    let parts = DateParts {
        year: js::to_number(matched.get(1)),
        month: js::to_number(matched.get(2)),
        day: js::to_number(matched.get(3)),
    };
    is_real_date(&parts).then_some(parts)
}

/// Formats valid fields, or None if no such date exists.
pub fn iso_date(year: f64, month: f64, day: f64) -> Option<IsoDate> {
    let parts = DateParts { year, month, day };
    is_real_date(&parts).then(|| format(&parts))
}

/// An ISO string, a Date's local calendar fields, or year/month/day data.
#[cfg_attr(rust_js, rust_js::name = "toISODate")]
pub fn to_iso_date(value: Option<&DateInput>) -> Option<IsoDate> {
    let value = js::unknown(value?);
    if let js::Kind::String(text) = js::classify(Some(value)) {
        return is_iso_date(Some(value)).holds().then(|| text.to_owned());
    }
    // Preserve the original same-realm instanceof check rather than treating
    // every object with Date's shape as a Date.
    if js::instance_of(value, js::class::<js::Date>()) {
        // SAFETY: the explicit native instanceof check proves the Date case.
        let date: &js::Date = unsafe { js::cast(Some(value)) };
        return if date.get_time().is_nan() {
            None
        } else {
            iso_date(
                date.get_full_year(),
                date.get_month() + 1.0,
                date.get_date(),
            )
        };
    }
    // SAFETY: the remaining input union is a year/month/day object.
    let parts: &DateParts = unsafe { js::cast(Some(value)) };
    iso_date(parts.year, parts.month, parts.day)
}

const MONTH_LENGTHS: [f64; 12] = [
    31.0, 28.0, 31.0, 30.0, 31.0, 30.0, 31.0, 31.0, 30.0, 31.0, 30.0, 31.0,
];

/// Days in a month, or zero for a nonexistent month.
pub fn days_in_month(year: f64, month: f64) -> f64 {
    if month == 2.0 && is_leap_year(year) {
        return 29.0;
    }
    // JS indexes with the original number, including fractions/NaN. Do not
    // narrow it to a Rust integer, which would change the lookup.
    // SAFETY: this private array's numeric properties are numbers or absent.
    let length: Option<f64> =
        unsafe { js::cast(js::get(MONTH_LENGTHS.as_slice(), &(month - 1.0))) };
    length.unwrap_or(0.0)
}

/// Moves by days, clamping between years 1 and 9999.
pub fn add_days(date: &str, days: f64) -> IsoDate {
    from_days(clamp_days(days_of(date) + days))
}

/// Moves by months, retaining the day where it exists.
pub fn add_months(date: &str, months: f64) -> IsoDate {
    let DateParts { year, month, day } = parts_of(date);
    let index = year * 12.0 + month - 1.0 + months;
    let next_year = (index / 12.0).floor();
    if next_year < 1.0 {
        return FIRST_DAY.with(|first| format(&from_day_number(*first)));
    }
    if next_year > 9999.0 {
        return LAST_DAY.with(|last| format(&from_day_number(*last)));
    }
    let next_month = index - next_year * 12.0 + 1.0;
    format(&DateParts {
        year: next_year,
        month: next_month,
        day: js::math::min((day, days_in_month(next_year, next_month))),
    })
}

/// February 29 moves to February 28 in a common year.
pub fn add_years(date: &str, years: f64) -> IsoDate {
    add_months(date, years * 12.0)
}

pub fn days_between(from: &str, to: &str) -> f64 {
    days_of(to) - days_of(from)
}

/// Sunday is 0, Saturday 6, as Date#getDay counts.
pub fn weekday(date: &str) -> f64 {
    // Day 0, January 1 1970, was a Thursday.
    (((days_of(date) + 4.0) % 7.0) + 7.0) % 7.0
}

pub fn start_of_week(date: &str, week_starts_on: Option<f64>) -> IsoDate {
    let week_starts_on = week_starts_on.unwrap_or(0.0);
    add_days(date, -((weekday(date) - week_starts_on + 7.0) % 7.0))
}

pub fn end_of_week(date: &str, week_starts_on: Option<f64>) -> IsoDate {
    add_days(&start_of_week(date, week_starts_on), 6.0)
}

pub fn start_of_month(date: &str) -> IsoDate {
    format!("{}01", js::string::slice(date, 0.0, Some(8.0)))
}

pub fn end_of_month(date: &str) -> IsoDate {
    let DateParts { year, month, .. } = parts_of(date);
    format(&DateParts {
        year,
        month,
        day: days_in_month(year, month),
    })
}

pub fn is_same_month(a: &str, b: &str) -> bool {
    js::string::slice(a, 0.0, Some(7.0)) == js::string::slice(b, 0.0, Some(7.0))
}

pub fn clamp_date<'a>(date: &'a str, min: Option<&'a str>, max: Option<&'a str>) -> &'a str {
    if let Some(min) = min
        && !min.is_empty()
        && date.encode_utf16().cmp(min.encode_utf16()).is_lt()
    {
        return min;
    }
    if let Some(max) = max
        && !max.is_empty()
        && date.encode_utf16().cmp(max.encode_utf16()).is_gt()
    {
        return max;
    }
    date
}

#[derive(Default)]
pub struct MonthGridOptions {
    pub week_starts_on: Option<f64>,
    pub fixed_weeks: Option<bool>,
}

/// Six weeks by default; surrounding months fill each week.
pub fn month_grid(month: &str, options: Option<&MonthGridOptions>) -> Vec<Vec<IsoDate>> {
    let defaults = MonthGridOptions::default();
    let options = options.unwrap_or(&defaults);
    let first = start_of_month(month);
    let start = days_of(&start_of_week(&first, options.week_starts_on));
    let end = days_of(&end_of_month(&first));
    let count = if options.fixed_weeks == Some(false) {
        ((end - start + 1.0) / 7.0).ceil()
    } else {
        6.0
    };
    let mut weeks = Vec::new();
    let mut row = 0.0;
    while row < count {
        let mut week = Vec::new();
        let mut column = 0.0;
        while column < 7.0 {
            week.push(from_days(clamp_days(start + row * 7.0 + column)));
            column += 1.0;
        }
        weeks.push(week);
        row += 1.0;
    }
    weeks
}

// Howard Hinnant's civil-from-days algorithms. Day 0 is January 1 1970.
// https://howardhinnant.github.io/date_algorithms.html
fn to_days(year: f64, month: f64, day: f64) -> f64 {
    let shifted = if month <= 2.0 { year - 1.0 } else { year };
    let era = (shifted / 400.0).floor();
    let year_of_era = shifted - era * 400.0;
    let day_of_year = ((153.0 * ((month + 9.0) % 12.0) + 2.0) / 5.0).floor() + day - 1.0;
    let day_of_era = year_of_era * 365.0 + (year_of_era / 4.0).floor()
        - (year_of_era / 100.0).floor()
        + day_of_year;
    era * 146097.0 + day_of_era - 719468.0
}

fn from_day_number(days: f64) -> DateParts {
    let shifted = days + 719468.0;
    let era = (shifted / 146097.0).floor();
    let day_of_era = shifted - era * 146097.0;
    let year_of_era = ((day_of_era - (day_of_era / 1460.0).floor()
        + (day_of_era / 36524.0).floor()
        - (day_of_era / 146096.0).floor())
        / 365.0)
        .floor();
    let day_of_year = day_of_era
        - (365.0 * year_of_era + (year_of_era / 4.0).floor() - (year_of_era / 100.0).floor());
    let shifted_month = ((5.0 * day_of_year + 2.0) / 153.0).floor();
    let month = if shifted_month < 10.0 {
        shifted_month + 3.0
    } else {
        shifted_month - 9.0
    };
    let day = day_of_year - ((153.0 * shifted_month + 2.0) / 5.0).floor() + 1.0;
    DateParts {
        year: year_of_era + era * 400.0 + if month <= 2.0 { 1.0 } else { 0.0 },
        month,
        day,
    }
}

fn from_days(days: f64) -> IsoDate {
    format(&from_day_number(days))
}

fn clamp_days(days: f64) -> f64 {
    FIRST_DAY
        .with(|first| LAST_DAY.with(|last| js::math::min((js::math::max((days, *first)), *last))))
}

fn parts_of(date: &str) -> DateParts {
    date_parts(Some(date)).unwrap_or_else(|| {
        js::throw(
            js::range_error::new(
                Some(&format!("\"{date}\" is not an ISO date (YYYY-MM-DD).")),
                None,
            )
            .as_unknown(),
        )
    })
}

fn days_of(date: &str) -> f64 {
    let DateParts { year, month, day } = parts_of(date);
    to_days(year, month, day)
}

fn is_leap_year(year: f64) -> bool {
    year % 4.0 == 0.0 && (year % 100.0 != 0.0 || year % 400.0 == 0.0)
}

fn is_real_date(parts: &DateParts) -> bool {
    let DateParts { year, month, day } = *parts;
    year.fract() == 0.0
        && month.fract() == 0.0
        && day.fract() == 0.0
        && (1.0..=9999.0).contains(&year)
        && (1.0..=12.0).contains(&month)
        && day >= 1.0
        && day <= days_in_month(year, month)
}

fn pad(value: f64, width: usize) -> String {
    format!("{:0>width$}", js::shown(value))
}

fn format(parts: &DateParts) -> IsoDate {
    let DateParts { year, month, day } = *parts;
    format!("{}-{}-{}", pad(year, 4), pad(month, 2), pad(day, 2))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn day_number_origin_and_supported_endpoints() {
        assert_eq!(to_days(1970.0, 1.0, 1.0), 0.0);
        assert_eq!(to_days(1.0, 1.0, 1.0), -719162.0);
        assert_eq!(to_days(9999.0, 12.0, 31.0), 2932896.0);
        assert_eq!(
            from_day_number(0.0),
            DateParts {
                year: 1970.0,
                month: 1.0,
                day: 1.0
            }
        );
    }

    #[test]
    fn complete_gregorian_cycle_round_trips_every_day() {
        let first = to_days(2000.0, 3.0, 1.0);
        for offset in 0..146097 {
            let day = first + f64::from(offset);
            let parts = from_day_number(day);
            assert_eq!(to_days(parts.year, parts.month, parts.day), day);
            assert!(parts.month >= 1.0 && parts.month <= 12.0);
            let length = if parts.month == 2.0 && is_leap_year(parts.year) {
                29.0
            } else {
                MONTH_LENGTHS[parts.month as usize - 1]
            };
            assert!(parts.day >= 1.0 && parts.day <= length);
        }
    }

    #[test]
    fn gregorian_centuries_and_leap_days() {
        assert!(!is_leap_year(1900.0));
        assert!(is_leap_year(2000.0));
        assert!(!is_leap_year(2100.0));
        assert_eq!(to_days(2000.0, 3.0, 1.0) - to_days(2000.0, 2.0, 28.0), 2.0);
        assert_eq!(to_days(1900.0, 3.0, 1.0) - to_days(1900.0, 2.0, 28.0), 1.0);
    }
}
