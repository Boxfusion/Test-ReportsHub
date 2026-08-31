# DSD-NPO — notes, corrections and questions for the test lead, 2026-08-25

**Date:** 2026-08-25
**Provenance:** these three sections were written as part of the 2026-08-25 daily report and lifted out of it
before that report went to Sree, which is a distribution decision and not a withdrawal. **Nothing here is
retracted.** The corrections in the first section are real and still stand, and the questions in the second are
still open with Thabiso.

---

## 3. Notes on accuracy

**Three blockers fell to the same technique, and it is worth naming.** The appeals suite, suite 14U and the sign-up inventory had each been written off on evidence that turned out to be indirect — a guessed route returning 404, or a form inventoried by navigating straight to it. Driving the flows properly found all three: the submitter appeal journey exists at `portal-appeals-table` → `Initiate Appeal` (unpublished, absent from the navigation); the entity-change audit screen exists with exactly the right columns and returns HTTP 400; and the sign-up journey has **three** steps, the third being Password and Confirm Password, reached only by clicking `Next`.

That last one has a consequence. On 2026-08-18 five suite-01 cases were marked *"not executable — case does not match the build"* on the basis that the account uses mobile-OTP with no password, and a question went to the test lead asking whether to rewrite them. **That premise was wrong.** TC-01-015 (password mismatch) is runnable as written, and TC-01-011/012/013/016 need re-reading against the real journey before anything is rewritten. The SA ID half of the original finding stands — no SA ID field appears anywhere in sign-up.

**"Sent" does not mean delivered, and this is now an observation rather than an inference.** An OTP dispatched to a colleague's number was recorded by the store as `sendStatus: 1` (Sent). He confirmed it never arrived. Every count of "successful" notifications in our reports — including the 22 252 rows at status `1` — measures handoff to the provider, not delivery, and should never be described as delivered. It also means the 4 559 re-sends to already-"successful" recipients may be understated rather than overstated.

**Two certificate verdicts from 2026-08-18 are retracted.** Decoding the QR code lifted from a generated `RegistrationCertificate.pdf` showed the organisation's registration status travelling as a plain query parameter, which the public verification page then displays back. TC-14D-002 and TC-14D-004 were passed on the earlier reading and are now re-verdicted. The corrections log sits in the run report.

**Suite 14X is honestly not a black-box suite.** Of its 8 cases, 0 are verdictable through the UI: they describe backend transaction timing, a feature that is absent, or double-transitions that would need permission to fire concurrent mutations against shared QA data. Building the one harness that could run surfaced a real defect in the Link-Existing-NPO lookup, so the day was not wasted — but the suite itself should be reclassified as a code-level concurrency review rather than left counting against black-box coverage.

---

## 4. Questions for the test lead

1. **`Annual Compliance Quality Assurer` role, please.** Suite 09's QA step cannot be exercised without it — the shared login sees the form entirely read-only. This is now the **third** suite blocked on a role rather than on a defect.
2. **What does notification status `16` mean?** It appears on 160 messages and is the only candidate in the store for a genuine delivery confirmation. `1` (Sent) and `8` (Failed) are understood.
3. **Suite 14X — confirm the reclassification.** Either it moves to a code-level review, or we need explicit permission to fire concurrent mutations on shared QA plus one safe, linkable test NPO.
4. **Please disregard the 2026-08-18 question about rewriting the suite-01 sign-up cases** — it rested on the incomplete inventory described in §3. We will re-read those four cases and come back if a rewrite is still warranted.
5. **Appeals preconditions.** Finishing the remaining appeals cases needs either a **cancelled** NPO we own, or a refusal notice older than 30 days. The register currently holds zero organisations at status 7 (Cancelled), so neither is constructible from what is there.
6. **Suite 14Z — is it ours to run at all?** Today's Class B pass has been pulled from this report pending your answer. The same question applies backwards: **three 14Z verdicts from the 18 August Class A run are still counted in the 193.** If the suite is out of our remit, those come out too and the figure becomes **190 of 314 (60%)**. We would rather correct it once than carry it.

---

## 5. Next

- Author the last outstanding suite — **14R, Integration retries DHA-CIPC (ADO 101904, 2 cases)**. Every other suite in plan 101543 is now imported and driven at least once.
- Chase the `GetAppealInitialData` 500, which stands between us and roughly six further appeals cases.
- Re-read suite 01 TC-01-011/012/013/015/016 against the three-step sign-up journey.
