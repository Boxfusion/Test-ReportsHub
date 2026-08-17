# Address lookup returns no suggestions **on the admin portal** — the Maps key is not authorised for that host

> **⚠️ This finding has been corrected twice. Read the history before quoting it.**
> Originally logged as *"NPO registration cannot be completed at all"* (Blocker, **both portals**).
> It is neither a blocker nor a both-portals defect. Current, verified position:

| Portal | Suggestions render? | Derived fields populate? | Verdict |
|---|---|---|---|
| **Public** `dsd-npo-publicportal-1-qa` | ✅ **yes — 5 returned** | ✅ **yes** | **ADO #101632 / TC-03-008 PASSES** |
| **Admin** `dsd-npo-adminportal-qa` | 🔴 never | 🔴 never | **FAILS** |

**Date found:** 2026-08-12 · **Corrected:** 2026-08-13 (three times)
**Severity:** 🟡 **Low** — *Blocker → Medium–High → Low.* **2026-08-13: the dev (Mpendulo) confirmed that
`Workflows → My Items → Create New → Registration Process` is NOT a supported path** — which is also why it
appears in neither ADO plan. This defect manifests **only** on that route, so it affects **no supported flow**.
Keep it open as a **config-hygiene item**: the Maps key restriction is genuinely wrong for the admin host and
would bite immediately if staff-initiated registration were ever enabled.
**Module:** DSD-NPO · **admin portal only, on an unsupported route**
**Where:** *Initiate Registration* → **Organisation Details** → `Full Address`
**Form version:** `boxfusion.dsdnpo/create-npo v60`
**Environment:** QA
**Evidence:** `test-reports/2026-08-13/03-wizard-org-details-objectives--admin-initiated-registration-process.md`

## ✅ What actually happens on the PUBLIC portal — it works

Verified 2026-08-13 on draft `APPL26-00793`, view mode **Latest**, typing `Church Street Pretoria` with **real
keystrokes**:

**5 suggestions rendered**, in `.location-search-input-wrapper > .dropdown-container` (height 128, five
`.suggestion-container` children):
```
Church Street, Lynnwood, Pretoria, South Africa
Church Street, Lotus Gardens, Pretoria, South Africa
Church Street, Mamelodi - Seventeens, Pretoria, South Africa
Bidvest McCarthy VW Arcadia, Stanza Bopape Street, Arcadia, Pretoria, South Africa
Shoprite Van Der Walt Street, Madiba Street, Pretoria Central, Pretoria, South Africa
```
Selecting the first one **populated the derived fields correctly**:

| Field | Value after selection |
|---|---|
| Full Address | `Church Street, Lynnwood, Pretoria, South Africa` |
| **Metropolitan Municipality** | **`City of Tshwane Metropolitan Municipality`** |
| **Area Code** | **`0081`** |
| District Municipality | *(empty — correct; Tshwane is a metro, so metro and district are mutually exclusive)* |

**That is ADO #101632 / TC-03-008 satisfied end to end on the portal the case actually targets** (the case is
tagged `Portal: Public`). It should be marked **PASSED** for public.

## 🔴 What happens on the ADMIN portal — it fails

Same draft, same form, same real-keystroke input: `.dropdown-container` stays **0 children / 0 height / empty
innerHTML**, sampled every 500 ms for 4 s. A DOM-wide diff of every absolute/fixed element before vs after typing
showed **no new overlay anywhere**. The derived fields therefore never populate.

**Cause:** `Google Maps JavaScript API error: RefererNotAllowedMapError` — the Maps API key is **not authorised
for `dsd-npo-adminportal-qa.shesha.app`**, while it *is* authorised for the public host. A key-restriction config
fault, not application code.

**Impact:** DSD staff *can* initiate a registration from **Workflows → My Items → Create New → Registration
Process**, and any application created that way is saved with **no municipality and no area code**. Whether that
matters depends on whether staff-initiated registration is a supported path — see the open question below.

## Correct selectors (for the spec, and for anyone re-testing)
```
.location-search-input-wrapper                    ← the control (custom Shesha, NOT the Google widget)
.location-search-input-wrapper .dropdown-container    ← suggestion container
.dropdown-container .suggestion-container             ← one suggestion
```
⚠️ **`.pac-container` does not exist on this form and never will** — that is the *Google widget's* dropdown, and
this control renders its own list. The original report's evidence ("`.pac-container` is never created") was
therefore meaningless, and it is what kept this finding wrong for a day.

## History of the corrections — worth reading, the mistakes are repeatable

1. **2026-08-12 — "registration cannot be completed at all" (Blocker).** Wrong twice over:
   - `fill()` does not bind on this form, so the mandatory fields were **genuinely empty** and `Next` was
     **correctly disabled**. We inferred the disabled button was caused by the unresolved address.
   - An even earlier probe clicked the input's **wrapper** and never typed at all, then read "no suggestions" as
     proof the widget was dead.
2. **2026-08-13 (morning) — "the address bug is real on both portals, but not a blocker."** The blocker half was
   correctly retracted, but the evidence still checked `.pac-container`, so the "both portals" half was unproven.
3. **2026-08-13 (this correction) — public works, admin does not.** Established by typing with real keystrokes and
   asserting on the control's **own** container.

🔑 **Three rules this cost us:**
- **Check the app's own element, not the vendor's.** Same mistake as testing these grids with `.ant-table`.
- **A disabled control evidences only that *some* precondition is unmet** — never which, never why.
- **On a headed run the tester may be typing into the same field.** A full address appearing mid-probe was twice
  the tester's own input (`265 West Avenue`, 2026-08-13), not a suggestion being applied.

## ❓ Questions for the test lead
1. **Is staff-initiated registration (`Create New → Registration Process`) a supported path?** If yes, this is a
   real gap and the key restriction needs fixing. If it is dev scaffolding, this drops to Low.
2. Should the Maps key be authorised for the admin host at all, or should the admin form use a different
   address source?
3. `Province` sits only under **Postal Address** while Physical has District/Metro/Area Code. Intended?
