# Bug: the wizard's Latitude/Longitude fields stay blank — but the coordinates ARE stored (display-only defect)

**Date:** 2026-08-20 (retested and **re-scoped** same day)
**Severity:** **Low (cosmetic)** — downgraded twice: High → Low–Medium → **Low**. It does **not** block registration **and it does not lose data**.
**Area:** Public portal — registration wizard `create-npo` → **Organisation Details** → **Full Address** (Google Places autocomplete)
**Environment:** QA
**Found by:** fresh registration attempt (APPL26-01494)

> ## ⚠️ THE BLOCKER CLAIM IS WITHDRAWN — read this first
> The earlier version of this bug said lat/long being blank left **Next disabled**, making it a High blocker on all
> new registrations. **That was wrong.** Retested 2026-08-20: Next enables with Latitude and Longitude **still blank**.
> The real gate was an entirely different field — the unstarred-but-mandatory **National (SA)** area-of-operations
> select. See `2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md`.
>
> **Registration is NOT blocked.** APPL26-01494 was completed and submitted end-to-end on 2026-08-20 with lat/long
> blank throughout. The "address is the registration blocker" note in CLAUDE.md should be retired.
>
> Two earlier claims are now both retracted: (1) "the autocomplete renders no suggestions" — a test-harness error, I
> searched Google's default `.pac-container` but this app renders its own `div.suggestion` list; (2) "lat/long blank
> blocks Next" — as above.

> ## ⚠️⚠️ AND THE DATA-LOSS CLAIM IS ALSO WITHDRAWN (2026-08-20, later still)
> The version above said the coordinates "simply cannot be captured" and that "the Spatial Map dashboard has no data
> to plot". **Both are wrong.** The coordinates **are** captured and stored correctly.
>
> Verified on the very NPO whose wizard fields were blank (APPL26-01494 / `db7d5cc6-…`): its physical-address record
> `DsdAddress 7827cc2f-…` holds **`latitude: -25.7479`, `longitude: 28.18467`**, and its `fullAddress` renders as
> *"134 Pretorius Street, Pretoria Central, Pretoria, South Africa, 0002, **(28.18467, -25.7479)**"* — which is also
> how the address is displayed back on the *Submit A Query* screen.
>
> ⇒ The geometry write-back **works**. This is a **display-only defect in the wizard's Latitude/Longitude fields**.
> Severity drops to **Low (cosmetic)**. This is the **third** correction to this bug — see the lesson at the bottom.

## Summary — what is actually wrong
Selecting a place from the **Full Address** autocomplete populates **Province, Metropolitan Municipality and Area
Code**, and **does** resolve and persist the place geometry to the address record — but the wizard's own **Latitude**
and **Longitude** fields **render blank** throughout. They are display-only items (no bound `<input>`), so the user
sees two permanently empty fields and has no way to tell that the coordinates were in fact captured.

## Evidence (2026-08-20 retest)
- Selecting "134 Pretorius Street, Pretoria Central, Pretoria" filled Province=**Gauteng**,
  Metro=**City of Tshwane Metropolitan Municipality**, Area Code=**0002**. Latitude/Longitude=**blank**.
- **The slow-load hypothesis is disproven.** Waited a full **15 s** after selection (previous observation was only
  ~1.2 s) and re-read the DOM: both still blank. Screenshot:
  `../2026-08-20/evidence/registration-latlong-blank-after-15s.png`.
- Blank via **mouse click** on the suggestion and via **keyboard** (type → ArrowDown → Enter).
- Same on the **office-bearer** Residential/Work Address controls: `latitude`/`longitude` stay blank there too.
- Both fields are **display-only** (`label[for=latitude]` has no bound input), so an assessor or applicant cannot
  key the coordinates in by hand.

## Likely cause (needs dev confirmation)
The geometry is resolved and persisted (proven above), so this is **not** a Maps or geocode failure. The two wizard
fields are simply **not bound to the resolved values** — they are display components pointed at `latitude`/`longitude`
on a model that is populated server-side (or populated after the step re-renders), so they never show anything.

The page does log **"You have included the Google Maps JavaScript API multiple times on this page"** and carries **3
`maps.googleapis.com/maps/api/js` script tags**. That duplicate load is worth cleaning up on its own, but it is **no
longer implicated in this bug** — the write-back it was supposed to explain turns out to work.

## Impact (revised, twice)
- **No functional block on registration** — applications submit fine.
- **No data loss** — coordinates are stored on the address record and appear in `fullAddress`.
- **The Spatial Map is NOT starved of data** — retracted; NPOs registered through this wizard do have coordinates.
- What remains: the applicant and the assessor both see two blank fields on a form that claims to capture coordinates,
  which invites exactly the wrong conclusion — as it did here, three times over.

## Related finding, same area — Metropolitan Municipality doesn't survive to the admin portal
On the public form, Metro showed **City of Tshwane Metropolitan Municipality** for both physical and postal address.
In the admin portal's Application Details → Organisation Details, **District Municipality and Metropolitan
Municipality are both blank** while Province and Area Code carry through. So either the metro value is derived for
display only and never persisted, or the admin view doesn't read it. Worth confirming alongside the lat/long fix —
it may be the same "derived for display, never bound to the model" defect.

## Steps to reproduce
1. Public portal → Register a new NPO → accept POPIA → **Organisation Details**.
2. In **Full Address** type an address and pick a suggestion from the `div.suggestion` dropdown.
3. Province / Metro / Area Code populate; **Latitude and Longitude stay blank**, and stay blank after 15 s.
4. Complete the remaining required fields (including **National (SA)**) → Next enables and the wizard proceeds normally.

## Expected
The wizard's Latitude and Longitude fields should display the coordinates that were resolved and stored for the
selected place — or, if they are not meant to be shown to the applicant, be removed from the form.

## Question for the test lead (Thabiso)
Should the applicant see Latitude/Longitude at all? If not, deleting the two fields is the cleaner fix than binding
them. Separately, the triple Google Maps script include is worth raising with the devs on its own merits.

## 🔑 Lesson for us — this bug was wrong three times
1. *"The autocomplete renders no suggestions"* — my selector error (`.pac-container` vs `div.suggestion`).
2. *"Blank lat/long blocks Next"* — the real gate was the unstarred **National (SA)** field.
3. *"Coordinates are never captured / the Spatial Map has nothing to plot"* — they are captured; only the display is broken.

Each time the mistake was the same shape: **inferring a back-end failure from what the UI showed**, without checking
the stored record. The fix that would have caught all three: before claiming data is lost or a field is blocking,
**read the persisted entity**. Reinforces [[verify-before-claiming-app-bug]].
