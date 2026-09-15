# Office Bearer: a DHA non-match blocks the form silently — unfillable name fields, disabled Save, no message

> **⚠️ CORRECTED 2026-08-13.** An earlier draft of this report also claimed the **passport variant could not be
> saved at all**, with "no discoverable cause". **That was wrong.** The cause was **duplicate contact details** —
> I had reused the same mobile number and email across office bearers. The app *does* warn, via a **transient
> toast**, which my point-in-time DOM checks kept missing. Both office bearers saved fine once given unique
> contact details. See *"What was wrong with the first version"* at the bottom — the mistake is repeatable.

**Date found:** 2026-08-13
**Severity:** 🟠 **Medium–High** — the *control* is correct (an unverifiable person should not be registrable),
but the applicant is given **no explanation**, on a mandatory step of the primary flow.
**Fails:** the feedback shape prescribed by **ADO #101607 / TC-01-013** — *"Inline error indicates DHA
verification failed … user is offered to retry or use passport instead."*
Related: **ADO #101655 / TC-04-001** (prescribes an `ID Verified` status that does not exist).
**Module:** DSD-NPO · **public portal** (the supported registration path)
**Where:** *Initiate Registration* → **Office Bearer** → *Add Office Bearer* → `Is RSA ID Number` **ticked**
**Environment:** QA · view mode **Latest** · form `boxfusion.dsdnpo/create-npo` v60→v61
**Application:** `APPL26-00817` (`id=6c45a022-6cc8-4696-93bf-e1fdf41ce4f3`)
**Evidence:** `test-reports/2026-08-13/03-wizard-org-details-objectives--public-portal-registration.md`

## Steps to reproduce
1. Public portal → *Register NPO* → *Register a new NPO* → accept both POPIA consents
2. Complete **Organisation Details** and **Objectives**, reach **Office Bearer**
3. *Add Office Bearer* → tick **Is RSA ID Number**
4. Enter a **checksum-valid SA ID that DHA has no record for**
5. Try to complete the form

## Observed
| Field / control | Behaviour |
|---|---|
| Date Of Birth | ✅ derives correctly from the ID digits |
| Gender | ✅ derives correctly |
| **First Name (s)** *(required)* | 🔴 **empty and cannot be typed into** |
| **Last Name** *(required)* | 🔴 **empty and cannot be typed into** |
| Persisting validation message | 🔴 **none** |
| **Save** | 🔴 **disabled**, with no indication why |

**The name fields are populated exclusively by the DHA lookup and are otherwise locked.** Verified with **real
keystrokes**, sampling the input value every 500 ms for 4 s — it never leaves `""`.

⚠️ **Be precise about "silent".** The form *does* emit transient `ant-form-item-explain` messages for other
conditions while typing (*"SAIDNumber must be at least 13 characters"*, *"Please enter a valid ID number"*). What
is missing is any **persisting** message for the completed-but-unmatched case. Once a full 13-digit checksum-valid
ID is entered and DHA returns no match, every explain node clears and nothing remains on screen.

### Reproduced with three separate checksum-valid IDs
| SA ID | Derived DOB | Derived gender | DHA match |
|---|---|---|---|
| `8001015009087` | 01/01/1980 | Male | ✅ **yes** → `Ryno Koen`, Nationality `South Africa` |
| `9001015009086` | 01/01/1990 | Male | 🔴 no — silent |
| `0501018064086` *(tester-supplied)* | 01/01/2005 | Male | 🔴 no — silent |
| `0109052862082` *(tester-supplied)* | 05/09/2001 | Female | 🔴 no — silent |

So the integration works; only the **non-match path** is unhandled.

## Expected
Per ADO #101607's pattern: an **inline error stating DHA verification failed**, and an offer to retry or switch to
the passport variant. The blocking itself should stay.

## ✅ Workaround — the passport route works
Untick **Is RSA ID Number** and capture the person by passport. Names are freely typeable there. Confirmed by
saving two office bearers this way (`Thabo Molefe` and `Lerato Dlamini`, both Zimbabwe).

## 🔑 Office bearers must have UNIQUE mobile number and email
Reusing a mobile number already held by another office bearer raises a **transient toast**:

> **"OB With same mobile number exists"** — `ant-message-notice`, auto-dismisses

and leaves **Save disabled**. The same applies to email. This is correct behaviour and reasonably signalled —
but the toast is easy to miss, and once it has gone the disabled Save has no visible explanation.

⚠️ **Consequence for test data:** each office bearer needs its own mobile and email. The project convention of
always using `0818400598` can only be honoured for **one** office bearer (we use it for the chairperson).

## ⚠️ Minor: plus-addressed emails are rejected
`nomfanelo.nhleko+ob2@boxfusion.io` → *"Please enter a valid email address"*. Plus-addressing is RFC-valid and is
the standard way to generate unique test mailboxes, so this is worth raising.

## Related — no verification status is visible afterwards
The office-bearer grid shows *Full Name · Nationality · SAIDNumber · Passport Number · Passport Expiry Date · Date
Of Birth · Gender · Has Disability · Type Of Disability · Residential Address · Work Address · Mobile Number ·
Home Number · Whatsapp Number · Email Address · Position* — **no verification-status column**, so a DHA-verified
office bearer and a passport-captured one are indistinguishable. ADO #101655 prescribes status **`ID Verified`**.

## 🔑 What was wrong with the first version of this report — a repeatable mistake
I checked for error messages with **one-off DOM reads taken seconds after the action**. AntD `ant-message` toasts
auto-dismiss, so they had already gone, and I concluded "no message anywhere" and "no discoverable cause".

**The fix, and the technique to reuse:** install a `MutationObserver` on `document.body` watching
`.ant-message-notice, .ant-notification-notice, .ant-form-item-explain, .ant-form-item-explain-error, .ant-alert`
**before** performing the action, and read the captured log afterwards. That immediately surfaced
*"OB With same mobile number exists"*, which a point-in-time check had missed three times.

**Never conclude "no feedback" from a single DOM read after the fact.**

## ❓ Asks for the test lead / developer
1. Should a DHA non-match show an inline error and offer the passport route, per ADO #101607?
2. Should the OB grid carry an **`ID Verified`** status column per ADO #101655?
3. **Are there DHA-resolvable SA ID numbers for QA beyond `8001015009087`?** Four were tried; only that one
   resolves. Not blocking any more (the passport route works) but it limits coverage of the SA-ID path.
4. Should plus-addressed emails be accepted?
