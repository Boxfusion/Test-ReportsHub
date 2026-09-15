# Bug: Voluntary deregistration has no asset-transfer step — the receiving NPO is never captured

**Date:** 2026-08-13
**Severity:** High
**Status:** Open — verified
**Portal:** Public
**Found in:** NPO-13P TC-13-005 (ADO #101804)
**Record:** DER2015/13/08/2026 · NPO `333-018-NPO`
**Form:** `boxfusion.dsdnpo/voluntary-deregistration-create v37`

## Summary
The deregistration wizard has **three steps** — *Guideline · Deregistration Details · Declaration and Documents*.
**There is no Asset Transfer step**, so an NPO can declare that it is donating its assets, upload an asset-transfer
form, and **never say who receives the assets**.

## Steps to reproduce
1. Public portal → a registered NPO → **Voluntary Deregistration** → **Initiate Voluntary Deregistration**
2. **Next** past the guideline
3. On *Deregistration Details*, tick **"Do you want to donate assets?"** (verified still ticked afterwards)
4. Complete the required fields and click **Next**

## Expected
ADO #101804: *"search the **NPO Database** for the receiving organisation … selecting one displays the receiving
NPO's details (FDS Dereg 7.1.2)"*.

## Actual
The wizard goes **straight from Deregistration Details to Declaration and Documents**. Confirmed by going back and
re-scanning: the words **"Asset Transfer", "receiving" and "beneficiary" appear nowhere** in the wizard after the
guideline page, and the step indicator lists only three steps.

## Why this is a real gap, not a misread case
Three separate parts of the live product imply the step should exist:

1. **The guideline page itself promises it** — *"Step 1: Deregistration Details / **Step 2: Asset Transfer
   (Optional)** / Step 3: Declaration and Documents"*
2. **A "Do you want to donate assets?" checkbox exists** on Deregistration Details — and ticking it **changes
   nothing**. It is a control with no effect.
3. **"Assets Transfer Form File" is a REQUIRED upload** on the declaration step — the deregistration cannot be
   submitted without it

So the product asks for an asset-transfer form and asks whether assets are being donated, but provides nowhere to
record **which organisation receives them**.

## Impact
Section 23 deregistration requires remaining assets to pass to another NPO with similar objectives. The receiving
organisation is a **statutory** part of the record and it is not captured in structured form anywhere — only,
possibly, inside an uploaded document that nothing validates.

## Related finding — deregistrations are missing from the admin list
`CRUDS → Voluntary Deregistration` (*All Deregistration Applications*) shows **31 items**, and **`DER2015` is not
among them**: searching the NPO name and `Nomfanelo` both return **No Data**. The same application sits at the
**top of the workflow inbox** and was actioned successfully from there, so the record exists and is live.

Also on that list:
- **No default sort** — page 1 mixes 28/09/2025, 27/09/2025, 06/08/2026, 12/08/2026, 12/02/2026
- **No Ref Number column**, though the submitter's own list shows one — so staff cannot look up an application by
  the reference the NPO was given
- *Contact Person FullName / Cellphone / Email* are **blank on every row**

## Note
The status filter on that list **does** work (`DEREGISTRATION APPROVED` → 31 to 6, all matching), and
**TC-13-010 passed** — validating documents correctly set the NPO to **DEREGISTERED**. The deregistration decision
path is sound; it is the asset-transfer capture and the list completeness that fail.
