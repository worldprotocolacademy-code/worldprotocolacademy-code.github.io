/* WPA National Days Integration v1.5
   Integrates MFA seed national holidays with Symbols Lab and bot-feed files.
   Safe: does not break the page if seed fetch fails.
*/
(function() {
  "use strict";

  var WPA_NATIONAL_DAYS_SEED_FALLBACK = [
  {
    "countryId": "cu",
    "sourceEntity": "Cuba",
    "date": "01-01",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "1 Јануари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "sd",
    "sourceEntity": "Sudan",
    "date": "01-01",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "1 Јануари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "au",
    "sourceEntity": "Australia",
    "date": "01-26",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "26 Јануари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "in",
    "sourceEntity": "India",
    "date": "01-26",
    "title": "Republic Day",
    "titleMk": "Republic Day",
    "displayMk": "26 Јануари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "lk",
    "sourceEntity": "Sri Lanka",
    "date": "02-04",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "4 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "nz",
    "sourceEntity": "New Zealand",
    "date": "02-06",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "6 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ir",
    "sourceEntity": "Iran",
    "date": "02-11",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "11 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "rs",
    "sourceEntity": "Serbia",
    "date": "02-15",
    "title": "Statehood Day",
    "titleMk": "Statehood Day",
    "displayMk": "15 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "lt",
    "sourceEntity": "Lithuania",
    "date": "02-16",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "16 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "xk",
    "sourceEntity": "Kosovo",
    "date": "02-17",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "17 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "jp",
    "sourceEntity": "Japan",
    "date": "02-23",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "23 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ee",
    "sourceEntity": "Estonia",
    "date": "02-24",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "24 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "kw",
    "sourceEntity": "Kuwait",
    "date": "02-25",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "25 Февруари",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "bg",
    "sourceEntity": "Bulgaria",
    "date": "03-03",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "3 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "gh",
    "sourceEntity": "Ghana",
    "date": "03-06",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "6 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "va",
    "sourceEntity": "Holy See",
    "date": "03-13",
    "title": "Pontiff’s Day",
    "titleMk": "Pontiff’s Day",
    "displayMk": "13 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "hu",
    "sourceEntity": "Hungary",
    "date": "03-15",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "15 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ie",
    "sourceEntity": "Ireland",
    "date": "03-17",
    "title": "St. Patrick’s Day",
    "titleMk": "St. Patrick’s Day",
    "displayMk": "17 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "xk",
    "sourceEntity": "Kosovo",
    "date": "03-17",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "17 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "pk",
    "sourceEntity": "Pakistan",
    "date": "03-23",
    "title": "Pakistan Day",
    "titleMk": "Pakistan Day",
    "displayMk": "23 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "gr",
    "sourceEntity": "Greece",
    "date": "03-25",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "25 Март",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "cy",
    "sourceEntity": "Cyprus",
    "date": "04-01",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "1 Април",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "xk",
    "sourceEntity": "Kosovo",
    "date": "04-09",
    "title": "Constitution Day",
    "titleMk": "Constitution Day",
    "displayMk": "9 Април",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "dk",
    "sourceEntity": "Denmark",
    "date": "04-16",
    "title": "Birthday of H.M. Queen Margrethe II",
    "titleMk": "Birthday of H.M. Queen Margrethe II",
    "displayMk": "16 Април",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "nl",
    "sourceEntity": "Netherlands",
    "date": "04-27",
    "title": "Official Celebration of King’s Day",
    "titleMk": "Official Celebration of King’s Day",
    "displayMk": "27 Април",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "pl",
    "sourceEntity": "Poland",
    "date": "05-03",
    "title": "Constitution Day",
    "titleMk": "Constitution Day",
    "displayMk": "3 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "il",
    "sourceEntity": "Israel",
    "date": "05-12",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "12 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "no",
    "sourceEntity": "Norway",
    "date": "05-17",
    "title": "Constitution Day",
    "titleMk": "Constitution Day",
    "displayMk": "17 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "me",
    "sourceEntity": "Montenegro",
    "date": "05-21",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "21 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ar",
    "sourceEntity": "Argentina",
    "date": "05-25",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "25 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "jo",
    "sourceEntity": "Hashemite Kingdom of Jordan",
    "date": "05-25",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "25 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ge",
    "sourceEntity": "Georgia",
    "date": "05-26",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "26 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "az",
    "sourceEntity": "Azerbaijan",
    "date": "05-28",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "28 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "hr",
    "sourceEntity": "Croatia",
    "date": "05-30",
    "title": "Statehood Day",
    "titleMk": "Statehood Day",
    "displayMk": "30 Мај",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "it",
    "sourceEntity": "Italy",
    "date": "06-02",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "2 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "dk",
    "sourceEntity": "Denmark",
    "date": "06-05",
    "title": "Constitution Day",
    "titleMk": "Constitution Day",
    "displayMk": "5 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "se",
    "sourceEntity": "Sweden",
    "date": "06-06",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "6 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "pt",
    "sourceEntity": "Portugal",
    "date": "06-10",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "10 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "gb",
    "sourceEntity": "United Kingdom",
    "date": "06-second-saturday",
    "title": "Her Majesty’s Birthday (the second Saturday in June)",
    "titleMk": "Her Majesty’s Birthday (the second Saturday in June)",
    "displayMk": "Јуни — second saturday",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ru",
    "sourceEntity": "Russian Federation",
    "date": "06-12",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "12 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "is",
    "sourceEntity": "Iceland",
    "date": "06-17",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "17 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "lu",
    "sourceEntity": "Luxembourg",
    "date": "06-23",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "23 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": null,
    "sourceEntity": "SMO of Malta",
    "date": "06-24",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "24 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "si",
    "sourceEntity": "Slovenia",
    "date": "06-25",
    "title": "Statehood Day",
    "titleMk": "Statehood Day",
    "displayMk": "25 Јуни",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ca",
    "sourceEntity": "Canada",
    "date": "07-01",
    "title": "Canada Day",
    "titleMk": "Canada Day",
    "displayMk": "1 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "gh",
    "sourceEntity": "Ghana",
    "date": "07-01",
    "title": "Republic Day",
    "titleMk": "Republic Day",
    "displayMk": "1 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "us",
    "sourceEntity": "United States of America",
    "date": "07-04",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "4 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "mw",
    "sourceEntity": "Malawi",
    "date": "07-06",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "6 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "me",
    "sourceEntity": "Montenegro",
    "date": "07-13",
    "title": "Statehood Day",
    "titleMk": "Statehood Day",
    "displayMk": "13 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "fr",
    "sourceEntity": "France",
    "date": "07-14",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "14 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "be",
    "sourceEntity": "Belgium",
    "date": "07-21",
    "title": "Accession of King Leopold I (1831)",
    "titleMk": "Accession of King Leopold I (1831)",
    "displayMk": "21 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "eg",
    "sourceEntity": "Egypt",
    "date": "07-23",
    "title": "Anniversary of Revolution of 23 July, 1952",
    "titleMk": "Anniversary of Revolution of 23 July, 1952",
    "displayMk": "23 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ma",
    "sourceEntity": "Morocco",
    "date": "07-30",
    "title": "Accession to the Throne of King Mohamed VI",
    "titleMk": "Accession to the Throne of King Mohamed VI",
    "displayMk": "30 Јули",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ch",
    "sourceEntity": "Switzerland",
    "date": "08-01",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "1 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "li",
    "sourceEntity": "Liechtenstein",
    "date": "08-15",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "15 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": null,
    "sourceEntity": "Korea",
    "date": "08-15",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "15 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "id",
    "sourceEntity": "Indonesia",
    "date": "08-17",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "17 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "af",
    "sourceEntity": "Afghanistan",
    "date": "08-19",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "19 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "hu",
    "sourceEntity": "Hungary",
    "date": "08-20",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "20 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ua",
    "sourceEntity": "Ukraine",
    "date": "08-24",
    "title": "Day of Independence",
    "titleMk": "Day of Independence",
    "displayMk": "24 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "uy",
    "sourceEntity": "Uruguay",
    "date": "08-25",
    "title": "Day of Independence",
    "titleMk": "Day of Independence",
    "displayMk": "25 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "md",
    "sourceEntity": "Moldova",
    "date": "08-27",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "27 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "my",
    "sourceEntity": "Malaysia",
    "date": "08-31",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "31 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "kg",
    "sourceEntity": "Kyrgyzstan",
    "date": "08-31",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "31 Август",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "sk",
    "sourceEntity": "Slovakia",
    "date": "09-01",
    "title": "Constitution Day",
    "titleMk": "Constitution Day",
    "displayMk": "1 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "vn",
    "sourceEntity": "Vietnam",
    "date": "09-02",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "2 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "sm",
    "sourceEntity": "San Marino",
    "date": "09-03",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "3 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "br",
    "sourceEntity": "Brazil",
    "date": "09-07",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "7 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ad",
    "sourceEntity": "Andorra",
    "date": "09-08",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "8 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": null,
    "sourceEntity": "Korea",
    "date": "09-09",
    "title": "Republic Day",
    "titleMk": "Republic Day",
    "displayMk": "9 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "mx",
    "sourceEntity": "Mexico",
    "date": "09-16",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "16 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "mt",
    "sourceEntity": "Malta",
    "date": "09-21",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "21 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "sa",
    "sourceEntity": "Saudi Arabia",
    "date": "09-23",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "23 Септември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "cn",
    "sourceEntity": "P.R. of China",
    "date": "10-01",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "1 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": true,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "cy",
    "sourceEntity": "Cyprus",
    "date": "10-01",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "1 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "de",
    "sourceEntity": "Germany",
    "date": "10-03",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "3 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "es",
    "sourceEntity": "Spain",
    "date": "10-12",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "12 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "hu",
    "sourceEntity": "Hungary",
    "date": "10-23",
    "title": "Revolution Memorial Day",
    "titleMk": "Revolution Memorial Day",
    "displayMk": "23 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "zm",
    "sourceEntity": "Zambia",
    "date": "10-24",
    "title": "National Holiday",
    "titleMk": "National Holiday",
    "displayMk": "24 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "kz",
    "sourceEntity": "Kazakhstan",
    "date": "10-25",
    "title": "Day of the Republic",
    "titleMk": "Day of the Republic",
    "displayMk": "25 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "at",
    "sourceEntity": "Austria",
    "date": "10-26",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "26 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "cz",
    "sourceEntity": "Czech Republic",
    "date": "10-28",
    "title": "Independent Czechoslovak State Day",
    "titleMk": "Independent Czechoslovak State Day",
    "displayMk": "28 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "tr",
    "sourceEntity": "Turkey",
    "date": "10-29",
    "title": "Republic Day",
    "titleMk": "Republic Day",
    "displayMk": "29 Октомври",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "dz",
    "sourceEntity": "Algeria",
    "date": "11-01",
    "title": "Anniversary of the Revolution of 1 November 1954",
    "titleMk": "Anniversary of the Revolution of 1 November 1954",
    "displayMk": "1 Ноември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "pl",
    "sourceEntity": "Poland",
    "date": "11-11",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "11 Ноември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "lv",
    "sourceEntity": "Latvia",
    "date": "11-18",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "18 Ноември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "mc",
    "sourceEntity": "Monaco",
    "date": "11-19",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "19 Ноември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ba",
    "sourceEntity": "Bosnia and Herzegovina",
    "date": "11-25",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "25 Ноември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "al",
    "sourceEntity": "Albania",
    "date": "11-28",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "28 Ноември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ro",
    "sourceEntity": "Romania",
    "date": "12-01",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "1 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "ae",
    "sourceEntity": "UAE",
    "date": "12-02",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "2 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "fi",
    "sourceEntity": "Finland",
    "date": "12-06",
    "title": "Day of Independence",
    "titleMk": "Day of Independence",
    "displayMk": "6 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "bh",
    "sourceEntity": "Bahrein",
    "date": "12-16",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "16 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "kz",
    "sourceEntity": "Kazakhstan",
    "date": "12-16",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "16 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "qa",
    "sourceEntity": "Qatar",
    "date": "12-18",
    "title": "National Day",
    "titleMk": "National Day",
    "displayMk": "18 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  },
  {
    "countryId": "si",
    "sourceEntity": "Slovenia",
    "date": "12-26",
    "title": "Independence Day",
    "titleMk": "Independence Day",
    "displayMk": "26 Декември",
    "verificationStatus": "source_seed_needs_final_verification",
    "sensitiveStatusNoteRequired": false,
    "source": "MFA National Holidays seed dataset"
  }
];

  function parseDateParts(date) {
    if (!date || typeof date !== "string") return null;
    var m = date.match(/^(\d{2})-(\d{2})$/);
    if (!m) return null;
    return { month: parseInt(m[1], 10), day: parseInt(m[2], 10) };
  }

  function normalizeForPage(e) {
    var d = parseDateParts(e.date);
    if (!d || !e.countryId) return null;
    return {
      countryId: e.countryId,
      month: d.month,
      day: d.day,
      title: e.title || e.titleMk || "National Day",
      titleMk: e.titleMk || e.title || "National Day",
      source: e.source || "MFA National Holidays seed dataset",
      verificationStatus: e.verificationStatus || "source_seed_needs_final_verification",
      sensitiveStatusNoteRequired: !!e.sensitiveStatusNoteRequired
    };
  }

  function mergeSeed(seed) {
    window.WPA_NATIONAL_DAYS_SEED = seed || WPA_NATIONAL_DAYS_SEED_FALLBACK;
    try {
      if (typeof nationalHolidays !== "undefined" && Array.isArray(nationalHolidays)) {
        var existing = new Set(nationalHolidays.map(function(x) {
          return [x.countryId, x.month, x.day, x.title].join("|");
        }));
        var added = 0;
        window.WPA_NATIONAL_DAYS_SEED.forEach(function(e) {
          var n = normalizeForPage(e);
          if (!n) return;
          var key = [n.countryId, n.month, n.day, n.title].join("|");
          if (!existing.has(key)) {
            nationalHolidays.push(n);
            existing.add(key);
            added++;
          }
        });
        window.WPA_NATIONAL_DAYS_INTEGRATION_STATUS = {
          loaded: true,
          seedCount: window.WPA_NATIONAL_DAYS_SEED.length,
          mergedIntoPage: added,
          totalInPage: nationalHolidays.length,
          source: "MFA seed + WPA National Days add-on"
        };
        if (typeof renderUpcomingHolidays === "function") renderUpcomingHolidays();
        if (typeof renderCountries === "function") renderCountries();
      } else {
        window.WPA_NATIONAL_DAYS_INTEGRATION_STATUS = {
          loaded: true,
          seedCount: window.WPA_NATIONAL_DAYS_SEED.length,
          mergedIntoPage: 0,
          note: "nationalHolidays array not accessible; seed exposed for bot/runtime only"
        };
      }
    } catch (err) {
      window.WPA_NATIONAL_DAYS_INTEGRATION_STATUS = {
        loaded: false,
        error: String(err),
        seedCount: (seed || WPA_NATIONAL_DAYS_SEED_FALLBACK).length
      };
    }
  }

  function loadSeed() {
    if (typeof fetch !== "function") {
      mergeSeed(WPA_NATIONAL_DAYS_SEED_FALLBACK);
      return;
    }
    fetch("./national-holidays-mfa-seed.json", { cache: "no-store" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (data && Array.isArray(data.entries)) {
          var converted = data.entries.map(function(e) {
            return {
              countryId: null,
              sourceEntity: e.en_name || e.mk_name || "",
              date: e.national_day_date_iso || "",
              title: e.national_day_name_en || e.national_day_name_mk || "",
              titleMk: e.national_day_name_mk || e.national_day_name_en || "",
              displayMk: e.national_day_date_display_mk || "",
              verificationStatus: e.verification_status || "source_seed_needs_final_verification",
              sensitiveStatusNoteRequired: !!e.sensitive_status_note_required,
              source: "MFA National Holidays seed dataset"
            };
          });
          // Use fallback mapping because it contains countryId normalization.
          mergeSeed(WPA_NATIONAL_DAYS_SEED_FALLBACK.length ? WPA_NATIONAL_DAYS_SEED_FALLBACK : converted);
        } else {
          mergeSeed(WPA_NATIONAL_DAYS_SEED_FALLBACK);
        }
      })
      .catch(function() {
        mergeSeed(WPA_NATIONAL_DAYS_SEED_FALLBACK);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSeed);
  } else {
    loadSeed();
  }
})();
