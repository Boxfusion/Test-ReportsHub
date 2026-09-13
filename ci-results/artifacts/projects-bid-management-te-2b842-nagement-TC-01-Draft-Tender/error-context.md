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
  - waiting for locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last().locator('td[title="2026-09-16"]')

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e4]:
    - complementary [ref=f1e5]:
      - menu [ref=f1e9]:
        - menuitem "container Bid Management" [ref=f1e10] [cursor=pointer]:
          - img "container" [ref=f1e11]
          - generic [ref=f1e14]: Bid Management
        - menuitem "menu-unfold SupplyChain Management" [ref=f1e15] [cursor=pointer]:
          - img "menu-unfold" [ref=f1e16]
          - generic [ref=f1e19]: SupplyChain Management
        - menuitem "file-text Contract Management" [ref=f1e20] [cursor=pointer]:
          - img "file-text" [ref=f1e21]
          - generic [ref=f1e24]: Contract Management
        - menuitem "apartment Workflows" [ref=f1e25] [cursor=pointer]:
          - img "apartment" [ref=f1e26]
          - generic [ref=f1e29]: Workflows
        - menuitem "account-book Requisition" [ref=f1e30] [cursor=pointer]:
          - img "account-book" [ref=f1e31]
          - generic [ref=f1e34]: Requisition
        - menuitem "setting Configurations" [ref=f1e35] [cursor=pointer]:
          - img "setting" [ref=f1e36]
          - generic [ref=f1e39]: Configurations
        - menuitem "tool Administration" [ref=f1e40] [cursor=pointer]:
          - img "tool" [ref=f1e41]
          - generic [ref=f1e44]: Administration
      - img "menu-unfold" [ref=f1e47] [cursor=pointer]
    - generic [ref=f1e50]:
      - banner [ref=f1e51]:
        - generic [ref=f1e57]:
          - generic [ref=f1e59]:
            - button [ref=f1e60] [cursor=pointer]:
              - img "edit" [ref=f1e61]
            - paragraph [ref=f1e64] [cursor=pointer]: Shesha/header v9
            - generic [ref=f1e65]:
              - generic [ref=f1e66]: Live
              - img "close" [ref=f1e67] [cursor=pointer]
          - generic [ref=f1e78]:
            - link [ref=f1e84] [cursor=pointer]:
              - /url: /
            - generic [ref=f1e96]:
              - generic [ref=f1e97]:
                - generic [ref=f1e99]:
                  - generic [ref=f1e100]: Live Mode
                  - switch "Switch to Edit mode" [ref=f1e102] [cursor=pointer]
                - generic "Click to change view mode" [ref=f1e106] [cursor=pointer]:
                  - img "block" [ref=f1e107]
                  - generic [ref=f1e110]: Latest
              - generic [ref=f1e112]:
                - generic [ref=f1e113] [cursor=pointer]:
                  - text: Maand-awe Mamathuntsha
                  - img "down" [ref=f1e114]
                - img "user" [ref=f1e118]
      - main [ref=f1e121]:
        - generic [ref=f1e126]:
          - generic [ref=f1e127]:
            - generic [ref=f1e130]:
              - heading [level=4] [ref=f1e132]:
                - strong [ref=f1e133]: "Capture Tender Details:"
              - generic [ref=f1e134]: Draft
            - generic [ref=f1e138]:
              - generic [ref=f1e139]: "Ref No: REF2026-1471"
              - generic [ref=f1e140]: "Created by: Maand-awe Mamathuntsha in 2 hours"
          - generic [ref=f1e145]:
            - generic [ref=f1e147]:
              - button [ref=f1e148] [cursor=pointer]:
                - img "edit" [ref=f1e149]
              - paragraph [ref=f1e152] [cursor=pointer]: Shesha.SupplyChainManagement/capture-tender-details v48
              - generic [ref=f1e153]:
                - generic [ref=f1e154]: Live
                - img "close" [ref=f1e155] [cursor=pointer]
            - generic [ref=f1e168]:
              - generic [ref=f1e169]:
                - generic [ref=f1e170]:
                  - generic [ref=f1e172]:
                    - generic [ref=f1e173]: "1"
                    - generic [ref=f1e174]: Tender Details
                  - generic [ref=f1e177]:
                    - generic [ref=f1e178]: "2"
                    - generic [ref=f1e179]: Tender Documents
                  - generic [ref=f1e182]:
                    - generic [ref=f1e183]: "3"
                    - generic [ref=f1e184]: Response Documents
                  - generic [ref=f1e187]:
                    - generic [ref=f1e188]: "4"
                    - generic [ref=f1e189]: Technical Evaluation
                  - generic [ref=f1e192]:
                    - generic [ref=f1e193]: "5"
                    - generic [ref=f1e194]: Summary
                - generic [ref=f1e199]:
                  - generic [ref=f1e204]:
                    - generic [ref=f1e205]:
                      - img "right" [ref=f1e207] [cursor=pointer]
                      - generic [ref=f1e210]: Tender Information
                    - generic [ref=f1e218]:
                      - generic [ref=f1e220]:
                        - generic "Tender Number" [ref=f1e222]:
                          - text: Tender Number
                          - generic [ref=f1e223]: "*"
                        - generic [ref=f1e224]: REF2026-1471
                      - generic [ref=f1e228]:
                        - generic "Tender Name" [ref=f1e230]:
                          - text: Tender Name
                          - generic [ref=f1e231]: "*"
                        - textbox [ref=f1e236]: TC-01 Automated Draft Tender run-mtz7lll2 - 90/10 Compulsory Hybrid
                      - generic [ref=f1e238]:
                        - generic "Description" [ref=f1e240]:
                          - text: Description
                          - generic [ref=f1e241]: "*"
                        - textbox [ref=f1e245]: Automated TC-01 draft tender created via Playwright on the QA site.
                      - generic [ref=f1e247]:
                        - generic "Evaluation Criteria" [ref=f1e249]
                        - generic [ref=f1e254]:
                          - generic [ref=f1e256] [cursor=pointer]:
                            - radio "90/10" [checked] [ref=f1e258]
                            - generic [ref=f1e260]: 90/10
                          - generic [ref=f1e262] [cursor=pointer]:
                            - radio "80/20" [ref=f1e264]
                            - generic [ref=f1e266]: 80/20
                      - generic [ref=f1e268]:
                        - generic "Is On Procurement Plan" [ref=f1e270]
                        - checkbox [ref=f1e276] [cursor=pointer]
                      - generic [ref=f1e279]:
                        - generic "Procurement plan" [ref=f1e281]
                        - button "upload (press to upload)" [ref=f1e289] [cursor=pointer]:
                          - img "upload" [ref=f1e291]
                          - generic [ref=f1e294]: (press to upload)
                  - generic [ref=f1e301]:
                    - generic [ref=f1e302]:
                      - img "right" [ref=f1e304] [cursor=pointer]
                      - generic [ref=f1e307]: Tender Publication
                    - generic [ref=f1e312]:
                      - generic [ref=f1e315]:
                        - heading "Briefing Session" [level=5] [ref=f1e321]
                        - generic [ref=f1e323]:
                          - generic [ref=f1e325]:
                            - generic "Briefing Session Requirement" [ref=f1e327]
                            - generic [ref=f1e332]:
                              - generic [ref=f1e334] [cursor=pointer]:
                                - radio "Not Required" [ref=f1e336]
                                - generic [ref=f1e338]: Not Required
                              - generic [ref=f1e340] [cursor=pointer]:
                                - radio "Compulsory" [checked] [ref=f1e342]
                                - generic [ref=f1e344]: Compulsory
                              - generic [ref=f1e346] [cursor=pointer]:
                                - radio "Non Compulsory" [ref=f1e348]
                                - generic [ref=f1e350]: Non Compulsory
                          - generic [ref=f1e352]:
                            - generic "Briefing Session Start Time" [ref=f1e354]:
                              - text: Briefing Session Start Time
                              - generic [ref=f1e355]: "*"
                            - generic [ref=f1e360]:
                              - textbox [ref=f1e361]
                              - generic:
                                - img "calendar"
                          - generic [ref=f1e363]:
                            - generic "Briefing Method" [ref=f1e365]:
                              - text: Briefing Method
                              - generic [ref=f1e366]: "*"
                            - generic [ref=f1e371]:
                              - generic [ref=f1e373] [cursor=pointer]:
                                - radio "Online" [ref=f1e375]
                                - generic [ref=f1e377]: Online
                              - generic [ref=f1e379] [cursor=pointer]:
                                - radio "Physical" [ref=f1e381]
                                - generic [ref=f1e383]: Physical
                              - generic [ref=f1e385] [cursor=pointer]:
                                - radio "Hybrid" [checked] [ref=f1e387]
                                - generic [ref=f1e389]: Hybrid
                          - generic [ref=f1e391]:
                            - generic "Meeting link" [ref=f1e393]:
                              - text: Meeting link
                              - generic [ref=f1e394]: "*"
                            - textbox [ref=f1e399]: https://teams.microsoft.com/l/meetup-join/tc02-automated
                          - generic [ref=f1e401]:
                            - generic "Briefing Session Venue" [ref=f1e403]:
                              - text: Briefing Session Venue
                              - generic [ref=f1e404]: "*"
                            - textbox [ref=f1e409]: Boardroom A, Head Office
                      - generic [ref=f1e412]:
                        - heading "Publication Dates" [level=5] [ref=f1e418]
                        - generic [ref=f1e420]:
                          - generic [ref=f1e422]:
                            - generic "Bid publication Date" [ref=f1e424]:
                              - text: Bid publication Date
                              - generic [ref=f1e425]: "*"
                            - generic [ref=f1e430]:
                              - textbox [ref=f1e431]
                              - generic:
                                - img "calendar"
                          - generic [ref=f1e433]:
                            - generic "Bid closing Date" [ref=f1e435]:
                              - text: Bid closing Date
                              - generic [ref=f1e436]: "*"
                            - generic [ref=f1e441]:
                              - textbox [ref=f1e442]
                              - generic:
                                - img "calendar"
                      - generic [ref=f1e445]:
                        - heading "Contact Details" [level=5] [ref=f1e451]
                        - generic [ref=f1e453]:
                          - generic [ref=f1e455]:
                            - generic "Contact person name" [ref=f1e457]:
                              - text: Contact person name
                              - generic [ref=f1e458]: "*"
                            - textbox [ref=f1e463]: Maanda Mamathuntsha
                          - generic [ref=f1e465]:
                            - generic "Telephone" [ref=f1e467]:
                              - text: Telephone
                              - generic [ref=f1e468]: "*"
                            - textbox [ref=f1e473]: "0123456789"
                          - generic [ref=f1e475]:
                            - generic "Email" [ref=f1e477]:
                              - text: Email
                              - generic [ref=f1e478]: "*"
                            - textbox [ref=f1e483]: maanda.test@example.com
                  - generic [ref=f1e488]:
                    - generic [ref=f1e489]:
                      - img "right" [ref=f1e491] [cursor=pointer]
                      - generic [ref=f1e494]: Supporting Documents
                    - generic [ref=f1e498]:
                      - alert [ref=f1e499]:
                        - img "info-circle" [ref=f1e500]
                        - generic [ref=f1e503]: Attach all documents demonstrating that all necessary processes were followed and approvals granted.
                        - button [ref=f1e506] [cursor=pointer]:
                          - img "close" [ref=f1e507]
                      - generic [ref=f1e513]:
                        - generic "Supporting documents" [ref=f1e515]
                        - button "upload (press to upload)" [ref=f1e523] [cursor=pointer]:
                          - img "upload" [ref=f1e525]
                          - generic [ref=f1e528]: (press to upload)
              - generic [ref=f1e530]:
                - button "Close" [ref=f1e531] [cursor=pointer]
                - button "Next" [disabled] [ref=f1e533]
  - alert [ref=f1e534]
  - generic [ref=f1e537]:
    - generic [ref=f1e539]:
      - generic [ref=f1e540]:
        - generic [ref=f1e541]:
          - button [ref=f1e542] [cursor=pointer]
          - button [ref=f1e544] [cursor=pointer]
          - generic [ref=f1e546]:
            - button "Sep" [ref=f1e547] [cursor=pointer]
            - button "2028" [ref=f1e548] [cursor=pointer]
          - button [active] [ref=f1e549] [cursor=pointer]
          - button [ref=f1e551] [cursor=pointer]
        - table [ref=f1e554]:
          - rowgroup [ref=f1e555]:
            - row [ref=f1e556]:
              - columnheader "Su" [ref=f1e557]
              - columnheader "Mo" [ref=f1e558]
              - columnheader "Tu" [ref=f1e559]
              - columnheader "We" [ref=f1e560]
              - columnheader "Th" [ref=f1e561]
              - columnheader "Fr" [ref=f1e562]
              - columnheader "Sa" [ref=f1e563]
          - rowgroup [ref=f1e564]:
            - row [ref=f1e565]:
              - cell "27" [ref=f1e566] [cursor=pointer]
              - cell "28" [ref=f1e568] [cursor=pointer]
              - cell "29" [ref=f1e570] [cursor=pointer]
              - cell "30" [ref=f1e572] [cursor=pointer]
              - cell "31" [ref=f1e574] [cursor=pointer]
              - cell "1" [ref=f1e576] [cursor=pointer]
              - cell "2" [ref=f1e578] [cursor=pointer]
            - row [ref=f1e580]:
              - cell "3" [ref=f1e581] [cursor=pointer]
              - cell "4" [ref=f1e583] [cursor=pointer]
              - cell "5" [ref=f1e585] [cursor=pointer]
              - cell "6" [ref=f1e587] [cursor=pointer]
              - cell "7" [ref=f1e589] [cursor=pointer]
              - cell "8" [ref=f1e591] [cursor=pointer]
              - cell "9" [ref=f1e593] [cursor=pointer]
            - row [ref=f1e595]:
              - cell "10" [ref=f1e596] [cursor=pointer]
              - cell "11" [ref=f1e598] [cursor=pointer]
              - cell "12" [ref=f1e600] [cursor=pointer]
              - cell "13" [ref=f1e602] [cursor=pointer]
              - cell "14" [ref=f1e604] [cursor=pointer]
              - cell "15" [ref=f1e606] [cursor=pointer]
              - cell "16" [ref=f1e608] [cursor=pointer]
            - row [ref=f1e610]:
              - cell "17" [ref=f1e611] [cursor=pointer]
              - cell "18" [ref=f1e613] [cursor=pointer]
              - cell "19" [ref=f1e615] [cursor=pointer]
              - cell "20" [ref=f1e617] [cursor=pointer]
              - cell "21" [ref=f1e619] [cursor=pointer]
              - cell "22" [ref=f1e621] [cursor=pointer]
              - cell "23" [ref=f1e623] [cursor=pointer]
            - row [ref=f1e625]:
              - cell "24" [ref=f1e626] [cursor=pointer]
              - cell "25" [ref=f1e628] [cursor=pointer]
              - cell "26" [ref=f1e630] [cursor=pointer]
              - cell "27" [ref=f1e632] [cursor=pointer]
              - cell "28" [ref=f1e634] [cursor=pointer]
              - cell "29" [ref=f1e636] [cursor=pointer]
              - cell "30" [ref=f1e638] [cursor=pointer]
            - row [ref=f1e640]:
              - cell "1" [ref=f1e641] [cursor=pointer]
              - cell "2" [ref=f1e643] [cursor=pointer]
              - cell "3" [ref=f1e645] [cursor=pointer]
              - cell "4" [ref=f1e647] [cursor=pointer]
              - cell "5" [ref=f1e649] [cursor=pointer]
              - cell "6" [ref=f1e651] [cursor=pointer]
              - cell "7" [ref=f1e653] [cursor=pointer]
      - generic [ref=f1e658]:
        - list [ref=f1e659]:
          - listitem [ref=f1e660]:
            - generic [ref=f1e661] [cursor=pointer]: "00"
          - listitem [ref=f1e662]:
            - generic [ref=f1e663] [cursor=pointer]: "01"
          - listitem [ref=f1e664]:
            - generic [ref=f1e665] [cursor=pointer]: "02"
          - listitem [ref=f1e666]:
            - generic [ref=f1e667] [cursor=pointer]: "03"
          - listitem [ref=f1e668]:
            - generic [ref=f1e669] [cursor=pointer]: "04"
          - listitem [ref=f1e670]:
            - generic [ref=f1e671] [cursor=pointer]: "05"
          - listitem [ref=f1e672]:
            - generic [ref=f1e673] [cursor=pointer]: "06"
          - listitem [ref=f1e674]:
            - generic [ref=f1e675] [cursor=pointer]: "07"
          - listitem [ref=f1e676]:
            - generic [ref=f1e677] [cursor=pointer]: "08"
          - listitem [ref=f1e678]:
            - generic [ref=f1e679] [cursor=pointer]: "09"
          - listitem [ref=f1e680]:
            - generic [ref=f1e681] [cursor=pointer]: "10"
          - listitem [ref=f1e682]:
            - generic [ref=f1e683] [cursor=pointer]: "11"
          - listitem [ref=f1e684]:
            - generic [ref=f1e685] [cursor=pointer]: "12"
          - listitem [ref=f1e686]:
            - generic [ref=f1e687] [cursor=pointer]: "13"
          - listitem [ref=f1e688]:
            - generic [ref=f1e689] [cursor=pointer]: "14"
          - listitem [ref=f1e690]:
            - generic [ref=f1e691] [cursor=pointer]: "15"
          - listitem [ref=f1e692]:
            - generic [ref=f1e693] [cursor=pointer]: "16"
          - listitem [ref=f1e694]:
            - generic [ref=f1e695] [cursor=pointer]: "17"
          - listitem [ref=f1e696]:
            - generic [ref=f1e697] [cursor=pointer]: "18"
          - listitem [ref=f1e698]:
            - generic [ref=f1e699] [cursor=pointer]: "19"
          - listitem [ref=f1e700]:
            - generic [ref=f1e701] [cursor=pointer]: "20"
          - listitem [ref=f1e702]:
            - generic [ref=f1e703] [cursor=pointer]: "21"
          - listitem [ref=f1e704]:
            - generic [ref=f1e705] [cursor=pointer]: "22"
          - listitem [ref=f1e706]:
            - generic [ref=f1e707] [cursor=pointer]: "23"
        - list [ref=f1e708]:
          - listitem [ref=f1e709]:
            - generic [ref=f1e710] [cursor=pointer]: "00"
          - listitem [ref=f1e711]:
            - generic [ref=f1e712] [cursor=pointer]: "01"
          - listitem [ref=f1e713]:
            - generic [ref=f1e714] [cursor=pointer]: "02"
          - listitem [ref=f1e715]:
            - generic [ref=f1e716] [cursor=pointer]: "03"
          - listitem [ref=f1e717]:
            - generic [ref=f1e718] [cursor=pointer]: "04"
          - listitem [ref=f1e719]:
            - generic [ref=f1e720] [cursor=pointer]: "05"
          - listitem [ref=f1e721]:
            - generic [ref=f1e722] [cursor=pointer]: "06"
          - listitem [ref=f1e723]:
            - generic [ref=f1e724] [cursor=pointer]: "07"
          - listitem [ref=f1e725]:
            - generic [ref=f1e726] [cursor=pointer]: "08"
          - listitem [ref=f1e727]:
            - generic [ref=f1e728] [cursor=pointer]: "09"
          - listitem [ref=f1e729]:
            - generic [ref=f1e730] [cursor=pointer]: "10"
          - listitem [ref=f1e731]:
            - generic [ref=f1e732] [cursor=pointer]: "11"
          - listitem [ref=f1e733]:
            - generic [ref=f1e734] [cursor=pointer]: "12"
          - listitem [ref=f1e735]:
            - generic [ref=f1e736] [cursor=pointer]: "13"
          - listitem [ref=f1e737]:
            - generic [ref=f1e738] [cursor=pointer]: "14"
          - listitem [ref=f1e739]:
            - generic [ref=f1e740] [cursor=pointer]: "15"
          - listitem [ref=f1e741]:
            - generic [ref=f1e742] [cursor=pointer]: "16"
          - listitem [ref=f1e743]:
            - generic [ref=f1e744] [cursor=pointer]: "17"
          - listitem [ref=f1e745]:
            - generic [ref=f1e746] [cursor=pointer]: "18"
          - listitem [ref=f1e747]:
            - generic [ref=f1e748] [cursor=pointer]: "19"
          - listitem [ref=f1e749]:
            - generic [ref=f1e750] [cursor=pointer]: "20"
          - listitem [ref=f1e751]:
            - generic [ref=f1e752] [cursor=pointer]: "21"
          - listitem [ref=f1e753]:
            - generic [ref=f1e754] [cursor=pointer]: "22"
          - listitem [ref=f1e755]:
            - generic [ref=f1e756] [cursor=pointer]: "23"
          - listitem [ref=f1e757]:
            - generic [ref=f1e758] [cursor=pointer]: "24"
          - listitem [ref=f1e759]:
            - generic [ref=f1e760] [cursor=pointer]: "25"
          - listitem [ref=f1e761]:
            - generic [ref=f1e762] [cursor=pointer]: "26"
          - listitem [ref=f1e763]:
            - generic [ref=f1e764] [cursor=pointer]: "27"
          - listitem [ref=f1e765]:
            - generic [ref=f1e766] [cursor=pointer]: "28"
          - listitem [ref=f1e767]:
            - generic [ref=f1e768] [cursor=pointer]: "29"
          - listitem [ref=f1e769]:
            - generic [ref=f1e770] [cursor=pointer]: "30"
          - listitem [ref=f1e771]:
            - generic [ref=f1e772] [cursor=pointer]: "31"
          - listitem [ref=f1e773]:
            - generic [ref=f1e774] [cursor=pointer]: "32"
          - listitem [ref=f1e775]:
            - generic [ref=f1e776] [cursor=pointer]: "33"
          - listitem [ref=f1e777]:
            - generic [ref=f1e778] [cursor=pointer]: "34"
          - listitem [ref=f1e779]:
            - generic [ref=f1e780] [cursor=pointer]: "35"
          - listitem [ref=f1e781]:
            - generic [ref=f1e782] [cursor=pointer]: "36"
          - listitem [ref=f1e783]:
            - generic [ref=f1e784] [cursor=pointer]: "37"
          - listitem [ref=f1e785]:
            - generic [ref=f1e786] [cursor=pointer]: "38"
          - listitem [ref=f1e787]:
            - generic [ref=f1e788] [cursor=pointer]: "39"
          - listitem [ref=f1e789]:
            - generic [ref=f1e790] [cursor=pointer]: "40"
          - listitem [ref=f1e791]:
            - generic [ref=f1e792] [cursor=pointer]: "41"
          - listitem [ref=f1e793]:
            - generic [ref=f1e794] [cursor=pointer]: "42"
          - listitem [ref=f1e795]:
            - generic [ref=f1e796] [cursor=pointer]: "43"
          - listitem [ref=f1e797]:
            - generic [ref=f1e798] [cursor=pointer]: "44"
          - listitem [ref=f1e799]:
            - generic [ref=f1e800] [cursor=pointer]: "45"
          - listitem [ref=f1e801]:
            - generic [ref=f1e802] [cursor=pointer]: "46"
          - listitem [ref=f1e803]:
            - generic [ref=f1e804] [cursor=pointer]: "47"
          - listitem [ref=f1e805]:
            - generic [ref=f1e806] [cursor=pointer]: "48"
          - listitem [ref=f1e807]:
            - generic [ref=f1e808] [cursor=pointer]: "49"
          - listitem [ref=f1e809]:
            - generic [ref=f1e810] [cursor=pointer]: "50"
          - listitem [ref=f1e811]:
            - generic [ref=f1e812] [cursor=pointer]: "51"
          - listitem [ref=f1e813]:
            - generic [ref=f1e814] [cursor=pointer]: "52"
          - listitem [ref=f1e815]:
            - generic [ref=f1e816] [cursor=pointer]: "53"
          - listitem [ref=f1e817]:
            - generic [ref=f1e818] [cursor=pointer]: "54"
          - listitem [ref=f1e819]:
            - generic [ref=f1e820] [cursor=pointer]: "55"
          - listitem [ref=f1e821]:
            - generic [ref=f1e822] [cursor=pointer]: "56"
          - listitem [ref=f1e823]:
            - generic [ref=f1e824] [cursor=pointer]: "57"
          - listitem [ref=f1e825]:
            - generic [ref=f1e826] [cursor=pointer]: "58"
          - listitem [ref=f1e827]:
            - generic [ref=f1e828] [cursor=pointer]: "59"
    - list [ref=f1e830]:
      - listitem [ref=f1e831]:
        - button "OK" [disabled] [ref=f1e832]
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