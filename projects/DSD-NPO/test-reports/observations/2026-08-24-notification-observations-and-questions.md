# Observations and open questions — suite 14T, 2026-08-24 (internal)

**Held on our side.** Deliberately kept out of the daily report sent to Sree. Raise with Thabiso directly when the
time is right, not through the daily.

**Source:** `test-reports/2026-08-24/14t-notification-templates-functional--store-harvest.md`
**Evidence base:** 2 521 notification messages (2026-01-13 → 08-24), 132 templates, 4 941 attachment records, 9 PDFs read

---

## Observations, in the order they need attention

**1. Office-bearer reminder emails link to a host that does not exist, and the job runs every working day.**
The reminder points every recipient at `dsd-npo-publicportal-qa.azurewebsites.net`, which fails DNS resolution. The
equivalent link in the original notification was migrated to the working host on 2026-08-04; the reminder was not.
Because the link cannot be opened the office bearer can never confirm, so the triggering condition never clears and
it fires again the next working day — indefinitely. Pattern: office bearer added, 7 days later reminders begin, every
working day thereafter. It compounds — each newly registered NPO adds another permanent daily email. Confirmed
first-hand: they arrive at 02:01, and colleagues' mailboxes have had them for up to six months. Office-bearer
confirmation gates the registration application, so affected applications stall with nothing visible on the admin side.
→ `bugs/2026-08-24-ob-reminder-link-host-does-not-resolve.md`

**2. Several letters lose a merge field, leaving sentences incomplete.**
Four templates across two areas print a sentence built around a reference number that renders empty — *"The Appeal
for … with reference has been denied"*; a change-request denial reading *"the change submission for  has been
unsuccessful"* with no organisation named. A related 54 emails link to `localhost:3000` inside malformed markup, so
the link is neither clickable nor valid.
→ `bugs/2026-08-24-appeal-and-case-letters-omit-their-reference-number.md`,
`bugs/2026-08-24-case-assignment-email-links-to-localhost.md`,
`bugs/2026-08-24-denied-post-registration-letter-drops-npo-name.md`

**3. Every SMS the system sends costs two to four messages.**
22 of 24 SMS templates exceed the 160-character single-segment limit; the longest is 583. Nothing is broken —
segmentation is clean, no link is cut — but each SMS carries a full letter including postal letterhead, phone and fax.
→ `bugs/2026-08-24-all-sms-templates-exceed-one-segment.md`

**4. Three notifications the test cases expect do not exist.**
The annual compliance reminder, the change-request incomplete notice, and the voluntary deregistration denial. None
appears anywhere in 2 521 messages. Unimplemented, or never exercised on QA — needs confirming.

**5. Registration certificates DO carry a QR code.**
Contradicts our own records: the code-review note predicted no QR, and suite 14D recorded its absence as
*corroborated*. The QR is present and well-formed — extracted and kept at
`test-reports/2026-08-24/evidence/certificate-qr-code.png`. **14D TC-14D-002 needs re-verdicting.** What the QR
encodes is unknown, and the public verification route it would point to returns 404.

**6. The NonCompliant letter promises an attachment it never carries** — 3 of 3 rows.
→ `bugs/2026-08-24-noncompliant-letter-promises-absent-attachment.md`

**7. Smaller content issues** — *"Departmet"* misspelt in 8 templates; `www.npo.org.za` in two letters against
`www.npo.gov.za` elsewhere; `NPOInquiry@dsd.gov.za` against `npoenquiry@dsd.gov.za`; inconsistent switchboard
numbers; *"Dear Not Verified"* instead of a name; *"FOUNDATIONAL CHANGE CHANGE REQUEST"*; a broken relative link.
→ `observations/2026-08-24-notification-template-copy-defects.md`

**8. Held separately — not for the daily report.** The security finding raised while opening certificate PDFs is
recorded at `bugs/2026-08-24-generated-documents-downloadable-anonymously.md`. Not in QA's remit to report; route it
to Thabiso when appropriate. Note there is precedent — `bugs/2026-08-18-api-reachable-without-authentication.md` —
and ADO suite **14Z is a security suite Thabiso authored**, so it is in the plan's scope even if not in ours to raise.

---

## Questions for Thabiso

1. Who owns the reminder template's base URL, and should the reminder have a **retry cap**? Even with the host fixed,
   a notification that repeats indefinitely with no ceiling remains a problem.
2. The certificate QR exists — **what should it encode**, and is the public verification route meant to be live yet?
3. The annual-compliance incomplete letter states **no deadline**, while its registration and change-request
   equivalents both give 30 days. Should it state one?
4. Should a declined applicant be told **how to appeal**? The decline letter gives four substantive reasons and a
   Friendly Societies referral, but no appeal rights and no appeal window.
5. Two cases cannot be scored as written: **TC-14T-009** prescribes no field list, and **TC-14T-022**'s expected
   result is cut off mid-sentence after *"either"*.
6. Are the three missing notifications implemented, or has that status never been reached on QA?
7. Notification **status code `16`** appears on 2 records — we know 1 = Sent, 8 = Failed.
8. **SMS credit** — 195 SMS did send against 969 failed, so "all SMS fails on QA" is too strong. Topped up
   intermittently?

---

## ⚠️ Coverage number — do NOT publish a cumulative percentage yet
The daily report deliberately carries **no cumulative figure**. Two independent attempts disagreed:

| Method | Result | Why it is not trustworthy |
|---|---|---|
| 130 (last week's close) + 21 executed today | **151 / 314 (48%)** | The 130 base was carried from notes, never counted |
| Counting distinct `**Cases:**` tokens in all functional run reports | **175 / 314 (56%)** | Double-counts the two numbering schemes (`TC-04` and `TC-04-001` both matched), and counts cases *listed* rather than *executed* — 14T reads 22 there when 21 ran |

Per [[report-the-conservative-coverage-number]] a figure that could be read as a range gets published at the low end,
and a conservative number never needs retracting. But neither of these is a defensible low end — they are two
differently-broken counts. **A proper re-baseline is a task in its own right:** normalise every report's `**Cases:**`
line to one numbering scheme, exclude cases marked NOT EXECUTED, and dedupe against the ADO suite case lists. Until
then the daily report states today's delta only — 22 cases imported, 21 executed — which is directly checkable.
