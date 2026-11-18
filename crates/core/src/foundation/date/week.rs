//! Rust adaptation of UI SDK foundation/date/week.ts; see UPSTREAM.md.
// The first day of the week for a locale. Browsers give it through
// `Intl.Locale#getWeekInfo`, but Firefox only has it since 153 (ESR 140
// doesn't) and older Chrome and Safari named it `weekInfo`, so a table of
// CLDR's regions covers the rest.

use std::cell::RefCell;
use std::collections::HashMap;
use std::panic;

use js::intl::{self, Locale};

thread_local! {
    // Regions whose week doesn't start on Monday, from CLDR's `weekData.firstDay`:
    // https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/weekData.json
    static REGION_DAYS: HashMap<&'static str, f64> = {
        let mut region_days = HashMap::new();
        for (day, regions) in [
            (
                0.0,
                "AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW",
            ),
            (5.0, "MV"),
            (6.0, "AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY"),
        ] {
            for region in regions.split(' ') {
                region_days.insert(region, day);
            }
        }
        region_days
    };
}

// The `-u-fw-` extension a tag can carry to pick the first day itself, like `en-US-u-fw-mon`.
#[cfg_attr(rust_js, rust_js::name = "extensionDays")]
const EXTENSION_DAYS: [&str; 7] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

thread_local! {
    static CACHE: RefCell<HashMap<String, f64>> = RefCell::new(HashMap::new());
}

/// The day a week starts on in a locale, 0 for Sunday to 6 for Saturday, as
/// `Date#getDay` counts: 0 in the United States, 1 in most of Europe, 6 in much
/// of the Middle East. A tag's `-u-fw-` extension wins. Without a locale, the
/// runtime's own.
/// @stable
#[cfg_attr(rust_js, rust_js::none_undefined(locale))]
pub fn first_day_of_week(locale: Option<&str>) -> f64 {
    let key = locale.unwrap_or("");
    CACHE.with_borrow_mut(|cache| {
        *cache
            .entry(key.to_string())
            .or_insert_with(|| resolve_first_day(locale))
    })
}

fn resolve_first_day(locale: Option<&str>) -> f64 {
    let Ok(tag) = intl::locale::new(
        locale.map_or_else(
            || {
                intl::date_time_format::new(None, None)
                    .resolved_options()
                    .locale
            },
            str::to_string,
        ),
        None,
    ) else {
        return 1.0;
    };
    let extension = js::reg_exp::new(r"-u(?:-[a-z0-9]{2,8})*?-fw-([a-z]{3})\b", "i")
        .exec(&tag.to_string())
        .and_then(|matched| matched.get(1))
        .map(|extension| extension.to_lowercase());
    if let Some(day) =
        extension.and_then(|extension| EXTENSION_DAYS.iter().position(|&day| day == extension))
    {
        return day as f64;
    }
    // `getWeekInfo` counts from 1 for Monday to 7 for Sunday.
    if let Some(info) = week_info(tag) {
        return info.first_day % 7.0;
    }
    REGION_DAYS
        .with(|region_days| {
            region_days
                .get(tag.maximize().region().as_deref().unwrap_or(""))
                .copied()
        })
        .unwrap_or(1.0)
}

/// A locale of an older Chrome's or Safari's, which names its week info
/// `weekInfo`, as it was before `getWeekInfo`.
#[cfg_attr(rust_js, rust_js::types = "Intl.Locale & { weekInfo?: Intl.WeekInfo }")]
struct LegacyWeekLocale {
    week_info: Option<intl::WeekInfo>,
}

fn week_info(tag: &Locale) -> Option<intl::WeekInfo> {
    // SAFETY: an `Intl.Locale` is an object, whose `weekInfo` is its week
    // info where the host has it.
    let locale: &LegacyWeekLocale = unsafe { js::cast(Some(js::unknown(tag))) };
    panic::catch_unwind(|| {
        js::optional_call((tag, Locale::get_week_info), ()).or_else(|| locale.week_info.clone())
    })
    .unwrap_or(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn regions_whose_week_starts_on_another_day() {
        REGION_DAYS.with(|region_days| {
            assert_eq!(region_days.get("US"), Some(&0.0));
            assert_eq!(region_days.get("MV"), Some(&5.0));
            assert_eq!(region_days.get("EG"), Some(&6.0));
            assert_eq!(region_days.get("DE"), None);
            assert_eq!(region_days.len(), 71);
        });
    }

    #[test]
    fn extension_days_count_as_date_get_day() {
        assert_eq!(EXTENSION_DAYS.iter().position(|&day| day == "sun"), Some(0));
        assert_eq!(EXTENSION_DAYS.iter().position(|&day| day == "sat"), Some(6));
    }
}
