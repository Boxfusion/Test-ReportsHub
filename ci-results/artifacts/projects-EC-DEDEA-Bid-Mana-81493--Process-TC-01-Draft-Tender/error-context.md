# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts >> ECDEDEA-TP — EC DEDEA Bid Management (Tender Process) >> TC-01: Draft Tender
- Location: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts:363:7

# Error details

```
Test timeout of 240000ms exceeded.
```

```
Error: locator.click: Test timeout of 240000ms exceeded.
Call log:
  - waiting for locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last().locator('td[title="2026-08-03"]')

```

# Page snapshot

```yaml
- generic [ref=f2e1]:
  - generic [ref=f2e4]:
    - complementary [ref=f2e5]:
      - menu [ref=f2e9]:
        - menuitem "appstore EPM" [ref=f2e10] [cursor=pointer]:
          - img "appstore" [ref=f2e11]
          - generic [ref=f2e14]: EPM
        - menuitem "apartment Workflows" [ref=f2e15] [cursor=pointer]:
          - img "apartment" [ref=f2e16]
          - generic [ref=f2e19]: Workflows
        - menuitem "snippets Leave Gratuity" [ref=f2e20] [cursor=pointer]:
          - img "snippets" [ref=f2e21]
          - generic [ref=f2e24]: Leave Gratuity
        - menuitem "database Sundry Payments" [ref=f2e25] [cursor=pointer]:
          - img "database" [ref=f2e26]
          - generic [ref=f2e29]: Sundry Payments
        - menuitem "pic-center Bid Management" [ref=f2e30] [cursor=pointer]:
          - img "pic-center" [ref=f2e31]
          - generic [ref=f2e34]: Bid Management
        - menuitem "menu-unfold SupplyChain Management" [ref=f2e35] [cursor=pointer]:
          - img "menu-unfold" [ref=f2e36]
          - generic [ref=f2e39]: SupplyChain Management
        - menuitem "area-chart Reports and Dashboards" [ref=f2e40] [cursor=pointer]:
          - img "area-chart" [ref=f2e41]
          - generic [ref=f2e44]: Reports and Dashboards
        - menuitem "tool Administration" [ref=f2e45] [cursor=pointer]:
          - img "tool" [ref=f2e46]
          - generic [ref=f2e49]: Administration
        - menuitem "setting Configurations" [ref=f2e50] [cursor=pointer]:
          - img "setting" [ref=f2e51]
          - generic [ref=f2e54]: Configurations
      - img "menu-unfold" [ref=f2e57] [cursor=pointer]
    - generic [ref=f2e60]:
      - banner [ref=f2e61]:
        - generic [ref=f2e67]:
          - generic [ref=f2e69]:
            - button [ref=f2e70] [cursor=pointer]:
              - img "edit" [ref=f2e71]
            - paragraph [ref=f2e74] [cursor=pointer]: Shesha/header v4
            - generic [ref=f2e75]:
              - generic [ref=f2e76]: Live
              - img "close" [ref=f2e77] [cursor=pointer]
          - generic [ref=f2e88]:
            - link [ref=f2e94] [cursor=pointer]:
              - /url: /
            - generic [ref=f2e106]:
              - generic [ref=f2e107]:
                - generic [ref=f2e109]:
                  - generic [ref=f2e110]: Live Mode
                  - switch "Switch to Edit mode" [ref=f2e112] [cursor=pointer]
                - generic "Click to change view mode" [ref=f2e116] [cursor=pointer]:
                  - img "block" [ref=f2e117]
                  - generic [ref=f2e120]: Latest
              - generic [ref=f2e122]:
                - generic [ref=f2e123] [cursor=pointer]:
                  - text: Maanda-awe Mamathuntsha
                  - img "down" [ref=f2e124]
                - img "user" [ref=f2e128]
      - main [ref=f2e131]:
        - generic [ref=f2e136]:
          - generic [ref=f2e137]:
            - generic [ref=f2e140]:
              - heading [level=4] [ref=f2e142]:
                - strong [ref=f2e143]: "Capture Tender Details:"
              - generic [ref=f2e144]: Draft
            - generic [ref=f2e148]:
              - generic [ref=f2e149]: "Ref No: REF2026-2018"
              - generic [ref=f2e150]: "Created by: Maanda-awe Mamathuntsha in 2 hours"
          - generic [ref=f2e155]:
            - generic [ref=f2e157]:
              - button [ref=f2e158] [cursor=pointer]:
                - img "edit" [ref=f2e159]
              - paragraph [ref=f2e162] [cursor=pointer]: Shesha.SupplyChainManagement/capture-tender-details v16
              - generic [ref=f2e163]:
                - generic [ref=f2e164]: Live
                - img "close" [ref=f2e165] [cursor=pointer]
            - generic [ref=f2e178]:
              - generic [ref=f2e179]:
                - generic [ref=f2e180]:
                  - generic [ref=f2e182]:
                    - generic [ref=f2e183]: "1"
                    - generic [ref=f2e184]: Tender Details
                  - generic [ref=f2e187]:
                    - generic [ref=f2e188]: "2"
                    - generic [ref=f2e189]: Tender Documents
                  - generic [ref=f2e192]:
                    - generic [ref=f2e193]: "3"
                    - generic [ref=f2e194]: Response Documents
                  - generic [ref=f2e197]:
                    - generic [ref=f2e198]: "4"
                    - generic [ref=f2e199]: Technical Evaluation
                  - generic [ref=f2e202]:
                    - generic [ref=f2e203]: "5"
                    - generic [ref=f2e204]: Summary
                - generic [ref=f2e209]:
                  - generic [ref=f2e214]:
                    - generic [ref=f2e215]:
                      - img "right" [ref=f2e217] [cursor=pointer]
                      - generic [ref=f2e220]: Tender Information
                    - generic [ref=f2e228]:
                      - generic [ref=f2e230]:
                        - generic "Tender Number" [ref=f2e232]:
                          - text: Tender Number
                          - generic [ref=f2e233]: "*"
                        - generic [ref=f2e234]: REF2026-2018
                      - generic [ref=f2e238]:
                        - generic "Tender Name" [ref=f2e240]:
                          - text: Tender Name
                          - generic [ref=f2e241]: "*"
                        - textbox [ref=f2e246]: ECDEDEA Automated Tender run-mtvjx7fs - 90/10
                      - generic [ref=f2e248]:
                        - generic "Description" [ref=f2e250]:
                          - text: Description
                          - generic [ref=f2e251]: "*"
                        - textbox [ref=f2e255]: Automated EC DEDEA tender-process chain created via Playwright.
                      - generic [ref=f2e257]:
                        - generic "Evaluation Criteria" [ref=f2e259]
                        - generic [ref=f2e264]:
                          - generic [ref=f2e266] [cursor=pointer]:
                            - radio "90/10" [checked] [ref=f2e268]
                            - generic [ref=f2e270]: 90/10
                          - generic [ref=f2e272] [cursor=pointer]:
                            - radio "80/20" [ref=f2e274]
                            - generic [ref=f2e276]: 80/20
                      - generic [ref=f2e278]:
                        - generic "Is On Procurement Plan" [ref=f2e280]
                        - checkbox [ref=f2e286] [cursor=pointer]
                      - generic [ref=f2e289]:
                        - generic "Procurement plan" [ref=f2e291]
                        - button "upload (press to upload)" [ref=f2e299] [cursor=pointer]:
                          - img "upload" [ref=f2e301]
                          - generic [ref=f2e304]: (press to upload)
                  - generic [ref=f2e311]:
                    - generic [ref=f2e312]:
                      - img "right" [ref=f2e314] [cursor=pointer]
                      - generic [ref=f2e317]: Tender Publication
                    - generic [ref=f2e322]:
                      - generic [ref=f2e325]:
                        - heading "Briefing Session" [level=5] [ref=f2e331]
                        - generic [ref=f2e333]:
                          - generic [ref=f2e335]:
                            - generic "Briefing Session Requirement" [ref=f2e337]
                            - generic [ref=f2e342]:
                              - generic [ref=f2e344] [cursor=pointer]:
                                - radio "Not Required" [ref=f2e346]
                                - generic [ref=f2e348]: Not Required
                              - generic [ref=f2e350] [cursor=pointer]:
                                - radio "Compulsory" [checked] [ref=f2e352]
                                - generic [ref=f2e354]: Compulsory
                              - generic [ref=f2e356] [cursor=pointer]:
                                - radio "Non Compulsory" [ref=f2e358]
                                - generic [ref=f2e360]: Non Compulsory
                          - generic [ref=f2e362]:
                            - generic "Briefing Session Start Time" [ref=f2e364]:
                              - text: Briefing Session Start Time
                              - generic [ref=f2e365]: "*"
                            - generic [ref=f2e370]:
                              - textbox [ref=f2e371]
                              - generic:
                                - img "calendar"
                          - generic [ref=f2e373]:
                            - generic "Briefing Method" [ref=f2e375]:
                              - text: Briefing Method
                              - generic [ref=f2e376]: "*"
                            - generic [ref=f2e381]:
                              - generic [ref=f2e383] [cursor=pointer]:
                                - radio "Online" [ref=f2e385]
                                - generic [ref=f2e387]: Online
                              - generic [ref=f2e389] [cursor=pointer]:
                                - radio "Physical" [ref=f2e391]
                                - generic [ref=f2e393]: Physical
                              - generic [ref=f2e395] [cursor=pointer]:
                                - radio "Hybrid" [checked] [ref=f2e397]
                                - generic [ref=f2e399]: Hybrid
                          - generic [ref=f2e401]:
                            - generic "Meeting link" [ref=f2e403]:
                              - text: Meeting link
                              - generic [ref=f2e404]: "*"
                            - textbox [ref=f2e409]: https://teams.microsoft.com/l/meetup-join/ecdedea-automated
                          - generic [ref=f2e411]:
                            - generic "Briefing Session Venue" [ref=f2e413]:
                              - text: Briefing Session Venue
                              - generic [ref=f2e414]: "*"
                            - textbox [ref=f2e419]: Boardroom A, Head Office
                      - generic [ref=f2e422]:
                        - heading "Publication Dates" [level=5] [ref=f2e428]
                        - generic [ref=f2e430]:
                          - generic [ref=f2e432]:
                            - generic "Bid publication Date" [ref=f2e434]:
                              - text: Bid publication Date
                              - generic [ref=f2e435]: "*"
                            - generic [ref=f2e440]:
                              - textbox [ref=f2e441]
                              - generic:
                                - img "calendar"
                          - generic [ref=f2e443]:
                            - generic "Bid closing Date" [ref=f2e445]:
                              - text: Bid closing Date
                              - generic [ref=f2e446]: "*"
                            - generic [ref=f2e451]:
                              - textbox [ref=f2e452]
                              - generic:
                                - img "calendar"
                      - generic [ref=f2e455]:
                        - heading "Contact Details" [level=5] [ref=f2e461]
                        - generic [ref=f2e463]:
                          - generic [ref=f2e465]:
                            - generic "Contact person name" [ref=f2e467]:
                              - text: Contact person name
                              - generic [ref=f2e468]: "*"
                            - textbox [ref=f2e473]: Maanda Mamathuntsha
                          - generic [ref=f2e475]:
                            - generic "Telephone" [ref=f2e477]:
                              - text: Telephone
                              - generic [ref=f2e478]: "*"
                            - textbox [ref=f2e483]: "0818400598"
                          - generic [ref=f2e485]:
                            - generic "Email" [ref=f2e487]:
                              - text: Email
                              - generic [ref=f2e488]: "*"
                            - textbox [ref=f2e493]: ecdedea.test@example.com
                  - generic [ref=f2e498]:
                    - generic [ref=f2e499]:
                      - img "right" [ref=f2e501] [cursor=pointer]
                      - generic [ref=f2e504]: Supporting Documents
                    - generic [ref=f2e508]:
                      - alert [ref=f2e509]:
                        - img "info-circle" [ref=f2e510]
                        - generic [ref=f2e513]: Attach all documents demonstrating that all necessary processes were followed and approvals granted.
                        - button [ref=f2e516] [cursor=pointer]:
                          - img "close" [ref=f2e517]
                      - generic [ref=f2e523]:
                        - generic "Supporting documents" [ref=f2e525]
                        - button "upload (press to upload)" [ref=f2e533] [cursor=pointer]:
                          - img "upload" [ref=f2e535]
                          - generic [ref=f2e538]: (press to upload)
              - generic [ref=f2e540]:
                - button "Close" [ref=f2e541] [cursor=pointer]
                - button "Next" [disabled] [ref=f2e543]
  - alert [ref=f2e544]
  - generic [ref=f2e547]:
    - generic [ref=f2e549]:
      - generic [ref=f2e550]:
        - generic [ref=f2e551]:
          - button [ref=f2e552] [cursor=pointer]
          - button [ref=f2e554] [cursor=pointer]
          - generic [ref=f2e556]:
            - button "Sep" [ref=f2e557] [cursor=pointer]
            - button "2028" [ref=f2e558] [cursor=pointer]
          - button [active] [ref=f2e559] [cursor=pointer]
          - button [ref=f2e561] [cursor=pointer]
        - table [ref=f2e564]:
          - rowgroup [ref=f2e565]:
            - row [ref=f2e566]:
              - columnheader "Su" [ref=f2e567]
              - columnheader "Mo" [ref=f2e568]
              - columnheader "Tu" [ref=f2e569]
              - columnheader "We" [ref=f2e570]
              - columnheader "Th" [ref=f2e571]
              - columnheader "Fr" [ref=f2e572]
              - columnheader "Sa" [ref=f2e573]
          - rowgroup [ref=f2e574]:
            - row [ref=f2e575]:
              - cell "27" [ref=f2e576] [cursor=pointer]
              - cell "28" [ref=f2e578] [cursor=pointer]
              - cell "29" [ref=f2e580] [cursor=pointer]
              - cell "30" [ref=f2e582] [cursor=pointer]
              - cell "31" [ref=f2e584] [cursor=pointer]
              - cell "1" [ref=f2e586] [cursor=pointer]
              - cell "2" [ref=f2e588] [cursor=pointer]
            - row [ref=f2e590]:
              - cell "3" [ref=f2e591] [cursor=pointer]
              - cell "4" [ref=f2e593] [cursor=pointer]
              - cell "5" [ref=f2e595] [cursor=pointer]
              - cell "6" [ref=f2e597] [cursor=pointer]
              - cell "7" [ref=f2e599] [cursor=pointer]
              - cell "8" [ref=f2e601] [cursor=pointer]
              - cell "9" [ref=f2e603] [cursor=pointer]
            - row [ref=f2e605]:
              - cell "10" [ref=f2e606] [cursor=pointer]
              - cell "11" [ref=f2e608] [cursor=pointer]
              - cell "12" [ref=f2e610] [cursor=pointer]
              - cell "13" [ref=f2e612] [cursor=pointer]
              - cell "14" [ref=f2e614] [cursor=pointer]
              - cell "15" [ref=f2e616] [cursor=pointer]
              - cell "16" [ref=f2e618] [cursor=pointer]
            - row [ref=f2e620]:
              - cell "17" [ref=f2e621] [cursor=pointer]
              - cell "18" [ref=f2e623] [cursor=pointer]
              - cell "19" [ref=f2e625] [cursor=pointer]
              - cell "20" [ref=f2e627] [cursor=pointer]
              - cell "21" [ref=f2e629] [cursor=pointer]
              - cell "22" [ref=f2e631] [cursor=pointer]
              - cell "23" [ref=f2e633] [cursor=pointer]
            - row [ref=f2e635]:
              - cell "24" [ref=f2e636] [cursor=pointer]
              - cell "25" [ref=f2e638] [cursor=pointer]
              - cell "26" [ref=f2e640] [cursor=pointer]
              - cell "27" [ref=f2e642] [cursor=pointer]
              - cell "28" [ref=f2e644] [cursor=pointer]
              - cell "29" [ref=f2e646] [cursor=pointer]
              - cell "30" [ref=f2e648] [cursor=pointer]
            - row [ref=f2e650]:
              - cell "1" [ref=f2e651] [cursor=pointer]
              - cell "2" [ref=f2e653] [cursor=pointer]
              - cell "3" [ref=f2e655] [cursor=pointer]
              - cell "4" [ref=f2e657] [cursor=pointer]
              - cell "5" [ref=f2e659] [cursor=pointer]
              - cell "6" [ref=f2e661] [cursor=pointer]
              - cell "7" [ref=f2e663] [cursor=pointer]
      - generic [ref=f2e668]:
        - list [ref=f2e669]:
          - listitem [ref=f2e670]:
            - generic [ref=f2e671] [cursor=pointer]: "00"
          - listitem [ref=f2e672]:
            - generic [ref=f2e673] [cursor=pointer]: "01"
          - listitem [ref=f2e674]:
            - generic [ref=f2e675] [cursor=pointer]: "02"
          - listitem [ref=f2e676]:
            - generic [ref=f2e677] [cursor=pointer]: "03"
          - listitem [ref=f2e678]:
            - generic [ref=f2e679] [cursor=pointer]: "04"
          - listitem [ref=f2e680]:
            - generic [ref=f2e681] [cursor=pointer]: "05"
          - listitem [ref=f2e682]:
            - generic [ref=f2e683] [cursor=pointer]: "06"
          - listitem [ref=f2e684]:
            - generic [ref=f2e685] [cursor=pointer]: "07"
          - listitem [ref=f2e686]:
            - generic [ref=f2e687] [cursor=pointer]: "08"
          - listitem [ref=f2e688]:
            - generic [ref=f2e689] [cursor=pointer]: "09"
          - listitem [ref=f2e690]:
            - generic [ref=f2e691] [cursor=pointer]: "10"
          - listitem [ref=f2e692]:
            - generic [ref=f2e693] [cursor=pointer]: "11"
          - listitem [ref=f2e694]:
            - generic [ref=f2e695] [cursor=pointer]: "12"
          - listitem [ref=f2e696]:
            - generic [ref=f2e697] [cursor=pointer]: "13"
          - listitem [ref=f2e698]:
            - generic [ref=f2e699] [cursor=pointer]: "14"
          - listitem [ref=f2e700]:
            - generic [ref=f2e701] [cursor=pointer]: "15"
          - listitem [ref=f2e702]:
            - generic [ref=f2e703] [cursor=pointer]: "16"
          - listitem [ref=f2e704]:
            - generic [ref=f2e705] [cursor=pointer]: "17"
          - listitem [ref=f2e706]:
            - generic [ref=f2e707] [cursor=pointer]: "18"
          - listitem [ref=f2e708]:
            - generic [ref=f2e709] [cursor=pointer]: "19"
          - listitem [ref=f2e710]:
            - generic [ref=f2e711] [cursor=pointer]: "20"
          - listitem [ref=f2e712]:
            - generic [ref=f2e713] [cursor=pointer]: "21"
          - listitem [ref=f2e714]:
            - generic [ref=f2e715] [cursor=pointer]: "22"
          - listitem [ref=f2e716]:
            - generic [ref=f2e717] [cursor=pointer]: "23"
        - list [ref=f2e718]:
          - listitem [ref=f2e719]:
            - generic [ref=f2e720] [cursor=pointer]: "00"
          - listitem [ref=f2e721]:
            - generic [ref=f2e722] [cursor=pointer]: "01"
          - listitem [ref=f2e723]:
            - generic [ref=f2e724] [cursor=pointer]: "02"
          - listitem [ref=f2e725]:
            - generic [ref=f2e726] [cursor=pointer]: "03"
          - listitem [ref=f2e727]:
            - generic [ref=f2e728] [cursor=pointer]: "04"
          - listitem [ref=f2e729]:
            - generic [ref=f2e730] [cursor=pointer]: "05"
          - listitem [ref=f2e731]:
            - generic [ref=f2e732] [cursor=pointer]: "06"
          - listitem [ref=f2e733]:
            - generic [ref=f2e734] [cursor=pointer]: "07"
          - listitem [ref=f2e735]:
            - generic [ref=f2e736] [cursor=pointer]: "08"
          - listitem [ref=f2e737]:
            - generic [ref=f2e738] [cursor=pointer]: "09"
          - listitem [ref=f2e739]:
            - generic [ref=f2e740] [cursor=pointer]: "10"
          - listitem [ref=f2e741]:
            - generic [ref=f2e742] [cursor=pointer]: "11"
          - listitem [ref=f2e743]:
            - generic [ref=f2e744] [cursor=pointer]: "12"
          - listitem [ref=f2e745]:
            - generic [ref=f2e746] [cursor=pointer]: "13"
          - listitem [ref=f2e747]:
            - generic [ref=f2e748] [cursor=pointer]: "14"
          - listitem [ref=f2e749]:
            - generic [ref=f2e750] [cursor=pointer]: "15"
          - listitem [ref=f2e751]:
            - generic [ref=f2e752] [cursor=pointer]: "16"
          - listitem [ref=f2e753]:
            - generic [ref=f2e754] [cursor=pointer]: "17"
          - listitem [ref=f2e755]:
            - generic [ref=f2e756] [cursor=pointer]: "18"
          - listitem [ref=f2e757]:
            - generic [ref=f2e758] [cursor=pointer]: "19"
          - listitem [ref=f2e759]:
            - generic [ref=f2e760] [cursor=pointer]: "20"
          - listitem [ref=f2e761]:
            - generic [ref=f2e762] [cursor=pointer]: "21"
          - listitem [ref=f2e763]:
            - generic [ref=f2e764] [cursor=pointer]: "22"
          - listitem [ref=f2e765]:
            - generic [ref=f2e766] [cursor=pointer]: "23"
          - listitem [ref=f2e767]:
            - generic [ref=f2e768] [cursor=pointer]: "24"
          - listitem [ref=f2e769]:
            - generic [ref=f2e770] [cursor=pointer]: "25"
          - listitem [ref=f2e771]:
            - generic [ref=f2e772] [cursor=pointer]: "26"
          - listitem [ref=f2e773]:
            - generic [ref=f2e774] [cursor=pointer]: "27"
          - listitem [ref=f2e775]:
            - generic [ref=f2e776] [cursor=pointer]: "28"
          - listitem [ref=f2e777]:
            - generic [ref=f2e778] [cursor=pointer]: "29"
          - listitem [ref=f2e779]:
            - generic [ref=f2e780] [cursor=pointer]: "30"
          - listitem [ref=f2e781]:
            - generic [ref=f2e782] [cursor=pointer]: "31"
          - listitem [ref=f2e783]:
            - generic [ref=f2e784] [cursor=pointer]: "32"
          - listitem [ref=f2e785]:
            - generic [ref=f2e786] [cursor=pointer]: "33"
          - listitem [ref=f2e787]:
            - generic [ref=f2e788] [cursor=pointer]: "34"
          - listitem [ref=f2e789]:
            - generic [ref=f2e790] [cursor=pointer]: "35"
          - listitem [ref=f2e791]:
            - generic [ref=f2e792] [cursor=pointer]: "36"
          - listitem [ref=f2e793]:
            - generic [ref=f2e794] [cursor=pointer]: "37"
          - listitem [ref=f2e795]:
            - generic [ref=f2e796] [cursor=pointer]: "38"
          - listitem [ref=f2e797]:
            - generic [ref=f2e798] [cursor=pointer]: "39"
          - listitem [ref=f2e799]:
            - generic [ref=f2e800] [cursor=pointer]: "40"
          - listitem [ref=f2e801]:
            - generic [ref=f2e802] [cursor=pointer]: "41"
          - listitem [ref=f2e803]:
            - generic [ref=f2e804] [cursor=pointer]: "42"
          - listitem [ref=f2e805]:
            - generic [ref=f2e806] [cursor=pointer]: "43"
          - listitem [ref=f2e807]:
            - generic [ref=f2e808] [cursor=pointer]: "44"
          - listitem [ref=f2e809]:
            - generic [ref=f2e810] [cursor=pointer]: "45"
          - listitem [ref=f2e811]:
            - generic [ref=f2e812] [cursor=pointer]: "46"
          - listitem [ref=f2e813]:
            - generic [ref=f2e814] [cursor=pointer]: "47"
          - listitem [ref=f2e815]:
            - generic [ref=f2e816] [cursor=pointer]: "48"
          - listitem [ref=f2e817]:
            - generic [ref=f2e818] [cursor=pointer]: "49"
          - listitem [ref=f2e819]:
            - generic [ref=f2e820] [cursor=pointer]: "50"
          - listitem [ref=f2e821]:
            - generic [ref=f2e822] [cursor=pointer]: "51"
          - listitem [ref=f2e823]:
            - generic [ref=f2e824] [cursor=pointer]: "52"
          - listitem [ref=f2e825]:
            - generic [ref=f2e826] [cursor=pointer]: "53"
          - listitem [ref=f2e827]:
            - generic [ref=f2e828] [cursor=pointer]: "54"
          - listitem [ref=f2e829]:
            - generic [ref=f2e830] [cursor=pointer]: "55"
          - listitem [ref=f2e831]:
            - generic [ref=f2e832] [cursor=pointer]: "56"
          - listitem [ref=f2e833]:
            - generic [ref=f2e834] [cursor=pointer]: "57"
          - listitem [ref=f2e835]:
            - generic [ref=f2e836] [cursor=pointer]: "58"
          - listitem [ref=f2e837]:
            - generic [ref=f2e838] [cursor=pointer]: "59"
    - list [ref=f2e840]:
      - listitem [ref=f2e841]:
        - button "OK" [disabled] [ref=f2e842]
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
      |              ^ Error: locator.click: Test timeout of 240000ms exceeded.
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