# Open questions for the test lead (Thabiso Kegakwile) — DSD NPO

**Not yet sent.** Deliberately accumulating these and asking once, rather than bit by bit.
**Last updated:** 2026-08-17

Ordered roughly by how much coverage each answer unblocks.

---

## Blocks whole suites

### 1. What is meant to create a newly registered NPO's first annual reporting period?
Nothing currently does:
- the scheduled generator job runs cleanly and reports **0 records created — for the entire 361,000-NPO register**
- the admin *Annual Compliance → Add* button opens a **completely empty dialog**, no fields at all
- registering and approving a new NPO does not create one

Until this is answered, the whole annual-compliance area (suite 08 in both plans, 23 cases) depends on a period row we
insert ourselves. On this build no NPO would ever be asked for an annual report.

### 2. How does an applicant lodge an appeal?
**13 cases across both plans are blocked behind this one unknown** — smoke TC-11-001/005/008/012 and the 11 functional
appeals cases. We have a refused application ready to use (`APPL26-01106`), and its outcome email **carries no appeal
link**. We could find no submitter route in the portal.
Also needed: does the tribunal side require a chairperson or tribunal-member account we don't have?

### 3. Can the reminder and cancellation timers be triggered on demand?
Four functional cases (TC-08-001 to 004) cover the whole reminder-to-cancellation chain and all require the system date
to be rolled. Without a way to fire `NineMonthsAfterFYE` / `ThirtyDaysAfterIncomplete` manually, these stay
**permanently unverified**.

### 4. Should a submitted annual report create a task for an assessor?
None is created today for any annual report — the workflow inbox is empty for both reports submitted on 17 August. That
leaves the R500 000 quality-assurance path (TC-08-016) and the backend quality-assure case (smoke TC-09-003) with no
queue to observe.

---

## Needs a rule before we can call something a defect

### 5. Above R500 000, should the accounting-officer details be mandatory?
`Is Above Threshhold = R500 000+` reveals **Accounting officer name · Practice number · Account Officer Report**. None is
marked required and none is enforced — a report declaring R750 000 proceeds with all three empty.

### 6. Related, and it is the reason 5 needs your ruling
Cases #101740 / #101753 describe an **`Audited = Yes/No` control with auditing-firm fields**. That control **does not
exist anywhere in the wizard** (all 8 steps inventoried). Either the build is missing the enforcement, or the cases need
rewriting against the threshold design. The finding holds either way — above the threshold nothing is collected and
nothing is required — but which artefact changes is yours to decide.

### 7. What is the intended upload allowlist for registration documents?
Two cases contradict each other and **the build matches neither**:
- #101684 says PDF, DOC/DOCX, JPG, PNG
- #101697 says .pdf and .doc only
- the build **filters nothing** — a `.exe` was accepted into a statutory document slot

### 8. Is the funding band ceiling R499 000 or R499 999?
The band is labelled `R0 - R499 000` but enforces a maximum of **499999**, and **R499 500 is accepted inside it**. We
think the label is the wrong half, since the statutory threshold is R500 000 — please confirm which to log against.

### 9. What are the per-legal-form office-bearer minimums?
And separately: **Treasurer is missing from the Position list** — is that deliberate?

### 10. Do cases marked `Closed` in Azure DevOps count as retired?
Three in functional suite 05 are (TC-05-014, TC-05-024, TC-05-025), which changes the denominator we report against.

### 11. Can DHA or CIPC failure be simulated?
Both are live external services. Without a way to force a failure we cannot test the error paths, and TC-04-008 still
needs a **real CIPC number** for its primary assertion.

---

## Environment and access

### 12. Should `qa.tester0812@example.org` have public-portal access?
It is refused with a 401 and the page prints the internal message **"Forbidden frontend"** to the user. Reproduced twice.
Two questions really: should the account work there, and should an internal guard name ever reach a user's screen?

### 13. Three QA mailboxes for office bearers
Each office bearer needs a unique email, and only one can be ours, so we can currently verify the self-confirmation
email for **1 of 3** office bearers.

---

## Lower priority, but worth a yes/no

### 14. The `Initiated` dead-state contradiction
Recorded during the functional suite 03 run — see that report.

### 15. Is `Organisation Type` on Post Registration meant to exclude Voluntary Association?
It offers NPC and Trust only. Our NPO is a VA, so this may be deliberate exclusion of the current form.

### 16. Should the public NPO lookup return status?
Today a deregistered NPO is indistinguishable from a registered one to the public, and the lookup still returns a
physical address anonymously.
