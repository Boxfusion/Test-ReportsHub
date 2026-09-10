# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts >> ECDEDEA-TP — EC DEDEA Bid Management (Tender Process) >> TC-07: Invite BEC Members
- Location: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts:581:7

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last().locator('td[title="2026-08-05"]')

```

# Page snapshot

```yaml
- generic [ref=f3e1]:
  - generic [ref=f3e4]:
    - complementary [ref=f3e5]:
      - menu [ref=f3e9]:
        - menuitem "appstore EPM" [ref=f3e10] [cursor=pointer]:
          - img "appstore" [ref=f3e11]
          - generic [ref=f3e14]: EPM
        - menuitem "apartment Workflows" [ref=f3e15] [cursor=pointer]:
          - img "apartment" [ref=f3e16]
          - generic [ref=f3e19]: Workflows
        - menuitem "snippets Leave Gratuity" [ref=f3e20] [cursor=pointer]:
          - img "snippets" [ref=f3e21]
          - generic [ref=f3e24]: Leave Gratuity
        - menuitem "database Sundry Payments" [ref=f3e25] [cursor=pointer]:
          - img "database" [ref=f3e26]
          - generic [ref=f3e29]: Sundry Payments
        - menuitem "pic-center Bid Management" [ref=f3e30] [cursor=pointer]:
          - img "pic-center" [ref=f3e31]
          - generic [ref=f3e34]: Bid Management
        - menuitem "menu-unfold SupplyChain Management" [ref=f3e35] [cursor=pointer]:
          - img "menu-unfold" [ref=f3e36]
          - generic [ref=f3e39]: SupplyChain Management
        - menuitem "area-chart Reports and Dashboards" [ref=f3e40] [cursor=pointer]:
          - img "area-chart" [ref=f3e41]
          - generic [ref=f3e44]: Reports and Dashboards
        - menuitem "tool Administration" [ref=f3e45] [cursor=pointer]:
          - img "tool" [ref=f3e46]
          - generic [ref=f3e49]: Administration
        - menuitem "setting Configurations" [ref=f3e50] [cursor=pointer]:
          - img "setting" [ref=f3e51]
          - generic [ref=f3e54]: Configurations
      - img "menu-unfold" [ref=f3e57] [cursor=pointer]
    - generic [ref=f3e60]:
      - banner [ref=f3e61]:
        - generic [ref=f3e67]:
          - generic [ref=f3e69]:
            - button [ref=f3e70] [cursor=pointer]:
              - img "edit" [ref=f3e71]
            - paragraph [ref=f3e74] [cursor=pointer]: Shesha/header v4
            - generic [ref=f3e75]:
              - generic [ref=f3e76]: Live
              - img "close" [ref=f3e77] [cursor=pointer]
          - generic [ref=f3e88]:
            - link [ref=f3e94] [cursor=pointer]:
              - /url: /
            - generic [ref=f3e106]:
              - generic [ref=f3e107]:
                - generic [ref=f3e109]:
                  - generic [ref=f3e110]: Live Mode
                  - switch "Switch to Edit mode" [ref=f3e112] [cursor=pointer]
                - generic "Click to change view mode" [ref=f3e116] [cursor=pointer]:
                  - img "block" [ref=f3e117]
                  - generic [ref=f3e120]: Latest
              - generic [ref=f3e122]:
                - generic [ref=f3e123] [cursor=pointer]:
                  - text: Thabiso Maake
                  - img "down" [ref=f3e124]
                - img "user" [ref=f3e128]
      - main [ref=f3e131]:
        - generic [ref=f3e136]:
          - generic [ref=f3e137]:
            - generic [ref=f3e138]:
              - generic [ref=f3e140]:
                - heading [level=4] [ref=f3e142]:
                  - strong [ref=f3e143]: "Invite BEC members:"
                  - text: Tender REF2026-0924 - ECDEDEA Automated Tender run-mtikn55n - 90/10
                - generic [ref=f3e144]: Evaluation In Progress
              - generic [ref=f3e148]: Received from Tumisang Modula 9 days ago
            - generic [ref=f3e149]:
              - button [ref=f3e198] [cursor=pointer]:
                - img "menu" [ref=f3e200]
              - generic [ref=f3e203]: "Ref No: REF2026-0924"
              - generic [ref=f3e204]: "Created by: Maanda-awe Mamathuntsha 9 days ago"
          - generic [ref=f3e209]:
            - generic [ref=f3e211]:
              - button [ref=f3e212] [cursor=pointer]:
                - img "edit" [ref=f3e213]
              - paragraph [ref=f3e216] [cursor=pointer]: Shesha.SupplyChainManagement/tender-wf-invite-bec-members v13
              - generic [ref=f3e217]:
                - generic [ref=f3e218]: Live
                - img "close" [ref=f3e219] [cursor=pointer]
            - generic [ref=f3e233]:
              - generic [ref=f3e238]:
                - button "View In PDF" [ref=f3e240] [cursor=pointer]
                - button "Download Batch" [ref=f3e243] [cursor=pointer]
              - generic [ref=f3e248]:
                - tablist [ref=f3e249]:
                  - generic [ref=f3e251]:
                    - tab "Tender Details" [selected] [ref=f3e253] [cursor=pointer]
                    - tab "Publication" [ref=f3e255] [cursor=pointer]
                    - tab "Tender Documents" [ref=f3e257] [cursor=pointer]
                    - tab "Response Documents" [ref=f3e259] [cursor=pointer]
                    - tab "Technical Evaluation Criteria" [ref=f3e261] [cursor=pointer]
                    - tab "Responses" [ref=f3e263] [cursor=pointer]
                - tabpanel "Tender Details" [ref=f3e266]:
                  - generic [ref=f3e274]:
                    - generic [ref=f3e276]:
                      - generic "Tender Number" [ref=f3e278]
                      - generic [ref=f3e279]: REF2026-0924
                    - generic [ref=f3e283]:
                      - generic "Tender Name" [ref=f3e285]
                      - generic [ref=f3e286]: ECDEDEA Automated Tender run-mtikn55n - 90/10
                    - generic [ref=f3e290]:
                      - generic "Description" [ref=f3e292]
                      - generic [ref=f3e293]: Automated EC DEDEA tender-process chain created via Playwright.
                    - generic [ref=f3e297]:
                      - generic "Evaluation Criteria" [ref=f3e299]
                      - generic [ref=f3e300]: 90/10
                    - generic [ref=f3e304]:
                      - generic "Is On Procurement Plan" [ref=f3e306]
                      - generic [ref=f3e311]:
                        - generic:
                          - checkbox [disabled]
                    - generic "Procurement Plan" [ref=f3e315]
                    - generic [ref=f3e319]:
                      - generic "Supporting Documents" [ref=f3e321]
                      - generic [ref=f3e325]:
                        - generic [ref=f3e331] [cursor=pointer]:
                          - img "file-pdf" [ref=f3e332]
                          - generic "pdf-test.pdf (20.6 kB)" [ref=f3e336]: pdf-test.pdf
                        - button "file-zip Download Zip" [ref=f3e338] [cursor=pointer]:
                          - img "file-zip" [ref=f3e339]
                          - generic [ref=f3e342]: Download Zip
              - generic [ref=f3e349]:
                - generic [ref=f3e350]:
                  - img "right" [ref=f3e352] [cursor=pointer]
                  - generic [ref=f3e355]: Invite BEC Members
                - generic [ref=f3e359]:
                  - alert [ref=f3e360]:
                    - img "info-circle" [ref=f3e361]
                    - generic [ref=f3e364]: "Hint: Specify the BEC Meeting Details and Invite all the relevant attendees on the Bid Evaluation Comittee."
                    - button [ref=f3e367] [cursor=pointer]:
                      - img "close" [ref=f3e368]
                  - generic [ref=f3e372]:
                    - generic [ref=f3e376]:
                      - heading "Meeting Details" [level=5] [ref=f3e382]
                      - generic [ref=f3e384]:
                        - generic [ref=f3e386]:
                          - generic "Meeting date and time" [ref=f3e388]:
                            - text: Meeting date and time
                            - generic [ref=f3e389]: "*"
                          - generic [ref=f3e394]:
                            - textbox [ref=f3e395]
                            - generic:
                              - img "calendar"
                        - generic [ref=f3e397]:
                          - generic "Meeting Link" [ref=f3e399]:
                            - text: Meeting Link
                            - generic [ref=f3e400]: "*"
                          - textbox [ref=f3e405]: https://teams.microsoft.com/l/meetup-join/ecdedea-bec
                        - generic [ref=f3e407]:
                          - generic "Venue" [ref=f3e409]:
                            - text: Venue
                            - generic [ref=f3e410]: "*"
                          - textbox [ref=f3e415]: Boardroom B, Head Office
                    - heading "Attendees/Evaluators" [level=5] [ref=f3e423]
                    - table [ref=f3e433]:
                      - row [ref=f3e434]:
                        - columnheader "Name" [ref=f3e435] [cursor=pointer]:
                          - text: Name
                          - separator [ref=f3e436]
                        - columnheader "Job Title" [ref=f3e437] [cursor=pointer]:
                          - text: Job Title
                          - separator [ref=f3e438]
                        - columnheader "Email" [ref=f3e439] [cursor=pointer]:
                          - text: Email
                          - separator [ref=f3e440]
                        - columnheader [ref=f3e441]
                      - row [ref=f3e443]:
                        - columnheader "Cedrick Maake" [ref=f3e444]:
                          - generic [ref=f3e451]:
                            - combobox [ref=f3e453]
                            - generic "Cedrick Maake" [ref=f3e454]
                        - columnheader [ref=f3e459]:
                          - textbox [ref=f3e466]: System Administrator
                        - columnheader [ref=f3e467]:
                          - textbox [ref=f3e474]: maletshankepana@gmail.com
                        - columnheader [ref=f3e475]:
                          - generic [ref=f3e476]:
                            - button [ref=f3e477] [cursor=pointer]:
                              - img "plus-circle" [ref=f3e479]
                            - button [ref=f3e483] [cursor=pointer]:
                              - img "close-circle" [ref=f3e485]
                      - rowgroup [ref=f3e488]:
                        - row [ref=f3e489]:
                          - cell "Bonolo Botha" [ref=f3e490]
                          - cell "System Administrator" [ref=f3e491]
                          - cell "Nthabiseng.Magoma@boxfusion.io" [ref=f3e497]
                          - cell [ref=f3e498]:
                            - button [ref=f3e500] [cursor=pointer]:
                              - img "delete" [ref=f3e502]
                        - row [ref=f3e505]:
                          - cell "Cedrick Maake" [ref=f3e506]
                          - cell "System Administrator" [ref=f3e507]
                          - cell "maletshankepana@gmail.com" [ref=f3e513]
                          - cell [ref=f3e514]:
                            - button [ref=f3e516] [cursor=pointer]:
                              - img "delete" [ref=f3e518]
                        - row [ref=f3e521]:
                          - cell "Bokang Ngoetjane" [ref=f3e522]
                          - cell "System Administrator" [ref=f3e523]
                          - cell "bokangngoetjana06@gmail.com" [ref=f3e529]
                          - cell [ref=f3e530]:
                            - button [ref=f3e532] [cursor=pointer]:
                              - img "delete" [ref=f3e534]
                  - generic [ref=f3e538]:
                    - checkbox [ref=f3e546] [cursor=pointer]
                    - strong [ref=f3e554]: l confirm that l have invited all the relevant attendees to the Bid Evaluation Committee meeting and the meeting invite should be send to the invited attendees.
              - generic [ref=f3e561]:
                - link "Close" [ref=f3e563] [cursor=pointer]:
                  - /url: /dynamic/Shesha.Workflow/workflows-my-items
                - button "Send Back" [ref=f3e566] [cursor=pointer]
                - button "Submit" [disabled] [ref=f3e569]
  - alert [ref=f3e570]
  - generic [ref=f3e573]:
    - generic [ref=f3e575]:
      - generic [ref=f3e576]:
        - generic [ref=f3e577]:
          - button [ref=f3e578] [cursor=pointer]
          - button [ref=f3e580] [cursor=pointer]
          - generic [ref=f3e582]:
            - button "Sep" [ref=f3e583] [cursor=pointer]
            - button "2028" [ref=f3e584] [cursor=pointer]
          - button [active] [ref=f3e585] [cursor=pointer]
          - button [ref=f3e587] [cursor=pointer]
        - table [ref=f3e590]:
          - rowgroup [ref=f3e591]:
            - row [ref=f3e592]:
              - columnheader "Su" [ref=f3e593]
              - columnheader "Mo" [ref=f3e594]
              - columnheader "Tu" [ref=f3e595]
              - columnheader "We" [ref=f3e596]
              - columnheader "Th" [ref=f3e597]
              - columnheader "Fr" [ref=f3e598]
              - columnheader "Sa" [ref=f3e599]
          - rowgroup [ref=f3e600]:
            - row [ref=f3e601]:
              - cell "27" [ref=f3e602] [cursor=pointer]
              - cell "28" [ref=f3e604] [cursor=pointer]
              - cell "29" [ref=f3e606] [cursor=pointer]
              - cell "30" [ref=f3e608] [cursor=pointer]
              - cell "31" [ref=f3e610] [cursor=pointer]
              - cell "1" [ref=f3e612] [cursor=pointer]
              - cell "2" [ref=f3e614] [cursor=pointer]
            - row [ref=f3e616]:
              - cell "3" [ref=f3e617] [cursor=pointer]
              - cell "4" [ref=f3e619] [cursor=pointer]
              - cell "5" [ref=f3e621] [cursor=pointer]
              - cell "6" [ref=f3e623] [cursor=pointer]
              - cell "7" [ref=f3e625] [cursor=pointer]
              - cell "8" [ref=f3e627] [cursor=pointer]
              - cell "9" [ref=f3e629] [cursor=pointer]
            - row [ref=f3e631]:
              - cell "10" [ref=f3e632] [cursor=pointer]
              - cell "11" [ref=f3e634] [cursor=pointer]
              - cell "12" [ref=f3e636] [cursor=pointer]
              - cell "13" [ref=f3e638] [cursor=pointer]
              - cell "14" [ref=f3e640] [cursor=pointer]
              - cell "15" [ref=f3e642] [cursor=pointer]
              - cell "16" [ref=f3e644] [cursor=pointer]
            - row [ref=f3e646]:
              - cell "17" [ref=f3e647] [cursor=pointer]
              - cell "18" [ref=f3e649] [cursor=pointer]
              - cell "19" [ref=f3e651] [cursor=pointer]
              - cell "20" [ref=f3e653] [cursor=pointer]
              - cell "21" [ref=f3e655] [cursor=pointer]
              - cell "22" [ref=f3e657] [cursor=pointer]
              - cell "23" [ref=f3e659] [cursor=pointer]
            - row [ref=f3e661]:
              - cell "24" [ref=f3e662] [cursor=pointer]
              - cell "25" [ref=f3e664] [cursor=pointer]
              - cell "26" [ref=f3e666] [cursor=pointer]
              - cell "27" [ref=f3e668] [cursor=pointer]
              - cell "28" [ref=f3e670] [cursor=pointer]
              - cell "29" [ref=f3e672] [cursor=pointer]
              - cell "30" [ref=f3e674] [cursor=pointer]
            - row [ref=f3e676]:
              - cell "1" [ref=f3e677] [cursor=pointer]
              - cell "2" [ref=f3e679] [cursor=pointer]
              - cell "3" [ref=f3e681] [cursor=pointer]
              - cell "4" [ref=f3e683] [cursor=pointer]
              - cell "5" [ref=f3e685] [cursor=pointer]
              - cell "6" [ref=f3e687] [cursor=pointer]
              - cell "7" [ref=f3e689] [cursor=pointer]
      - generic [ref=f3e694]:
        - list [ref=f3e695]:
          - listitem [ref=f3e696]:
            - generic [ref=f3e697] [cursor=pointer]: "00"
          - listitem [ref=f3e698]:
            - generic [ref=f3e699] [cursor=pointer]: "01"
          - listitem [ref=f3e700]:
            - generic [ref=f3e701] [cursor=pointer]: "02"
          - listitem [ref=f3e702]:
            - generic [ref=f3e703] [cursor=pointer]: "03"
          - listitem [ref=f3e704]:
            - generic [ref=f3e705] [cursor=pointer]: "04"
          - listitem [ref=f3e706]:
            - generic [ref=f3e707] [cursor=pointer]: "05"
          - listitem [ref=f3e708]:
            - generic [ref=f3e709] [cursor=pointer]: "06"
          - listitem [ref=f3e710]:
            - generic [ref=f3e711] [cursor=pointer]: "07"
          - listitem [ref=f3e712]:
            - generic [ref=f3e713] [cursor=pointer]: "08"
          - listitem [ref=f3e714]:
            - generic [ref=f3e715] [cursor=pointer]: "09"
          - listitem [ref=f3e716]:
            - generic [ref=f3e717] [cursor=pointer]: "10"
          - listitem [ref=f3e718]:
            - generic [ref=f3e719] [cursor=pointer]: "11"
          - listitem [ref=f3e720]:
            - generic [ref=f3e721] [cursor=pointer]: "12"
          - listitem [ref=f3e722]:
            - generic [ref=f3e723] [cursor=pointer]: "13"
          - listitem [ref=f3e724]:
            - generic [ref=f3e725] [cursor=pointer]: "14"
          - listitem [ref=f3e726]:
            - generic [ref=f3e727] [cursor=pointer]: "15"
          - listitem [ref=f3e728]:
            - generic [ref=f3e729] [cursor=pointer]: "16"
          - listitem [ref=f3e730]:
            - generic [ref=f3e731] [cursor=pointer]: "17"
          - listitem [ref=f3e732]:
            - generic [ref=f3e733] [cursor=pointer]: "18"
          - listitem [ref=f3e734]:
            - generic [ref=f3e735] [cursor=pointer]: "19"
          - listitem [ref=f3e736]:
            - generic [ref=f3e737] [cursor=pointer]: "20"
          - listitem [ref=f3e738]:
            - generic [ref=f3e739] [cursor=pointer]: "21"
          - listitem [ref=f3e740]:
            - generic [ref=f3e741] [cursor=pointer]: "22"
          - listitem [ref=f3e742]:
            - generic [ref=f3e743] [cursor=pointer]: "23"
        - list [ref=f3e744]:
          - listitem [ref=f3e745]:
            - generic [ref=f3e746] [cursor=pointer]: "00"
          - listitem [ref=f3e747]:
            - generic [ref=f3e748] [cursor=pointer]: "01"
          - listitem [ref=f3e749]:
            - generic [ref=f3e750] [cursor=pointer]: "02"
          - listitem [ref=f3e751]:
            - generic [ref=f3e752] [cursor=pointer]: "03"
          - listitem [ref=f3e753]:
            - generic [ref=f3e754] [cursor=pointer]: "04"
          - listitem [ref=f3e755]:
            - generic [ref=f3e756] [cursor=pointer]: "05"
          - listitem [ref=f3e757]:
            - generic [ref=f3e758] [cursor=pointer]: "06"
          - listitem [ref=f3e759]:
            - generic [ref=f3e760] [cursor=pointer]: "07"
          - listitem [ref=f3e761]:
            - generic [ref=f3e762] [cursor=pointer]: "08"
          - listitem [ref=f3e763]:
            - generic [ref=f3e764] [cursor=pointer]: "09"
          - listitem [ref=f3e765]:
            - generic [ref=f3e766] [cursor=pointer]: "10"
          - listitem [ref=f3e767]:
            - generic [ref=f3e768] [cursor=pointer]: "11"
          - listitem [ref=f3e769]:
            - generic [ref=f3e770] [cursor=pointer]: "12"
          - listitem [ref=f3e771]:
            - generic [ref=f3e772] [cursor=pointer]: "13"
          - listitem [ref=f3e773]:
            - generic [ref=f3e774] [cursor=pointer]: "14"
          - listitem [ref=f3e775]:
            - generic [ref=f3e776] [cursor=pointer]: "15"
          - listitem [ref=f3e777]:
            - generic [ref=f3e778] [cursor=pointer]: "16"
          - listitem [ref=f3e779]:
            - generic [ref=f3e780] [cursor=pointer]: "17"
          - listitem [ref=f3e781]:
            - generic [ref=f3e782] [cursor=pointer]: "18"
          - listitem [ref=f3e783]:
            - generic [ref=f3e784] [cursor=pointer]: "19"
          - listitem [ref=f3e785]:
            - generic [ref=f3e786] [cursor=pointer]: "20"
          - listitem [ref=f3e787]:
            - generic [ref=f3e788] [cursor=pointer]: "21"
          - listitem [ref=f3e789]:
            - generic [ref=f3e790] [cursor=pointer]: "22"
          - listitem [ref=f3e791]:
            - generic [ref=f3e792] [cursor=pointer]: "23"
          - listitem [ref=f3e793]:
            - generic [ref=f3e794] [cursor=pointer]: "24"
          - listitem [ref=f3e795]:
            - generic [ref=f3e796] [cursor=pointer]: "25"
          - listitem [ref=f3e797]:
            - generic [ref=f3e798] [cursor=pointer]: "26"
          - listitem [ref=f3e799]:
            - generic [ref=f3e800] [cursor=pointer]: "27"
          - listitem [ref=f3e801]:
            - generic [ref=f3e802] [cursor=pointer]: "28"
          - listitem [ref=f3e803]:
            - generic [ref=f3e804] [cursor=pointer]: "29"
          - listitem [ref=f3e805]:
            - generic [ref=f3e806] [cursor=pointer]: "30"
          - listitem [ref=f3e807]:
            - generic [ref=f3e808] [cursor=pointer]: "31"
          - listitem [ref=f3e809]:
            - generic [ref=f3e810] [cursor=pointer]: "32"
          - listitem [ref=f3e811]:
            - generic [ref=f3e812] [cursor=pointer]: "33"
          - listitem [ref=f3e813]:
            - generic [ref=f3e814] [cursor=pointer]: "34"
          - listitem [ref=f3e815]:
            - generic [ref=f3e816] [cursor=pointer]: "35"
          - listitem [ref=f3e817]:
            - generic [ref=f3e818] [cursor=pointer]: "36"
          - listitem [ref=f3e819]:
            - generic [ref=f3e820] [cursor=pointer]: "37"
          - listitem [ref=f3e821]:
            - generic [ref=f3e822] [cursor=pointer]: "38"
          - listitem [ref=f3e823]:
            - generic [ref=f3e824] [cursor=pointer]: "39"
          - listitem [ref=f3e825]:
            - generic [ref=f3e826] [cursor=pointer]: "40"
          - listitem [ref=f3e827]:
            - generic [ref=f3e828] [cursor=pointer]: "41"
          - listitem [ref=f3e829]:
            - generic [ref=f3e830] [cursor=pointer]: "42"
          - listitem [ref=f3e831]:
            - generic [ref=f3e832] [cursor=pointer]: "43"
          - listitem [ref=f3e833]:
            - generic [ref=f3e834] [cursor=pointer]: "44"
          - listitem [ref=f3e835]:
            - generic [ref=f3e836] [cursor=pointer]: "45"
          - listitem [ref=f3e837]:
            - generic [ref=f3e838] [cursor=pointer]: "46"
          - listitem [ref=f3e839]:
            - generic [ref=f3e840] [cursor=pointer]: "47"
          - listitem [ref=f3e841]:
            - generic [ref=f3e842] [cursor=pointer]: "48"
          - listitem [ref=f3e843]:
            - generic [ref=f3e844] [cursor=pointer]: "49"
          - listitem [ref=f3e845]:
            - generic [ref=f3e846] [cursor=pointer]: "50"
          - listitem [ref=f3e847]:
            - generic [ref=f3e848] [cursor=pointer]: "51"
          - listitem [ref=f3e849]:
            - generic [ref=f3e850] [cursor=pointer]: "52"
          - listitem [ref=f3e851]:
            - generic [ref=f3e852] [cursor=pointer]: "53"
          - listitem [ref=f3e853]:
            - generic [ref=f3e854] [cursor=pointer]: "54"
          - listitem [ref=f3e855]:
            - generic [ref=f3e856] [cursor=pointer]: "55"
          - listitem [ref=f3e857]:
            - generic [ref=f3e858] [cursor=pointer]: "56"
          - listitem [ref=f3e859]:
            - generic [ref=f3e860] [cursor=pointer]: "57"
          - listitem [ref=f3e861]:
            - generic [ref=f3e862] [cursor=pointer]: "58"
          - listitem [ref=f3e863]:
            - generic [ref=f3e864] [cursor=pointer]: "59"
    - list [ref=f3e866]:
      - listitem [ref=f3e867]:
        - button "OK" [disabled] [ref=f3e868]
```

# Test source

```ts
  20  | //   c. Rows are `[role="row"]` divs, not <tr> — `page.getByRole('row')` works, `locator('tr')` does not.
  21  | //   d. Grid tables REORDER after edits/uploads, so every row is targeted by its text, never by index.
  22  | //   e. Compliance-dialog inputs must be clicked ONE AT A TIME as real user actions. Batch/native
  23  | //      clicks leave the DOM checked but the form model stale → "A comment is required when the
  24  | //      document is not marked as compliant" on Finalise, and the dialog then wedges (cancel and
  25  | //      reopen to recover). Playwright's .check() is fine; that is what this spec uses.
  26  | //   f. Inline row saves are async — the save icon becomes .anticon-loading. Wait for the row's
  27  | //      editor to disappear before touching the next row.
  28  | //   g. The sidebar accordion flyout collapses under automation, so pages are reached by URL.
  29  | //   h. Supporting documents is OPTIONAL on this build (no asterisk) — it does not gate Next.
  30  | //   i. Toolbar buttons DO respond to ordinary clicks here (unlike PD); domClick is kept only as a
  31  | //      defensive wrapper for the evaluation dialog.
  32  | 
  33  | import { test, expect, Page, Locator } from '@playwright/test';
  34  | import * as path from 'path';
  35  | 
  36  | const APP_URL = 'https://ecdedea-smartgov2-adminportal-qa.shesha.app/login';
  37  | const BASE = APP_URL.replace('/login', '');
  38  | 
  39  | const ADMIN = { user: 'Maanda-awe', password: '123qwe' };      // TC-01 tender initiation
  40  | const REVIEWER = { user: 'MhlotiM', password: '123qwe' };      // TC-02 review & approve
  41  | const PUBLISHER = { user: 'TumisangM', password: '123qwe' };   // TC-03..06, TC-15, TC-16
  42  | const BEC_CHAIR = { user: 'ThabisoM', password: '123qwe' };    // TC-07, 08, 10, 11, 12
  43  | const BAC = { user: 'MoshadiM', password: '123qwe' };          // TC-13
  44  | const APPROVER = { user: 'ThulileM', password: '123qwe' };     // TC-14
  45  | 
  46  | // EC DEDEA BEC evaluators. Distinct scores so A & A Stationers wins on functionality
  47  | // (averages: A & A 90, Telkom 74.33, BOXFUSION 60 — all above the TEC-01 minimum of 60).
  48  | // `search` is what to type into the Invite-BEC Name combobox; `fullName` is the row text the grid
  49  | // renders once the option is selected (both captured live 2026-07-27).
  50  | const EVALUATORS = [
  51  |   { user: 'Cedrick', search: 'Cedrick', fullName: 'Cedrick Maake', scores: { 'A & A Stationers': '90', 'Telkom': '75', 'BOXFUSION': '60' } },
  52  |   { user: 'BokangN', search: 'Bokang', fullName: 'Bokang Ngoetjane', scores: { 'A & A Stationers': '88', 'Telkom': '78', 'BOXFUSION': '65' } },
  53  |   { user: 'BonoloB', search: 'Bonolo', fullName: 'Bonolo Botha', scores: { 'A & A Stationers': '92', 'Telkom': '70', 'BOXFUSION': '55' } },
  54  | ];
  55  | 
  56  | // Suppliers, proposal prices and specific-goal points. A & A is cheapest AND scores highest,
  57  | // so it ranks 1 under both 90/10 and 80/20.
  58  | const SUPPLIERS = [
  59  |   { name: 'A & A Stationers', method: 'Email', price: '100000', goalPoints: '10' },
  60  |   { name: 'Telkom', method: 'Email', price: '120000', goalPoints: '8' },
  61  |   { name: 'BOXFUSION', method: 'Physical', price: '150000', goalPoints: '6' },
  62  | ];
  63  | const WINNER = 'A & A Stationers';
  64  | 
  65  | const EVALUATE_TENDERS_URL = `${BASE}/dynamic/Shesha.SupplyChainManagement/tenders-to-evaluate`;
  66  | const INBOX_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-inbox`;
  67  | const MY_ITEMS_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-my-items`;
  68  | 
  69  | // Shared attachment from the hub-root test-data/ folder (5 levels up from this spec).
  70  | const PDF_FIXTURE = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');
  71  | 
  72  | // EC DEDEA's Consolidate-Responses dialog requires these two documents per supplier.
  73  | const MANDATORY_RESPONSE_DOCS = ['RFQ Document', 'TAX Clearance Cert'];
  74  | 
  75  | // Strict single-tender chain: TC-01 stamps a unique tag on the tender it creates and records the
  76  | // app-assigned Ref No. Every downstream TC targets THAT tender, so a broken chain can't be masked
  77  | // by a leftover item passing in its place. Seed RUN_REF to run a downstream TC standalone.
  78  | const RUN_TAG = `run-${Date.now().toString(36)}`;
  79  | let RUN_TENDER = '';
  80  | let RUN_REF = process.env.RUN_REF || '';
  81  | function tenderMatch(): string { return RUN_REF || RUN_TENDER || 'ECDEDEA Automated Tender'; }
  82  | 
  83  | // Price/goal-points weighting. Default 90/10; override with EVAL_CRITERIA=80/20.
  84  | const EVAL_CRITERIA = process.env.EVAL_CRITERIA || '90/10';
  85  | 
  86  | // ───────────────────────── helpers (recorded live) ─────────────────────────
  87  | 
  88  | // The header view-mode selector toggles Live / Ready / Latest. Config-editing users must be on
  89  | // "Latest" or the workflow forms render stale fields. Plain evaluators sometimes have no toggle,
  90  | // so this is best-effort: it no-ops when the control is absent.
  91  | async function switchToLatest(page: Page) {
  92  |   const selector = page.getByTitle('Click to change view mode');
  93  |   if (!(await selector.isVisible({ timeout: 20000 }).catch(() => false))) return;
  94  |   if ((await selector.innerText().catch(() => '')).includes('Latest')) return;
  95  |   await expect(async () => {
  96  |     await selector.click();
  97  |     await page.getByRole('menuitem', { name: /^Latest/ }).click({ timeout: 5000 });
  98  |     await expect(selector).toContainText('Latest', { timeout: 5000 });
  99  |   }).toPass({ timeout: 30000 });
  100 |   await page.waitForLoadState('networkidle');
  101 | }
  102 | 
  103 | // "(press to upload)" opens a native file chooser; driving the chooser is more reliable than
  104 | // setInputFiles on the hidden AntD input, which intermittently fails to register.
  105 | async function uploadFile(page: Page, trigger: Locator, file: string) {
  106 |   const chooserPromise = page.waitForEvent('filechooser');
  107 |   await trigger.click();
  108 |   (await chooserPromise).setFiles(file);
  109 | }
  110 | 
  111 | // AntD DatePicker with showTime: .fill() does not commit to React state (a later re-render wipes
  112 | // it), so drive the panel — month → day cell → hour → OK.
  113 | async function pickAntDateTime(page: Page, field: Locator, dateTitle: string, hour: string) {
  114 |   await field.click();
  115 |   const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
  116 |   const cell = dropdown.locator(`td[title="${dateTitle}"]`);
  117 |   for (let i = 0; i < 24 && !(await cell.isVisible().catch(() => false)); i++) {
  118 |     await dropdown.locator('.ant-picker-header-next-btn').first().click();
  119 |   }
> 120 |   await cell.click();
      |              ^ Error: locator.click: Test timeout of 180000ms exceeded.
  121 |   await dropdown.locator('.ant-picker-time-panel-column').first()
  122 |     .locator('.ant-picker-time-panel-cell-inner')
  123 |     .filter({ hasText: new RegExp(`^${hour}$`) }).first().click();
  124 |   await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-ok button').click();
  125 | }
  126 | 
  127 | // AntD form: each field is its own .ant-form-item holding a single input. Recorded live: matching
  128 | // on form-item TEXT is ambiguous on this build ("Minimum score required" appears on two items and
  129 | // "Email" is a substring of "Email Address"), so match the <label> instead — but anchored rather
  130 | // than exact, because required labels render as "<Label>\n*" and some carry a trailing colon
  131 | // (TC-16's field is literally "Purchase Order No:", which an exact match misses).
  132 | function formItem(page: Page, label: string) {
  133 |   const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  134 |   return page.locator('.ant-form-item')
  135 |     .filter({ has: page.locator('label').filter({ hasText: new RegExp(`^${escaped}\\s*:?\\s*\\*?\\s*$`) }) })
  136 |     .last();
  137 | }
  138 | 
  139 | // Recorded live: only the visible dropdown may be matched — AntD keeps previous dropdowns mounted
  140 | // with .ant-select-dropdown-hidden, and an unscoped .ant-select-item-option can hit a stale one.
  141 | function openOption(page: Page, text: string) {
  142 |   return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
  143 |     .filter({ hasText: text }).first();
  144 | }
  145 | 
  146 | // Recorded live: grid icon buttons carry no accessible name on this build — target the icon class.
  147 | function iconButton(scope: Locator, icon: 'edit' | 'save' | 'plus-circle') {
  148 |   return scope.locator(`button:has(.anticon-${icon})`);
  149 | }
  150 | 
  151 | // Shesha toolbar buttons (Evaluate, row edit/save pencils, Finalise Score, Sign In) do NOT respond
  152 | // to Playwright's positional click — fire the handler with a DOM click.
  153 | async function domClick(locator: Locator) {
  154 |   await expect(locator.first()).toBeVisible({ timeout: 15000 });
  155 |   await locator.first().evaluate((el: HTMLElement) => el.click());
  156 | }
  157 | 
  158 | async function loginAs(page: Page, creds: { user: string; password: string }) {
  159 |   await page.goto(APP_URL).catch(() => {});
  160 |   await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  161 |   await page.goto(APP_URL);
  162 |   // The login form remembers the previous user — clear before typing.
  163 |   await page.getByPlaceholder('Username').fill('');
  164 |   await page.getByPlaceholder('Username').fill(creds.user);
  165 |   await page.getByPlaceholder('Password').fill(creds.password);
  166 |   await domClick(page.getByRole('button', { name: 'Sign In' }));
  167 |   await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  168 |   await page.waitForLoadState('networkidle');
  169 |   await switchToLatest(page);
  170 | }
  171 | 
  172 | async function openInbox(page: Page) {
  173 |   await page.goto(INBOX_URL);
  174 |   await page.waitForLoadState('networkidle');
  175 | }
  176 | 
  177 | // Open the target tender's workflow action from the Inbox. Matching on the Ref No pins the row to
  178 | // THIS run's tender; the action text pins it to the expected stage. Navigating to the row's href
  179 | // (rather than clicking) avoids the Workflows flyout intercepting the click.
  180 | async function openInboxItem(page: Page, actionText: string | RegExp) {
  181 |   const targetRow = page.getByRole('row')
  182 |     .filter({ hasText: tenderMatch() })
  183 |     .filter({ hasText: actionText })
  184 |     .first();
  185 |   await expect(targetRow).toBeVisible({ timeout: 30000 });
  186 |   const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  187 |   await page.goto(rowHref!.startsWith('http') ? rowHref! : `${BASE}${rowHref}`);
  188 |   await page.waitForURL(/workflow-action/, { timeout: 30000 });
  189 | }
  190 | 
  191 | // The QA app's dynamic pages load slowly and variably.
  192 | async function expectOnPage(page: Page, pageName: string) {
  193 |   await expect(page.getByText(pageName, { exact: false }).first()).toBeVisible({ timeout: 30000 });
  194 | }
  195 | 
  196 | // Tick the checkbox inside the innermost block that carries the given confirmation text. The app's
  197 | // confirmation checkboxes have no accessible name (and the copy contains typos), so match a safe
  198 | // substring of the surrounding text.
  199 | async function checkConfirmation(page: Page, text: string | RegExp) {
  200 |   await page.locator('div')
  201 |     .filter({ hasText: text })
  202 |     .filter({ has: page.getByRole('checkbox') })
  203 |     .last()
  204 |     .getByRole('checkbox')
  205 |     .check();
  206 | }
  207 | 
  208 | // Click a workflow action ONCE, then wait for the page to advance — never re-click. Re-clicking on
  209 | // this slow app fires the server-side action repeatedly (on PD that created duplicate evaluation
  210 | // rows). A real user clicks once; if the click is genuinely swallowed this fails loudly instead of
  211 | // silently corrupting data.
  212 | async function clickOnceAndAwait(action: Locator, hasAdvanced: () => Promise<boolean>, label: string) {
  213 |   await action.click();
  214 |   await expect(async () => {
  215 |     if (await hasAdvanced()) return;
  216 |     throw new Error(`still on ${label} after a single click`);
  217 |   }).toPass({ timeout: 90000 });
  218 | }
  219 | 
  220 | // Capture one manual supplier response. The document table REORDERS after each upload, so
```