# Phone fields silently truncate at 10 characters, and accept any characters at all

**Date raised:** 2026-08-17
**Severity:** High
**Area:** Public portal → Registration wizard — **Tab 2** *Organisation Details* (Telephone, Mobile number, WhatsApp)
**and Tab 4** *Office Bearers* (Mobile Number) — confirmed 2026-08-17 to be the **same** defect in both places
**Form:** `boxfusion.dsdnpo/create-npo v61`, `boxfusion.dsdnpo/npo-office-bearer v47`
**Environment:** QA · view mode **Latest**
**Found on:** draft `APPL26-01212`
**Fails:** ADO #101634 (TC-03-010), #101648 (TC-03-024), **#101675 (TC-04-021)**

## Scope widened 2026-08-17 — the Office Bearer phone field behaves identically
`npo-office-bearer v47` → **Mobile Number**: `maxLength=10`; `abc` → *"Mobile Number must be at least 10 characters"*;
**`abcdefghij` (ten letters) → accepted, no error.** Same cap, same length-only rule, same absence of any format check.
**Treat as one defect across the registration form, not two** — a single fix to the phone validation rule covers
Tab 2 and Tab 4.

## What happens

All three phone inputs carry `maxLength="10"` and enforce it by **silently discarding** whatever exceeds it. There is
**no format validation** — only a minimum length of 10 — so any ten characters are accepted, letters included.

## Reproduction

| Typed | Stored in the field | Error shown |
|---|---|---|
| `abc` | `abc` | ✅ *"Organisation Telephone must be at least 10 characters"* |
| **`abcdefghij`** | `abcdefghij` | 🔴 **none — ten letters accepted as a phone number** |
| `0123456789` | `0123456789` | none (correct — 10 digits) |
| **`+27123456789`** | **`+271234567`** | 🔴 **none — a valid SA international number corrupted** |
| **`012-345-6789`** | **`012-345-67`** | 🔴 **none — last two digits lost** |
| `123` | `123` | ✅ too short |

Verified attributes:

```
input[placeholder="Telephone"]       maxLength = 10
input[placeholder="Mobile number"]   maxLength = 10
input[placeholder="Whatsapp number"] maxLength = 10
```

The truncated value **persists**: after clicking `Next`, returning with `Back`, and after a full page refresh, the
Telephone field still read `+271234567`.

## Why it matters

DSD contacts NPOs on these numbers, and the acknowledgement/outcome SMS legs depend on them. A user entering their
number in international form — or with the hyphens people habitually type — has it **silently mangled into a number
that cannot be dialled**, with no warning at the time and no trace afterwards. The registration then completes
normally.

The letters case is the same hole from the other side: `abcdefghij` satisfies the only rule the field has.

## Expected

Per ADO #101648: `0123456789` accepted, **`+27123456789` accepted**, `012-345-6789` accepted or auto-normalised, `123`
rejected. That requires a field long enough for an international number and a real format check — not a 10-character
cap with silent truncation.

## Notes

- Contrast with the **office bearer** form, which *does* enforce uniqueness of mobile numbers (*"OB With same mobile
  number exists"*). The rules differ per form; confirm which is intended.
- `Organisation Name`, `Trading Name` and `Email` have **no** `maxLength` at all (`-1`) — a 154-character organisation
  name was accepted with no error. So length handling across Tab 2 is inconsistent in both directions: some fields cap
  silently, others not at all. Filed separately in the run report (TC-03-021, TC-03-023).
