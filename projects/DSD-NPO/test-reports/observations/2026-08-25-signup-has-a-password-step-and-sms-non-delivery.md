# Observations — sign-up has a password step after all, and SMS "Sent" does not mean delivered

**Date:** 2026-08-25
**Context:** creating two independent applicant accounts to unblock the IDOR/BOLA cluster (14Z Class B, 11 cases)
**Not a defect list.** Two things here change decisions we have already recorded, so they need flagging.

---

## 1. 🔑 Suite 01's sign-up inventory was incomplete — there IS a password step

On 2026-08-18, suite 01's "Step 0" inventoried the sign-up journey as **two** screens and concluded:

> *"Absent from the entire journey: SA ID Number, Password, Confirm Password."*
> *"…the account uses mobile-OTP, not a password set at sign-up."*

On that basis **five cases were marked `NOT EXECUTABLE — case does not match the build`** (TC-01-011, 012, 013, 015,
016), and a question was put to Thabiso asking whether to rewrite them against an email + mobile-OTP design.

**The journey is three screens, and the third is Password + Confirm Password.** Driving it end to end:

| Step | Route | Fields |
|---|---|---|
| 1 | `dsd-public-portal-send-otp` | Mobile Number → *Verify Number* → *Send OTP* |
| 2 | `signUp-public-portal?default=<mobile>` | First Name · Last Name · Email Address → **Next** |
| 3 | *(same route, after Next)* | **Password · Confirm Password** → *Sign Up* |

The password screen only appears **after clicking `Next`**. The 08-18 run inventoried the two screens by navigating
to them directly, so it never crossed that button — the fields were there all along.

**What this changes:**
- **TC-01-015 (password mismatch) is now runnable** — there are two password inputs to mismatch. It should come off
  `NOT EXECUTABLE`.
- **TC-01-011/012/013/016 need re-reading** against the real three-step journey before we ask Thabiso to rewrite
  anything. The question we sent him was based on a wrong premise.
- **SA ID is still genuinely absent.** No SA ID field appears on any of the three steps, and the created `Person`
  record carries `identityNumber: null`. So that half of the original finding stands.

⚠️ **The lesson is the same one that bit us twice more today:** an inventory taken by navigating straight to a form
misses whatever lies behind its buttons — just as a 404 on a guessed route does not prove a route is absent. Both
corrections came from *driving the flow* rather than probing endpoints.

---

## 2. `sendStatus: 1` ("Sent") does not mean the SMS arrived — now confirmed by a human

While creating account A, the OTP was dispatched to a real colleague's number (`0684078878`):

```
POST /api/services/dsdnpo/NpoOtp/SendPin
→ 200  {"result":{"operationId":"d1f77e5e-…","sentTo":"0684078878"}}

OTP record for that number: sendStatus = 1   (i.e. "Sent")
```

**Reuben confirmed the SMS never arrived.**

This matters because it converts an inference into an observation. Suite **14N TC-14-001** was verdicted FAILED today
partly on the argument that the store cannot distinguish *dispatched* from *delivered* — only three status values are
ever written (`1` Sent, `8` Failed, `16` unknown), and `DeliveryConfirmed` is never used at all. That reasoning was
sound but circumstantial. Here a message the store marks **Sent** demonstrably did not arrive, with a person on the
receiving end to say so.

**Consequences worth stating plainly:**
- Any count of "successful" notifications in these reports — including the **22 252 rows at status `1`** — measures
  *handoff to the provider*, not delivery. It should never be described as "delivered".
- The 14N TC-14-013 finding (**4 559 re-sends to recipients who had already "succeeded"**) is if anything
  understated: if `1` does not mean delivered, some of those re-sends may have been the only ones that ever landed.
- ❓ **For Thabiso:** what is status `16`? It appears on 160 messages and is the only candidate for a real delivery
  confirmation.

📌 Sign-up itself was **not blocked** by the missing SMS — the pin is readable from the
`npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber` endpoint, which answers anonymous callers (the CRITICAL
finding from TC-01-021). That is how both accounts were completed without any SMS arriving.

---

## What was created
Two working applicant accounts, self-registered with no admin involvement, both sign-in verified — see
`test-data/qa-accounts.md`. This unblocks **14Z Class B (11 cases)** and **suite 07 TC-07-020**.

▶ **One housekeeping item:** account A is tied to Reuben's real number. Nothing should text him again (the reminder
jobs act on office bearers, not on bare accounts), but if the account is kept long-term it is worth moving it to an
unallocated number like the `0999999999` used for account B.
