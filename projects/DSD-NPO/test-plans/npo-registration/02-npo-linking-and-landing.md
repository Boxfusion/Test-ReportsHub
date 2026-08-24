# Test Plan: NPO-02 — NPO Linking & Landing (smoke)

> **Status:** Imported from Azure DevOps — not yet executed
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101859) |
| ADO Suite | 101859 — *02 - NPO Linking & Landing* (3 cases) |

## Objective
> Verify what a signed-in submitter is offered before they have an NPO — the once-off *Register a New NPO* / *Link to an existing NPO* choice — that linking to a migrated legacy NPO works, and that a linked NPO then appears on the dashboard.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results are quoted from the ADO cases. All cases are state `Design`.

## Preconditions
- [ ] Public portal reachable; submitter signed in
- [ ] **TC-01 needs an account not yet linked to any NPO.** The shared dev account's state changes as we test — check before running, and prefer the QA account `qa.tester0812@example.org` / `Boxfusion@2026`
- [ ] **TC-02 needs a real migrated NPO number.** The admin register holds **361,068 NPOs** — take one from `admin → All NPOs`. Format is `NNN-NNN-NPO` (e.g. `333-010-NPO`)
- [ ] 🔑 Switch the header view mode **Live → Latest** after login

## Test Cases

### TC-01 — First-time user with no NPOs is offered Register / Link (ADO #101616 · TC-02-001)

*Priority 1 · Positive · Public portal.*

- **Type:** Happy path (structural)
- **Steps:**
  1. Sign in as a submitter **not yet linked to any NPO**
  2. NAVIGATE to the logged-in home page
  3. SNAPSHOT
  4. ASSERT (BLOCKING) the once-off views *(FDS 7.3.1)* offer **Register a New NPO** and **Link to an existing NPO**
- **Expected result:** *"Once-off views (FDS 7.3.1) display 'Register a New NPO' and 'Link to an existing NPO' actions"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) both actions are present on the landing page
- **⚠️ Two deviations observed 2026-08-12, both worth confirming:**
  - Login lands on `/dynamic/Shesha.Workflow/workflows-inbox`. The landing page the case describes is at `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page`, reachable only via the **Register NPO** nav link. The ADO case says the user *lands* on it.
  - The live page offers **three** actions — *Register a new NPO*, *Link to an Existing NPO*, **and *Enquiry***. The case names only two. Not a defect; the case is probably just older than the page.
- 🔑 **`button:has-text("Register a new NPO")` matches hidden mounted duplicates.** Loop `.all()` and click the first that `isVisible()` — `.first()` never resolves.

---

### TC-02 — Link to an existing NPO by NPO number returns the legacy record (ADO #101617 · TC-02-002)

*Priority 1 · Positive · Public portal.* ⚠️ **Drift-Risk case** — see the note below.

- **Type:** Happy path
- **Steps:**
  1. From the landing page CLICK **Link to an existing NPO**
  2. SNAPSHOT — ⚠️ on arrival there is **no** NPO Number input and the button is **enabled**; the **first click reveals the input** and flips the same button to `disabled` as the submit control
  3. TYPE a real migrated NPO number (from `admin → All NPOs`)
  4. ASSERT the value actually landed — read it back with `inputValue()` before drawing any conclusion
  5. ASSERT the system displays **NPO Number**, **NPO Name**, **Authorised Person Name** and **Email** from the legacy data
  6. CLICK **Confirm Link**
  7. ASSERT (BLOCKING) the link is granted and the NPO Dashboard is displayed
- **Expected result:** step 1 — *"System displays NPO Number, NPO Name, Authorised Person Name and Email from legacy data"*; step 2 — *"If user details match the legacy contact, link is granted and NPO Dashboard is displayed"*
- **Assertions:**
  - [ ] ASSERT the four legacy fields are displayed after entering the number
  - [ ] ASSERT (BLOCKING) Confirm Link grants the link and opens the NPO Dashboard
- **⚠️ ADO drift note (Thabiso's own):** *"Code matches via `GetMatchingNpoAsync` using 2-of-3 of name+mobile+email; FDS describes search-by-NPO-number-then-confirm. The flow does not strictly mirror FDS."* So the case may not be executable as written — **confirm the intended flow before logging a failure.**
- **✅ RETRACTED 2026-08-13 — the lookup was never blocked.** The previous note said *"the submit button stayed
  `disabled` with no message"*. **That button is the PAGE's `Link to an Existing NPO` button sitting BEHIND the
  modal.** The modal has its **own magnifier search button**, which is enabled and works.
  🔑 **Search by clicking the magnifier inside `.ant-modal`, never the page button.** Verified with `333-018-NPO`
  and `000-333 NPO`; endpoint `GET /api/services/dsdnpo/Organisations/GetNPOByNpoNumber?npoNumber=<n>` → 200,
  returning all four prescribed legacy fields.
- **🔴 `Confirm Link to NPO` is inert** on an already-linked NPO — no network request, no toast, no navigation.
- **🔴 ANSWERED, and it is a security finding:** *"what stops someone linking to an NPO they have no authority
  over?"* → For legacy records with blank authorised-person data, **nothing but knowing the number**. The modal
  states *"Please note that authorized person info is blank, but you can proceed with linking."* and offers
  Confirm. See `test-reports/bugs/2026-08-13-link-existing-npo-authorisation-gap.md`.
  ⛔ **Do NOT click Confirm on an NPO that is not ours** — it would attach a real third party's NPO to the account.
- **📌** Reopening the modal **retains the previous search result**; only a full page reload clears it.

---

### TC-03 — Linked NPO appears in the dashboard list (ADO #101622 · TC-02-007)

*Priority 1 · Positive · Public portal. Depends on TC-02.*

- **Type:** Happy path
- **Steps:**
  1. Sign in as a user with **at least one linked NPO**
  2. ASSERT (BLOCKING) the dashboard lists the linked NPOs *(FDS Fig.8)*
  3. CLICK an NPO in the list
  4. ASSERT its details view opens
- **Expected result:** *"Page shows list of linked NPOs (FDS Fig.8); clicking an NPO opens its details view"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the linked-NPO list renders
  - [ ] ASSERT clicking an NPO opens its details
- **📌 Automation note:** DSD-NPO grids are **`sha-react-table`**, not AntD tables. `.ant-table*` selectors return 0 on perfectly healthy pages. Use `[role=table]` / `[role=row]`, and read totals from the row-count caption (*"1-10 of N items"*).

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101616 | TC-02-001 | ✅ yes |
| TC-02 | #101617 | TC-02-002 | ⚠️ retest with a real NPO number |
| TC-03 | #101622 | TC-02-007 | ⛔ blocked on TC-02 |

**Not in this plan** (Functional suite 101885, to import later): TC-02-003 → 006.
