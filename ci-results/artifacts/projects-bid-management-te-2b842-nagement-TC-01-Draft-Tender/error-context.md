# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-01: Draft Tender
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:816:7

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last().locator('td[title="2026-09-10"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - menu [ref=e9]:
        - menuitem "container Bid Management" [ref=e10] [cursor=pointer]:
          - img "container" [ref=e11]
          - generic [ref=e14]: Bid Management
        - menuitem "menu-unfold SupplyChain Management" [ref=e15] [cursor=pointer]:
          - img "menu-unfold" [ref=e16]
          - generic [ref=e19]: SupplyChain Management
        - menuitem "file-text Contract Management" [ref=e20] [cursor=pointer]:
          - img "file-text" [ref=e21]
          - generic [ref=e24]: Contract Management
        - menuitem "apartment Workflows" [ref=e25] [cursor=pointer]:
          - img "apartment" [ref=e26]
          - generic [ref=e29]: Workflows
        - menuitem "account-book Requisition" [ref=e30] [cursor=pointer]:
          - img "account-book" [ref=e31]
          - generic [ref=e34]: Requisition
        - menuitem "setting Configurations" [ref=e35] [cursor=pointer]:
          - img "setting" [ref=e36]
          - generic [ref=e39]: Configurations
        - menuitem "tool Administration" [ref=e40] [cursor=pointer]:
          - img "tool" [ref=e41]
          - generic [ref=e44]: Administration
      - img "menu-unfold" [ref=e47] [cursor=pointer]
    - generic [ref=e50]:
      - banner [ref=e51]:
        - generic [ref=e57]:
          - generic [ref=e59]:
            - button [ref=e60] [cursor=pointer]:
              - img "edit" [ref=e61]
            - paragraph [ref=e64] [cursor=pointer]: Shesha/header v9
            - generic [ref=e65]:
              - generic [ref=e66]: Live
              - img "close" [ref=e67] [cursor=pointer]
          - generic [ref=e78]:
            - link [ref=e84] [cursor=pointer]:
              - /url: /
            - generic [ref=e96]:
              - generic [ref=e97]:
                - generic [ref=e99]:
                  - generic [ref=e100]: Live Mode
                  - switch "Switch to Edit mode" [ref=e102] [cursor=pointer]
                - generic "Click to change view mode" [ref=e106] [cursor=pointer]:
                  - img "block" [ref=e107]
                  - generic [ref=e110]: Latest
              - generic [ref=e112]:
                - generic [ref=e113] [cursor=pointer]:
                  - text: Maand-awe Mamathuntsha
                  - img "down" [ref=e114]
                - img "user" [ref=e118]
      - main [ref=e121]:
        - generic [ref=e126]:
          - generic [ref=e127]:
            - generic [ref=e130]:
              - heading [level=4] [ref=e132]:
                - strong [ref=e133]: "Capture Tender Details:"
              - generic [ref=e134]: Draft
            - generic [ref=e138]:
              - generic [ref=e139]: "Ref No: REF2026-0994"
              - generic [ref=e140]: "Created by: Maand-awe Mamathuntsha in 2 hours"
          - generic [ref=e145]:
            - generic [ref=e147]:
              - button [ref=e148] [cursor=pointer]:
                - img "edit" [ref=e149]
              - paragraph [ref=e152] [cursor=pointer]: Shesha.SupplyChainManagement/capture-tender-details v48
              - generic [ref=e153]:
                - generic [ref=e154]: Live
                - img "close" [ref=e155] [cursor=pointer]
            - generic [ref=e168]:
              - generic [ref=e169]:
                - generic [ref=e170]:
                  - generic [ref=e172]:
                    - generic [ref=e173]: "1"
                    - generic [ref=e174]: Tender Details
                  - generic [ref=e177]:
                    - generic [ref=e178]: "2"
                    - generic [ref=e179]: Tender Documents
                  - generic [ref=e182]:
                    - generic [ref=e183]: "3"
                    - generic [ref=e184]: Response Documents
                  - generic [ref=e187]:
                    - generic [ref=e188]: "4"
                    - generic [ref=e189]: Technical Evaluation
                  - generic [ref=e192]:
                    - generic [ref=e193]: "5"
                    - generic [ref=e194]: Summary
                - generic [ref=e199]:
                  - generic [ref=e204]:
                    - generic [ref=e205]:
                      - img "right" [ref=e207] [cursor=pointer]
                      - generic [ref=e210]: Tender Information
                    - generic [ref=e218]:
                      - generic [ref=e220]:
                        - generic "Tender Number" [ref=e222]:
                          - text: Tender Number
                          - generic [ref=e223]: "*"
                        - generic [ref=e224]: REF2026-0994
                      - generic [ref=e228]:
                        - generic "Tender Name" [ref=e230]:
                          - text: Tender Name
                          - generic [ref=e231]: "*"
                        - textbox [ref=e236]: TC-01 Automated Draft Tender run-mtqmp7d0 - 90/10 Compulsory Hybrid
                      - generic [ref=e238]:
                        - generic "Description" [ref=e240]:
                          - text: Description
                          - generic [ref=e241]: "*"
                        - textbox [ref=e245]: Automated TC-01 draft tender created via Playwright on the QA site.
                      - generic [ref=e247]:
                        - generic "Evaluation Criteria" [ref=e249]
                        - generic [ref=e254]:
                          - generic [ref=e256] [cursor=pointer]:
                            - radio "90/10" [checked] [ref=e258]
                            - generic [ref=e260]: 90/10
                          - generic [ref=e262] [cursor=pointer]:
                            - radio "80/20" [ref=e264]
                            - generic [ref=e266]: 80/20
                      - generic [ref=e268]:
                        - generic "Is On Procurement Plan" [ref=e270]
                        - checkbox [ref=e276] [cursor=pointer]
                      - generic [ref=e279]:
                        - generic "Procurement plan" [ref=e281]
                        - button "upload (press to upload)" [ref=e289] [cursor=pointer]:
                          - img "upload" [ref=e291]
                          - generic [ref=e294]: (press to upload)
                  - generic [ref=e301]:
                    - generic [ref=e302]:
                      - img "right" [ref=e304] [cursor=pointer]
                      - generic [ref=e307]: Tender Publication
                    - generic [ref=e312]:
                      - generic [ref=e315]:
                        - heading "Briefing Session" [level=5] [ref=e321]
                        - generic [ref=e323]:
                          - generic [ref=e325]:
                            - generic "Briefing Session Requirement" [ref=e327]
                            - generic [ref=e332]:
                              - generic [ref=e334] [cursor=pointer]:
                                - radio "Not Required" [ref=e336]
                                - generic [ref=e338]: Not Required
                              - generic [ref=e340] [cursor=pointer]:
                                - radio "Compulsory" [checked] [ref=e342]
                                - generic [ref=e344]: Compulsory
                              - generic [ref=e346] [cursor=pointer]:
                                - radio "Non Compulsory" [ref=e348]
                                - generic [ref=e350]: Non Compulsory
                          - generic [ref=e352]:
                            - generic "Briefing Session Start Time" [ref=e354]:
                              - text: Briefing Session Start Time
                              - generic [ref=e355]: "*"
                            - generic [ref=e360]:
                              - textbox [ref=e361]
                              - generic:
                                - img "calendar"
                          - generic [ref=e363]:
                            - generic "Briefing Method" [ref=e365]:
                              - text: Briefing Method
                              - generic [ref=e366]: "*"
                            - generic [ref=e371]:
                              - generic [ref=e373] [cursor=pointer]:
                                - radio "Online" [ref=e375]
                                - generic [ref=e377]: Online
                              - generic [ref=e379] [cursor=pointer]:
                                - radio "Physical" [ref=e381]
                                - generic [ref=e383]: Physical
                              - generic [ref=e385] [cursor=pointer]:
                                - radio "Hybrid" [checked] [ref=e387]
                                - generic [ref=e389]: Hybrid
                          - generic [ref=e391]:
                            - generic "Meeting link" [ref=e393]:
                              - text: Meeting link
                              - generic [ref=e394]: "*"
                            - textbox [ref=e399]: https://teams.microsoft.com/l/meetup-join/tc02-automated
                          - generic [ref=e401]:
                            - generic "Briefing Session Venue" [ref=e403]:
                              - text: Briefing Session Venue
                              - generic [ref=e404]: "*"
                            - textbox [ref=e409]: Boardroom A, Head Office
                      - generic [ref=e412]:
                        - heading "Publication Dates" [level=5] [ref=e418]
                        - generic [ref=e420]:
                          - generic [ref=e422]:
                            - generic "Bid publication Date" [ref=e424]:
                              - text: Bid publication Date
                              - generic [ref=e425]: "*"
                            - generic [ref=e430]:
                              - textbox [ref=e431]
                              - generic:
                                - img "calendar"
                          - generic [ref=e433]:
                            - generic "Bid closing Date" [ref=e435]:
                              - text: Bid closing Date
                              - generic [ref=e436]: "*"
                            - generic [ref=e441]:
                              - textbox [ref=e442]
                              - generic:
                                - img "calendar"
                      - generic [ref=e445]:
                        - heading "Contact Details" [level=5] [ref=e451]
                        - generic [ref=e453]:
                          - generic [ref=e455]:
                            - generic "Contact person name" [ref=e457]:
                              - text: Contact person name
                              - generic [ref=e458]: "*"
                            - textbox [ref=e463]: Maanda Mamathuntsha
                          - generic [ref=e465]:
                            - generic "Telephone" [ref=e467]:
                              - text: Telephone
                              - generic [ref=e468]: "*"
                            - textbox [ref=e473]: "0123456789"
                          - generic [ref=e475]:
                            - generic "Email" [ref=e477]:
                              - text: Email
                              - generic [ref=e478]: "*"
                            - textbox [ref=e483]: maanda.test@example.com
                  - generic [ref=e488]:
                    - generic [ref=e489]:
                      - img "right" [ref=e491] [cursor=pointer]
                      - generic [ref=e494]: Supporting Documents
                    - generic [ref=e498]:
                      - alert [ref=e499]:
                        - img "info-circle" [ref=e500]
                        - generic [ref=e503]: Attach all documents demonstrating that all necessary processes were followed and approvals granted.
                        - button [ref=e506] [cursor=pointer]:
                          - img "close" [ref=e507]
                      - generic [ref=e513]:
                        - generic "Supporting documents" [ref=e515]
                        - button "upload (press to upload)" [ref=e523] [cursor=pointer]:
                          - img "upload" [ref=e525]
                          - generic [ref=e528]: (press to upload)
              - generic [ref=e530]:
                - button "Close" [ref=e531] [cursor=pointer]
                - button "Next" [disabled] [ref=e533]
  - alert [ref=e534]
  - generic [ref=e537]:
    - generic [ref=e539]:
      - generic [ref=e540]:
        - generic [ref=e541]:
          - button [ref=e542] [cursor=pointer]
          - button [ref=e544] [cursor=pointer]
          - generic [ref=e546]:
            - button "Sep" [ref=e547] [cursor=pointer]
            - button "2028" [ref=e548] [cursor=pointer]
          - button [active] [ref=e549] [cursor=pointer]
          - button [ref=e551] [cursor=pointer]
        - table [ref=e554]:
          - rowgroup [ref=e555]:
            - row [ref=e556]:
              - columnheader "Su" [ref=e557]
              - columnheader "Mo" [ref=e558]
              - columnheader "Tu" [ref=e559]
              - columnheader "We" [ref=e560]
              - columnheader "Th" [ref=e561]
              - columnheader "Fr" [ref=e562]
              - columnheader "Sa" [ref=e563]
          - rowgroup [ref=e564]:
            - row [ref=e565]:
              - cell "27" [ref=e566] [cursor=pointer]
              - cell "28" [ref=e568] [cursor=pointer]
              - cell "29" [ref=e570] [cursor=pointer]
              - cell "30" [ref=e572] [cursor=pointer]
              - cell "31" [ref=e574] [cursor=pointer]
              - cell "1" [ref=e576] [cursor=pointer]
              - cell "2" [ref=e578] [cursor=pointer]
            - row [ref=e580]:
              - cell "3" [ref=e581] [cursor=pointer]
              - cell "4" [ref=e583] [cursor=pointer]
              - cell "5" [ref=e585] [cursor=pointer]
              - cell "6" [ref=e587] [cursor=pointer]
              - cell "7" [ref=e589] [cursor=pointer]
              - cell "8" [ref=e591] [cursor=pointer]
              - cell "9" [ref=e593] [cursor=pointer]
            - row [ref=e595]:
              - cell "10" [ref=e596] [cursor=pointer]
              - cell "11" [ref=e598] [cursor=pointer]
              - cell "12" [ref=e600] [cursor=pointer]
              - cell "13" [ref=e602] [cursor=pointer]
              - cell "14" [ref=e604] [cursor=pointer]
              - cell "15" [ref=e606] [cursor=pointer]
              - cell "16" [ref=e608] [cursor=pointer]
            - row [ref=e610]:
              - cell "17" [ref=e611] [cursor=pointer]
              - cell "18" [ref=e613] [cursor=pointer]
              - cell "19" [ref=e615] [cursor=pointer]
              - cell "20" [ref=e617] [cursor=pointer]
              - cell "21" [ref=e619] [cursor=pointer]
              - cell "22" [ref=e621] [cursor=pointer]
              - cell "23" [ref=e623] [cursor=pointer]
            - row [ref=e625]:
              - cell "24" [ref=e626] [cursor=pointer]
              - cell "25" [ref=e628] [cursor=pointer]
              - cell "26" [ref=e630] [cursor=pointer]
              - cell "27" [ref=e632] [cursor=pointer]
              - cell "28" [ref=e634] [cursor=pointer]
              - cell "29" [ref=e636] [cursor=pointer]
              - cell "30" [ref=e638] [cursor=pointer]
            - row [ref=e640]:
              - cell "1" [ref=e641] [cursor=pointer]
              - cell "2" [ref=e643] [cursor=pointer]
              - cell "3" [ref=e645] [cursor=pointer]
              - cell "4" [ref=e647] [cursor=pointer]
              - cell "5" [ref=e649] [cursor=pointer]
              - cell "6" [ref=e651] [cursor=pointer]
              - cell "7" [ref=e653] [cursor=pointer]
      - generic [ref=e658]:
        - list [ref=e659]:
          - listitem [ref=e660]:
            - generic [ref=e661] [cursor=pointer]: "00"
          - listitem [ref=e662]:
            - generic [ref=e663] [cursor=pointer]: "01"
          - listitem [ref=e664]:
            - generic [ref=e665] [cursor=pointer]: "02"
          - listitem [ref=e666]:
            - generic [ref=e667] [cursor=pointer]: "03"
          - listitem [ref=e668]:
            - generic [ref=e669] [cursor=pointer]: "04"
          - listitem [ref=e670]:
            - generic [ref=e671] [cursor=pointer]: "05"
          - listitem [ref=e672]:
            - generic [ref=e673] [cursor=pointer]: "06"
          - listitem [ref=e674]:
            - generic [ref=e675] [cursor=pointer]: "07"
          - listitem [ref=e676]:
            - generic [ref=e677] [cursor=pointer]: "08"
          - listitem [ref=e678]:
            - generic [ref=e679] [cursor=pointer]: "09"
          - listitem [ref=e680]:
            - generic [ref=e681] [cursor=pointer]: "10"
          - listitem [ref=e682]:
            - generic [ref=e683] [cursor=pointer]: "11"
          - listitem [ref=e684]:
            - generic [ref=e685] [cursor=pointer]: "12"
          - listitem [ref=e686]:
            - generic [ref=e687] [cursor=pointer]: "13"
          - listitem [ref=e688]:
            - generic [ref=e689] [cursor=pointer]: "14"
          - listitem [ref=e690]:
            - generic [ref=e691] [cursor=pointer]: "15"
          - listitem [ref=e692]:
            - generic [ref=e693] [cursor=pointer]: "16"
          - listitem [ref=e694]:
            - generic [ref=e695] [cursor=pointer]: "17"
          - listitem [ref=e696]:
            - generic [ref=e697] [cursor=pointer]: "18"
          - listitem [ref=e698]:
            - generic [ref=e699] [cursor=pointer]: "19"
          - listitem [ref=e700]:
            - generic [ref=e701] [cursor=pointer]: "20"
          - listitem [ref=e702]:
            - generic [ref=e703] [cursor=pointer]: "21"
          - listitem [ref=e704]:
            - generic [ref=e705] [cursor=pointer]: "22"
          - listitem [ref=e706]:
            - generic [ref=e707] [cursor=pointer]: "23"
        - list [ref=e708]:
          - listitem [ref=e709]:
            - generic [ref=e710] [cursor=pointer]: "00"
          - listitem [ref=e711]:
            - generic [ref=e712] [cursor=pointer]: "01"
          - listitem [ref=e713]:
            - generic [ref=e714] [cursor=pointer]: "02"
          - listitem [ref=e715]:
            - generic [ref=e716] [cursor=pointer]: "03"
          - listitem [ref=e717]:
            - generic [ref=e718] [cursor=pointer]: "04"
          - listitem [ref=e719]:
            - generic [ref=e720] [cursor=pointer]: "05"
          - listitem [ref=e721]:
            - generic [ref=e722] [cursor=pointer]: "06"
          - listitem [ref=e723]:
            - generic [ref=e724] [cursor=pointer]: "07"
          - listitem [ref=e725]:
            - generic [ref=e726] [cursor=pointer]: "08"
          - listitem [ref=e727]:
            - generic [ref=e728] [cursor=pointer]: "09"
          - listitem [ref=e729]:
            - generic [ref=e730] [cursor=pointer]: "10"
          - listitem [ref=e731]:
            - generic [ref=e732] [cursor=pointer]: "11"
          - listitem [ref=e733]:
            - generic [ref=e734] [cursor=pointer]: "12"
          - listitem [ref=e735]:
            - generic [ref=e736] [cursor=pointer]: "13"
          - listitem [ref=e737]:
            - generic [ref=e738] [cursor=pointer]: "14"
          - listitem [ref=e739]:
            - generic [ref=e740] [cursor=pointer]: "15"
          - listitem [ref=e741]:
            - generic [ref=e742] [cursor=pointer]: "16"
          - listitem [ref=e743]:
            - generic [ref=e744] [cursor=pointer]: "17"
          - listitem [ref=e745]:
            - generic [ref=e746] [cursor=pointer]: "18"
          - listitem [ref=e747]:
            - generic [ref=e748] [cursor=pointer]: "19"
          - listitem [ref=e749]:
            - generic [ref=e750] [cursor=pointer]: "20"
          - listitem [ref=e751]:
            - generic [ref=e752] [cursor=pointer]: "21"
          - listitem [ref=e753]:
            - generic [ref=e754] [cursor=pointer]: "22"
          - listitem [ref=e755]:
            - generic [ref=e756] [cursor=pointer]: "23"
          - listitem [ref=e757]:
            - generic [ref=e758] [cursor=pointer]: "24"
          - listitem [ref=e759]:
            - generic [ref=e760] [cursor=pointer]: "25"
          - listitem [ref=e761]:
            - generic [ref=e762] [cursor=pointer]: "26"
          - listitem [ref=e763]:
            - generic [ref=e764] [cursor=pointer]: "27"
          - listitem [ref=e765]:
            - generic [ref=e766] [cursor=pointer]: "28"
          - listitem [ref=e767]:
            - generic [ref=e768] [cursor=pointer]: "29"
          - listitem [ref=e769]:
            - generic [ref=e770] [cursor=pointer]: "30"
          - listitem [ref=e771]:
            - generic [ref=e772] [cursor=pointer]: "31"
          - listitem [ref=e773]:
            - generic [ref=e774] [cursor=pointer]: "32"
          - listitem [ref=e775]:
            - generic [ref=e776] [cursor=pointer]: "33"
          - listitem [ref=e777]:
            - generic [ref=e778] [cursor=pointer]: "34"
          - listitem [ref=e779]:
            - generic [ref=e780] [cursor=pointer]: "35"
          - listitem [ref=e781]:
            - generic [ref=e782] [cursor=pointer]: "36"
          - listitem [ref=e783]:
            - generic [ref=e784] [cursor=pointer]: "37"
          - listitem [ref=e785]:
            - generic [ref=e786] [cursor=pointer]: "38"
          - listitem [ref=e787]:
            - generic [ref=e788] [cursor=pointer]: "39"
          - listitem [ref=e789]:
            - generic [ref=e790] [cursor=pointer]: "40"
          - listitem [ref=e791]:
            - generic [ref=e792] [cursor=pointer]: "41"
          - listitem [ref=e793]:
            - generic [ref=e794] [cursor=pointer]: "42"
          - listitem [ref=e795]:
            - generic [ref=e796] [cursor=pointer]: "43"
          - listitem [ref=e797]:
            - generic [ref=e798] [cursor=pointer]: "44"
          - listitem [ref=e799]:
            - generic [ref=e800] [cursor=pointer]: "45"
          - listitem [ref=e801]:
            - generic [ref=e802] [cursor=pointer]: "46"
          - listitem [ref=e803]:
            - generic [ref=e804] [cursor=pointer]: "47"
          - listitem [ref=e805]:
            - generic [ref=e806] [cursor=pointer]: "48"
          - listitem [ref=e807]:
            - generic [ref=e808] [cursor=pointer]: "49"
          - listitem [ref=e809]:
            - generic [ref=e810] [cursor=pointer]: "50"
          - listitem [ref=e811]:
            - generic [ref=e812] [cursor=pointer]: "51"
          - listitem [ref=e813]:
            - generic [ref=e814] [cursor=pointer]: "52"
          - listitem [ref=e815]:
            - generic [ref=e816] [cursor=pointer]: "53"
          - listitem [ref=e817]:
            - generic [ref=e818] [cursor=pointer]: "54"
          - listitem [ref=e819]:
            - generic [ref=e820] [cursor=pointer]: "55"
          - listitem [ref=e821]:
            - generic [ref=e822] [cursor=pointer]: "56"
          - listitem [ref=e823]:
            - generic [ref=e824] [cursor=pointer]: "57"
          - listitem [ref=e825]:
            - generic [ref=e826] [cursor=pointer]: "58"
          - listitem [ref=e827]:
            - generic [ref=e828] [cursor=pointer]: "59"
    - list [ref=e830]:
      - listitem [ref=e831]:
        - button "OK" [disabled] [ref=e832]
```

# Test source

```ts
  70  | // stores the full name here. Every downstream TC targets THIS tender (via tenderMatch()) instead of
  71  | // `.first()` at the stage — so a broken chain can't be masked by an unrelated leftover item passing
  72  | // in its place. Falls back to the generic name when TC-01 didn't run this session (single-TC runs).
  73  | const RUN_TAG = `run-${Date.now().toString(36)}`;
  74  | let RUN_TENDER = '';
  75  | // The app-assigned Ref No (e.g. REF2026-2160) of the tender TC-01 creates. The Evaluate-Tenders list
  76  | // (TC-09) is paginated and its search box matches the REF, NOT the tender name — so downstream
  77  | // evaluate-stage TCs must search by this REF to find the right card rather than scanning page 1.
  78  | // Can be seeded via the RUN_REF env var to validate the evaluate-stage TCs standalone (without TC-01).
  79  | let RUN_REF = process.env.RUN_REF || '';
  80  | 
  81  | // ⚠️ The REF must survive a WORKER RESTART. Playwright tears down the worker process after a test
  82  | // fails and starts a fresh one for the remaining tests — which re-imports this module and wipes every
  83  | // module-level `let`. On 2026-07-30 that silently broke the 80/20 chain: TC-04 failed, RUN_REF reset
  84  | // to '', tenderMatch() fell back to the generic name, and TC-05→TC-16 each grabbed whatever unrelated
  85  | // LEFTOVER tender happened to sit at their stage (they all "passed" against REF2026-0901 while our
  86  | // own REF2026-0999 sat untouched at Consolidate Responses). So the REF is persisted to disk and
  87  | // re-read on demand, and there is NO generic-name fallback unless it is explicitly opted into.
  88  | const CHAIN_REF_FILE = path.join(__dirname, '..', '..', 'test-results', 'chain-ref.json');
  89  | function persistChainRef(ref: string) {
  90  |   try {
  91  |     fs.mkdirSync(path.dirname(CHAIN_REF_FILE), { recursive: true });
  92  |     fs.writeFileSync(CHAIN_REF_FILE, JSON.stringify({ ref, tender: RUN_TENDER, pid: process.pid }));
  93  |   } catch { /* a non-writable path must never fail the run — tenderMatch() then throws instead */ }
  94  | }
  95  | function readChainRef(): string {
  96  |   try { return JSON.parse(fs.readFileSync(CHAIN_REF_FILE, 'utf8')).ref || ''; } catch { return ''; }
  97  | }
  98  | // Pin every downstream stage to the exact tender TC-01 created (or the one seeded via RUN_REF): inbox
  99  | // rows carry the Ref No and the REF is unique, so filtering rows by it can't drift onto a leftover.
  100 | // Order: in-memory REF → env RUN_REF → the REF persisted by TC-01 (survives worker restarts).
  101 | // If none is known the chain is NOT pinned, so throw rather than silently matching any tender —
  102 | // set ALLOW_ANY_TENDER=1 to opt into the old generic-name behaviour for exploratory single-TC runs.
  103 | function tenderMatch(): string {
  104 |   const ref = RUN_REF || readChainRef();
  105 |   if (ref) { RUN_REF = ref; return ref; }
  106 |   if (RUN_TENDER) return RUN_TENDER;
  107 |   if (process.env.ALLOW_ANY_TENDER === '1') return 'TC-01 Automated Draft Tender';
  108 |   throw new Error(
  109 |     'chain tender is UNKNOWN — refusing to target an arbitrary leftover tender. Either run TC-01 in '
  110 |     + 'the same invocation, pass RUN_REF=<REF2026-nnnn> to pin an existing tender, or set '
  111 |     + 'ALLOW_ANY_TENDER=1 to accept any "TC-01 Automated Draft Tender" at this stage.',
  112 |   );
  113 | }
  114 | // Evaluation Criteria split (price/functionality weighting). Default 90/10; override per run with the
  115 | // EVAL_CRITERIA env var (e.g. EVAL_CRITERIA=80/20). Drives the TC-01 radio + the TC-02/04 read-only checks.
  116 | const EVAL_CRITERIA = process.env.EVAL_CRITERIA || '90/10';
  117 | 
  118 | // Tender dates MUST be computed relative to today, never hardcoded. The AntD pickers render past day
  119 | // cells as `.ant-picker-cell-disabled`, and a disabled cell silently refuses the click — the run then
  120 | // dies on a 15 s click timeout rather than a clear assertion. That is exactly how this spec broke on
  121 | // 2026-07-29: it still asked for 2026-07-01, which had drifted into the past since the 2026-06-08 run.
  122 | // Offsets preserve the business ordering the app enforces: briefing < publication < closing.
  123 | function futureDay(offsetDays: number): string {
  124 |   const d = new Date();
  125 |   d.setDate(d.getDate() + offsetDays);
  126 |   const p = (n: number) => String(n).padStart(2, '0');
  127 |   return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  128 | }
  129 | const BRIEFING_DATE = futureDay(3);      // Briefing Session Start Time
  130 | const PUBLICATION_DATE = futureDay(4);   // Bid publication Date — after the briefing
  131 | const CLOSING_DATE = futureDay(30);      // Bid closing Date — well after publication
  132 | const BEC_MEETING_DATE = futureDay(5);   // TC-07 Invite BEC Members → Meeting date and time
  133 | 
  134 | // Recorded live: the header has a view-mode selector (tooltip "Click to change view mode")
  135 | // that toggles Live / Ready / Latest. The Draft-Tender form only renders its latest fields
  136 | // in "Latest" mode, so switch to it after login. Guarded — no-op if the control is absent.
  137 | async function switchToLatest(page: Page) {
  138 |   const selector = page.getByTitle('Click to change view mode');
  139 |   await selector.waitFor({ state: 'visible', timeout: 20000 });
  140 |   if ((await selector.innerText().catch(() => '')).includes('Latest')) return;
  141 |   // The dropdown occasionally drops the menu click, so retry open+select until it sticks.
  142 |   await expect(async () => {
  143 |     await selector.click();
  144 |     await page.getByRole('menuitem', { name: /^Latest/ }).click({ timeout: 5000 });
  145 |     await expect(selector).toContainText('Latest', { timeout: 5000 });
  146 |   }).toPass({ timeout: 30000 });
  147 |   // Switching view mode reloads configurable components (incl. the side menu); let it settle.
  148 |   await page.waitForLoadState('networkidle');
  149 | }
  150 | 
  151 | // Recorded live: the "(press to upload)" buttons open a native file chooser. Driving the
  152 | // chooser is more reliable than setInputFiles on the hidden AntD input (which intermittently
  153 | // fails to register the file). Then wait for the upload to surface before continuing.
  154 | async function uploadFile(page: Page, trigger: Locator, file: string) {
  155 |   const chooserPromise = page.waitForEvent('filechooser');
  156 |   await trigger.click();
  157 |   (await chooserPromise).setFiles(file);
  158 | }
  159 | 
  160 | // Recorded live: Ant DatePicker with showTime. .fill() does NOT commit to React state
  161 | // (a later re-render wipes it), so drive the panel: navigate to the month, click the day
  162 | // cell (td[title="YYYY-MM-DD"]), click the hour, then the enabled OK button.
  163 | async function pickAntDateTime(page: Page, field: Locator, dateTitle: string, hour: string) {
  164 |   await field.click();
  165 |   const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
  166 |   const cell = dropdown.locator(`td[title="${dateTitle}"]`);
  167 |   for (let i = 0; i < 24 && !(await cell.isVisible().catch(() => false)); i++) {
  168 |     await dropdown.locator('.ant-picker-header-next-btn').first().click();
  169 |   }
> 170 |   await cell.click();
      |              ^ Error: locator.click: Test timeout of 180000ms exceeded.
  171 |   await dropdown.locator('.ant-picker-time-panel-column').first()
  172 |     .locator('.ant-picker-time-panel-cell-inner')
  173 |     .filter({ hasText: new RegExp(`^${hour}$`) }).first().click();
  174 |   await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-ok button').click();
  175 | }
  176 | 
  177 | // Recorded live (Playwright MCP): Ant-Design form. Each field is its own .ant-form-item with a
  178 | // single input and no nesting; labels render as "<Label>*" (asterisk glued on), so match by
  179 | // substring on the form-item text and take the lone input inside it.
  180 | function formItem(page: Page, label: string) {
  181 |   return page.locator('.ant-form-item').filter({ hasText: label });
  182 | }
  183 | 
  184 | // Recorded: login fields expose only placeholders (no accessible name); button is "Sign In".
  185 | // The chain logs in ~16 times (once per TC) and on the slow QA app the login SPA sometimes has not
  186 | // hydrated when goto() resolves — TC-06 died on 2026-07-29 with `locator.fill` timing out on
  187 | // getByPlaceholder('Username') after 15 s. So wait explicitly for the field, and retry the whole
  188 | // navigation once before giving up rather than failing the TC (and cascading the rest of the chain).
  189 | async function loginAs(page: Page, creds: { user: string; password: string }) {
  190 |   const username = page.getByPlaceholder('Username');
  191 |   await expect(async () => {
  192 |     await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  193 |     await expect(username).toBeVisible({ timeout: 20000 });
  194 |   }).toPass({ timeout: 70000 });
  195 |   await username.fill(creds.user);
  196 |   await page.getByPlaceholder('Password').fill(creds.password);
  197 |   await page.getByRole('button', { name: 'Sign In' }).click();
  198 |   await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  199 |   await page.waitForLoadState('networkidle');
  200 |   await switchToLatest(page);
  201 | }
  202 | async function loginAsAdmin(page: Page) {
  203 |   await loginAs(page, ADMIN);
  204 | }
  205 | 
  206 | // Recorded: Ant-Design accordion menu. Workflows expands to Inbox/My Items/Sent Items/Draft.
  207 | // The submenu animates open, so the Inbox click can hit an unstable / intercepted target —
  208 | // retry it (re-opening Workflows if the submenu collapsed) until the inbox actually loads.
  209 | // Same resilience as openInbox, for the "My Items" branch of the sidebar. TC-01 originally did a plain
  210 | // `myItems.click()`, which intermittently died on Playwright's stability check — the flyout is still
  211 | // animating, so the log reads "element is not stable" and then "element is not visible" once it
  212 | // collapses again (observed 2026-07-29: 30 retries over 15 s, TC-01 failed and the whole chain
  213 | // cascaded). Retry open+click until the URL actually changes.
  214 | async function openMyItems(page: Page) {
  215 |   const workflows = page.getByRole('menuitem', { name: 'Workflows' });
  216 |   const myItems = page.getByRole('menuitem', { name: 'My Items' });
  217 |   await workflows.click();
  218 |   await expect(async () => {
  219 |     if (!(await myItems.isVisible().catch(() => false))) {
  220 |       await workflows.click({ timeout: 5000 });
  221 |     }
  222 |     await myItems.click({ timeout: 5000 });
  223 |     await page.waitForURL(/workflows-my-items/, { timeout: 8000 });
  224 |   }).toPass({ timeout: 40000 });
  225 |   await page.waitForLoadState('networkidle');
  226 | }
  227 | 
  228 | async function openInbox(page: Page) {
  229 |   const workflows = page.getByRole('menuitem', { name: 'Workflows' });
  230 |   const inbox = page.getByRole('menuitem', { name: 'Inbox' });
  231 |   await workflows.click();
  232 |   await expect(async () => {
  233 |     if (!(await inbox.isVisible().catch(() => false))) {
  234 |       await workflows.click({ timeout: 5000 });
  235 |     }
  236 |     await inbox.click({ timeout: 5000 });
  237 |     await page.waitForURL(/workflows-inbox/, { timeout: 8000 });
  238 |   }).toPass({ timeout: 40000 });
  239 |   await page.waitForLoadState('networkidle');
  240 | }
  241 | 
  242 | // Recorded: Bid Management expands to Dashboard/Evaluate Tenders/Calibrate Scores/TenderType Documents/Suppliers.
  243 | async function openEvaluateTenders(page: Page) {
  244 |   await page.getByRole('menuitem', { name: 'Bid Management' }).click();
  245 |   await page.getByRole('menuitem', { name: 'Evaluate Tenders' }).click();
  246 |   await page.waitForLoadState('networkidle');
  247 | }
  248 | 
  249 | // Reusable assertion: the opened item lands on the expected workflow page.
  250 | // The QA app's dynamic (configurable) pages load slowly and variably, so allow 30s.
  251 | // Also runs the Send-Back probe (opt-in) — every stage TC calls this right after its item opens, so
  252 | // instrumenting here maps the whole workflow in a single chain run.
  253 | async function expectOnPage(page: Page, pageName: string) {
  254 |   await expect(page.getByText(pageName, { exact: false }).first()).toBeVisible({ timeout: 30000 });
  255 |   if (process.env.PROBE_SENDBACK === '1') await probeSendBack(page, pageName);
  256 | }
  257 | 
  258 | // ===========================================================================================
  259 | // SEND-BACK (negative) branches, opt-in via SEND_BACKS=all or SEND_BACKS=<n,n,…> (stage numbers).
  260 | //
  261 | // Mapped live 2026-07-30 (PROBE_SENDBACK=1): every stage after the draft offers **Send Back**, and the
  262 | // Step picker lists EVERY completed predecessor — Review&Approve offers 1 target, Publish 2, Consolidate
  263 | // 3, Verify Compliance 4, Calculate SGP 5, Invite BEC 6, and so on.
  264 | //
  265 | // Each instrumented stage does: **send back to the immediately preceding step** (cheapest, most realistic
  266 | // rework) → the previous actor **re-actions** that step → the tender returns here → the normal happy
  267 | // action runs and the chain CONTINUES to Capture Order Details. So one run exercises both paths.
  268 | //
  269 | // Recovery is simpler than the first pass because the captured data persists: for most stages it is
  270 | // "tick the confirmation again and Submit". The stages needing more (the draft wizard, Approve, Publish)
```