# Bug: Every Office Bearer Acknowledgement Reminder link points at a host that does not resolve

**Date:** 2026-08-24
**Severity:** High
**Area:** Notifications — `Office Bearer Acknowledgement Reminder` template (email + SMS)
**Environment:** QA
**Found by:** TC-14T-005 (ADO #101832) during the 14T store harvest

## Summary
The OB Acknowledgement Reminder sends every office bearer a confirmation link on the host
`dsd-npo-publicportal-qa.azurewebsites.net`. **That hostname does not resolve.** Every reminder link — 404 messages
since 2026-02-02, the most recent fired at **00:01 on 2026-08-24** — is dead on arrival.

Office-bearer self-confirmation gates the registration application, so an OB who acts on the reminder rather than the
original notification cannot confirm their association at all, and the application stalls. The sender sees
`status: 1` (dispatched) throughout, so nothing surfaces this from the admin side.

## Steps to reproduce
1. Query the notification store for the reminder template:
   ```
   GET https://dsd-npo-api-qa.shesha.app/api/dynamic/Shesha/NotificationMessage/Crud/GetAll
       ?maxResultCount=200&filter={">":[{"var":"creationTime"},"2026-08-01T00:00:00"]}
   ```
   (bearer token from `localStorage['xDFcxiooPQxazdndDsdRSerWQPlincytLDCarcxVxv']`)
2. Filter to `subject = "Email Office Bearer Acknowledgement Reminder"`. Every body contains:
   ```
   https://dsd-npo-publicportal-qa.azurewebsites.net/no-auth/boxfusion.dsdnpo/ob-self-verification?mode=edit&tempId=<token>&npo=<name>
   ```
3. Open that host in a browser → **`net::ERR_NAME_NOT_RESOLVED`**.
4. Control, same browser session: `https://dsd-npo-adminportal-qa.shesha.app/` loads normally.

## Expected
The reminder's confirmation link resolves to the no-auth tokenised OB self-verification page, as TC-14T-005 requires
(*"Link routes to no-auth tokenised page"*).

## Actual
DNS does not resolve the host. The link cannot be opened by anyone.

## This is a missed migration, not a design choice
The sibling template was migrated on **2026-08-04**; the reminder was left behind.

| Template | Host in link | Window | Msgs |
|---|---|---|---|
| Registration Application OfficeBearerRegistry | `dsd-npo-adminportal-qa.shesha.app` | 2026-08-04 → 08-24 | 224 |
| Registration Application OfficeBearerRegistry | `linux-dsd-npo-adminportal-qa.azurewebsites.net` | 2026-02-17 → 08-04 | 109 |
| Registration Application OfficeBearerRegistry | `linux-dsd-npo-adminportal-**prod**.azurewebsites.net` | 2026-01-13 → 02-17 | 56 |
| **Office Bearer Acknowledgement Reminder** | **`dsd-npo-publicportal-qa.azurewebsites.net`** | **2026-02-02 → 08-24** | **202 email + 202 SMS** |

Both channels carry the same dead host, so the SMS reminder is equally useless — independently of the Vodacom credit
problem.

## Scope note recorded honestly
- The **original** OB notification (`OfficeBearerRegistry`) is fine since 2026-08-04 — its host resolves. So an OB who
  acts on the first email can still confirm. Only the reminder path is broken.
- The reminder also points at an **admin-portal-shaped path on a public-portal hostname**; which host it *should* use
  needs confirming, not guessing. The fix is the base URL, but the correct value is the template owner's call.
- 📌 Separately worth noting: until 2026-02-17 the QA environment was emitting links to a **prod** hostname.

## 🔴🔴 Escalation — the reminder cannot ever stop, and it is reaching real people
**Added 2026-08-24 after the tester reported receiving these reminders directly.**

The two defects compound into a permanent loop:

> the confirmation link is dead → the office bearer can never confirm → the "unconfirmed OB" condition never clears
> → the reminder fires again on the next working day → forever.

**Recipient-side confirmation.** The tester receives these for office bearer *Ryno Koen* on
`Nomfanelo_QA_NPO_2026-08-13` and `Nomfanelo_QA_Annual_NPO_2026-08-17`, at **02:01 SAST** — which matches the store's
**00:01 UTC** send time exactly. This also settles something the store alone could not: `status: 1` on this template
means **actually delivered**, not merely dispatched.

**The job runs on weekdays, not daily** (2026-08-11 → 08-24):

| Fired | Skipped |
|---|---|
| Tue 11, Wed 12, Thu 13, Fri 14, Tue 18, Thu 20, Fri 21, Mon 24 | Sat 15, Sun 16, **Mon 17**, **Wed 19**, Sat 22, Sun 23 |

Weekends are skipped by design, apparently — but **Mon 08-17 and Wed 08-19 were also missed**, so the schedule is not
reliable either. Worth a separate question.

**There is no cap on repeats, and it has been running for months.** Reminder counts per recipient:

| Recipient | Distinct days | Span |
|---|---|---|
| `cinisile.mathonsi@boxfusion.io` | 10 | **2026-02-05 → 2026-08-18** (6½ months) |
| `fatima.makina@boxfusion.io` | 9 | 2026-02-05 → 2026-03-12 |
| `welcomegalane@gmail.com` | 8 (30 msgs) | 2026-08-11 → 2026-08-24 |
| `jama@boxfusion.io` | 8 | 2026-02-23 → 2026-03-20 |
| `mutshutshu.tshithukhe@boxfusion.io` | 7 | 2026-02-19 → 2026-08-14 |

These are **real colleagues' mailboxes**, receiving a 2am reminder about QA test organisations with a link that cannot
work. That is the practical impact, over and above the stalled registrations.

## 🔑 The trigger decoded: OB-add + 7 days, then EVERY WORKING DAY, forever
**Resolved 2026-08-24.** My first pass split the counts per NPO and reported "2 fire-days for one, 1 for the other",
which looked like it contradicted the tester's "every day". **It did not — the per-NPO split hid the pattern.**
Aggregated to the one mailbox, reminders to `Nomfanelo.Nhleko@boxfusion.io`:

| Day | Reminder emails | For which NPO |
|---|---|---|
| **Thu 2026-08-20** | 1 | `Nomfanelo_QA_NPO_2026-08-13` |
| **Fri 2026-08-21** | 1 | `QA_Smoke_NPO_2026-08-14` |
| **Mon 2026-08-24** | **2** | `Nomfanelo_QA_Annual_NPO_2026-08-17` **+** `Nomfanelo_QA_NPO_2026-08-13` |

Thursday, Friday, Monday — **every working day**, at 00:01 UTC / 02:01 SAST. The weekend is skipped, so from the
recipient's side this is indistinguishable from daily.

**The onset is a clean 7 days after the office bearer was added — three for three:**

| NPO created | First reminder | Delay |
|---|---|---|
| `Nomfanelo_QA_NPO_2026-08-13` | 2026-08-20 | **7 days** |
| `QA_Smoke_NPO_2026-08-14` | 2026-08-21 | **7 days** |
| `Nomfanelo_QA_Annual_NPO_2026-08-17` | 2026-08-24 | **7 days** |

So the mechanism is: **OB added → wait 7 days → remind every working day → forever**, because the dead link means the
confirmation can never complete and the condition never clears.

🔴 **And it compounds.** Monday's count doubled because the Annual NPO reached its 7-day mark. Every NPO registered on
this environment permanently adds one more 02:01 email per working day, to a real mailbox, indefinitely. That is why
the volume grows and why it reads as getting worse over time.

📌 Store completeness verified before drawing this conclusion: 1 533 rows since 2026-08-01 matches the API's own
`totalCount`, 2 521 distinct ids, no duplicates — so `NotificationMessage` is a faithful record here and the audit
method holds.

## Fix direction
Point the reminder template's base URL at the same host the OfficeBearerRegistry template was migrated to on
2026-08-04, and check whether any other template still carries an `azurewebsites.net` host. Then re-fire one reminder
and open the link.

Separately, and regardless of the host fix: **give the reminder a retry cap or an expiry.** A notification that can
repeat indefinitely with no ceiling is a defect in its own right — a broken link merely made it visible. And QA test
organisations should not be reminding real mailboxes for six months.

## Verdict
TC-14T-005 **FAILED** on the link assertion. Confirmed by DNS failure plus a same-session control.

---

## Update 2026-08-25 — it fired again, and the migration date is now pinned
Re-harvested the full notification store (23 644 messages, vs the 2 521 seen on 08-24). Two things are now firm.

**1. It is still firing.** The newest `Office Bearer Acknowledgement Reminder` pair was created **2026-08-25 at
00:01:13 UTC** — this morning — and still carries the dead host:
```
https://dsd-npo-publicportal-qa.azurewebsites.net/no-auth/boxfusion.dsdnpo/ob-self-verification
    ?mode=edit&tempId=eba499877cad&npo=Nomfanelo_QA_NPO_2026-08-13
```
That makes it **five consecutive days** (08-20, 08-21, 08-24 ×2, 08-25) against a host that does not resolve. The
email leg reports `status = 1 (Sent)`, so delivery "succeeds" while the link is useless — 428 messages on this host,
running right up to today.

**2. The migration hypothesis is confirmed by dates, not inferred.** Tallying every link host in the store against
its message dates:

| Host | Messages | First | Last |
|---|---|---|---|
| `linux-dsd-npo-adminportal-prod.azurewebsites.net` | 11 274 | 2025-08-30 | **2026-08-05** |
| `dsd-npo-adminportal-qa.shesha.app` | 471 | **2026-08-04** | 2026-08-25 |
| `dsd-npo-publicportal-qa.azurewebsites.net` *(dead)* | 428 | 2026-02-02 | **2026-08-25** |
| `linux-dsd-npo-adminportal-qa.azurewebsites.net` | 224 | 2026-02-17 | 2026-08-04 |
| `localhost:3000` | 57 | 2025-09-28 | 2026-08-20 |
| `www.npo.gov.za` | 1 006 | 2025-10-10 | 2025-10-15 |
| `pd-content-adminportal-test.azurewebsites.net` | 13 | 2025-11-13 | 2026-08-20 |

The `OfficeBearerRegistry` templates switch cleanly from the old host to `…qa.shesha.app` on **2026-08-04/05**. The
reminder template never made that switch. So the "sibling migrated, this one missed" account is exactly right, and the
fix is to apply the same base-URL change.

## ⚠️ A non-finding, recorded so it is not raised again
The tally above shows **11 274 links to a host named `…-prod…`**, which looks alarming from a QA environment. It is
**not** a live defect: every one of those messages predates **2026-08-05**, and the QA database is plainly a
production restore (320 595 organisations, records back to 2004). They are historic prod messages carried in with the
data, plus pre-migration QA sends. **Nothing sent after 2026-08-05 points at a prod host.** Do not re-raise this.
