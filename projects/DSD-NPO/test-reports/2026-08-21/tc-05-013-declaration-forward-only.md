# Report: TC-05-013 — Declaration auto-populates Organisation Name and Date (forward-only pass)

**Date:** 2026-08-21 06:52 UTC
**Plan:** test-plans/npo-registration/05-wizard-admin-docs-declaration.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public portal)
**Result:** FAILED — the blocking assertion fails: **neither prescribed field exists on the Declaration tab**
**Duration:** ~560s
**Cases:** TC-05-013
**Environment:** QA · public portal, signed in · view mode **Latest**

## Why this run
TC-05-013 was the last unverdicted case in smoke plan 101541. It was blocked earlier today because reaching the
Declaration tab needs 3 office bearers on Tab 4, and
`bugs/2026-08-21-returning-to-organisation-details-deletes-all-office-bearers.md` destroys them on any backward step.
This run used a **forward-only pass** — all 3 office bearers captured in a single visit to Tab 4, never stepping back.

## Result
ADO #101689 prescribes verbatim: *"Organisation Name (from Step 1) and Application Date (today) are auto-populated and
read-only"* (FDS 7.5.8 rules 1 & 4).

| # | Assertion | Result |
|---|---|---|
| 1 | **(BLOCKING)** Organisation Name **and** Application Date are auto-populated | 🔴 **FAIL** — neither field exists |
| 2 | Both are read-only | ⛔ **Vacuous** — there is nothing to test |

## What the Declaration tab actually contains
Five form items in total (one of them a hidden duplicate) — screenshot `evidence/tc05-013-declaration-tab.png`:

| Field | Type | State |
|---|---|---|
| **Name of submitter** | text only, **no input control** | auto-populated with the **submitter's personal name** |
| *Name of submitter* (2nd instance) | — | **hidden duplicate**, empty |
| **Capacity \*** | select | empty, mandatory |
| *Reflect its registered status …* | checkbox | obligation acknowledgement |
| *A narrative report – section 18(1)(a)* | checkbox | obligation acknowledgement |

Plus the declaration paragraph, the post-registration obligation lists, `Back` and `Submit` (disabled until Capacity
is chosen).

## Evidence that the two prescribed fields are genuinely absent
Checked across the **whole DOM**, not just the visible text — the hidden-duplicate trap found earlier today on
TC-03-004 was specifically guarded against here:

- **No `Organisation Name` field.** The label string `organisation name` **does not occur anywhere in the page HTML**.
- **No `Application Date` field.** There are **0 `.ant-picker` elements** on the step, no `dd/mm/yyyy` text anywhere,
  and the string `application date` does not occur in the HTML.
- The organisation name *does* appear on screen twice, but an XPath walk shows both occurrences are **outside the
  declaration form** (`closest('.sha-steps-content') === null`):
  1. the header NPO-switcher dropdown, and
  2. the page title `Initiate Registration: <org name>`.

  Neither is a declaration field, and neither is the "auto-populated from Step 1" behaviour the case describes.

## The nuance worth reporting
The Declaration **does** auto-populate a name, and it **is** read-only — tested the way the plan's 🔑 note requires,
by attempting an edit: the field renders as plain text with **no input element at all**, so there is nothing to type
into. But it is the **submitter's personal name**, not the **Organisation Name**.

So this is not "auto-population is broken" — it is a **spec-vs-build mismatch about which fields belong on the
declaration**. The build captures *who is declaring* (name + capacity); the case and FDS 7.5.8 expect *what is being
declared about* (organisation name + application date).

**❓ Question for Thabiso:** should the declaration carry the Organisation Name and Application Date, or is
`Name of submitter` + `Capacity` the intended design and the case out of date? A signed declaration that does not
state the organisation or the date is unusual for a statutory form, which is why this is worth resolving rather than
just failing the case.

## Also observed
- **`Name of submitter` is rendered twice** — one visible, one hidden and empty. Third instance today of a duplicated
  form item in this build (after the two `NPCRegistration No` items on Organisation Details).
- `Submit` stays **disabled** until `Capacity` is selected — the guard works, and it is a starred field, so this one
  is not an instance of the silent-gate defect.
- **Typed dates work.** Entering `dd/mm/yyyy` directly into the AntD picker input with real keystrokes followed by
  `Enter` binds correctly and survives Save — confirmed on all three office bearers. This is much cheaper than
  driving the panel and does **not** contradict `antd-date-fields-never-set-programmatically`, which is about
  `fill()` / programmatic assignment. **Note:** the same Enter-to-commit trick does **not** work for `.ant-select`
  fields — the value silently reverts to the placeholder; those still need an explicit option click.

## Records touched
| Record | State left |
|---|---|
| `APPL26-00793` draft | **3 office bearers** (Sipho Nkosi · Naledi Sithole · Thabo Mahlangu), Admin & Operations = *Social Development*, sitting on the **Declaration** tab. **NOT submitted.** |

⚠️ Those 3 office bearers will be destroyed by the data-loss defect if anyone steps back to Organisation Details on
this draft. Anyone resuming it should go forward only.

🔒 **POPIA:** all three office bearers were created via the **passport** route with synthetic details, deliberately
avoiding the live DHA identity lookup. No real identities were read or transcribed.

## Effect on smoke coverage
**Smoke plan 101541 is now 70/70 verdicted.** TC-05-013 was the last outstanding case.
