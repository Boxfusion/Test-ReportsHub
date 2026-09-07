# Bug: OTP generation fails with HTTP 500 on Phase 2 (Individual + Landbank Branch, consent = False)

- **Plan**: `projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.md`
- **Failing TC**: TC-07 — Individual lead via Landbank Branch, consent via OTP
- **Step**: CLICK **Request OTP** (after Mobile Number, Email Address and a Luhn-valid ID Number are filled)
- **Expected**: The **OTP** field (`otpPin`) and **Submit OTP** button are revealed so the OTP challenge can be exercised.
- **Actual**: `POST /api/services/app/ApprovalOtp/GenerateLeadOtp` returns **HTTP 500 Internal Server Error**. No `otpPin` field appears; console logs `Failed to generate OTP: AxiosError: Request failed with status code 500`. Reproduced twice live via Playwright MCP against `PHASE2_APP_URL`, and in the automated Playwright run.
- **Suspected category**: business-logic (backend endpoint failure, not a UI/selector problem)
- **Playwright error**:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error) @ https://landbankcrm-api-lb-phase2.shesha.app/api/services/app/ApprovalOtp/GenerateLeadOtp:0
Failed to generate OTP: AxiosError: Request failed with status code 500
```
- **Suspected cause**: `GenerateLeadOtp` on the Phase 2 API either isn't wired to an OTP/SMS provider in this environment, or throws on some input this test supplies (mobile `0820001202`, ID `8503155400083`). Dev's equivalent flow (`dev/leads/lead-to-opportunity-lifecycle.md` TC-07) does not report this failure, so it looks Phase-2-environment-specific rather than a universal regression.

---

# Bug: Individual + Landbank Branch consent-upload never reveals the Client Information block

- **Plan**: `projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.md`
- **Failing TC**: TC-06 — Individual lead via Landbank Branch with Upload Consent = True
- **Step**: CLICK the **Upload** button after attaching `test-data/pdf-test.pdf` to **Upload Consent**
- **Expected** (per the Dev equivalent, `dev/leads/lead-to-opportunity-lifecycle.md` TC-06): clicking **Upload** reveals the Client Information block (Title, First Name, Last Name, Province, Preferred Communication) so the RM can complete and save the lead.
- **Actual**: clicking **Upload** clears Mobile Number, Email Address and ID Number (matching Dev) but the Client Information block never appears — the form stays on just Lead Owner / Lead Channel / Client Type / Mobile Number / Email Address / ID Number / the Upload Consent control (field name `manualApproval`). **Save stays permanently disabled**, even after re-entering valid Mobile Number, Email Address and ID Number, because the required Title/First Name/Last Name/Province/Preferred Communication fields are never rendered for input. Reproduced twice live via Playwright MCP against `PHASE2_APP_URL`.
- **Suspected category**: business-logic (form-state bug in the `LandBank.Crm/LBLead-create` component — the reveal that should follow the CIPC/consent auto-populate branch for the Individual+Landbank Branch path)
- **Suspected cause**: the reveal-on-upload logic that Dev's build applies for this exact path either isn't wired for Phase 2's version of `LandBank.Crm/LBLead-create v19`, or requires a document that yields a real auto-populate result (the stand-in `test-data/pdf-test.pdf` is not a genuine signed consent form, and Dev's plan notes the *entity* auto-populate is keyed off the Company Registration Number rather than the document — but the *individual* path has no equivalent non-document key, so if Phase 2 now requires the document content, this path may be permanently unable to complete with a placeholder file).
