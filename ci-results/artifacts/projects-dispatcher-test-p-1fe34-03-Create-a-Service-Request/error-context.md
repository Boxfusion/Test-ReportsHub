# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatcher/test-plans/service-requests/create-service-request.spec.ts >> Create Service Request >> TC-03: Create a Service Request
- Location: projects/dispatcher/test-plans/service-requests/create-service-request.spec.ts:66:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('dialog').first().getByRole('combobox', { name: 'Channel' })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e5]:
    - complementary [ref=e6]:
      - menu [ref=e10]:
        - menuitem "home Service Requests" [ref=e11] [cursor=pointer]:
          - img "home" [ref=e12]:
            - img [ref=e13]
          - link "Service Requests" [ref=e16]:
            - /url: /dynamic/Boxfusion.LesediDep/service-requests
        - menuitem "menu-unfold All Service Requests" [ref=e17] [cursor=pointer]:
          - img "menu-unfold" [ref=e18]:
            - img [ref=e19]
          - link "All Service Requests" [ref=e22]:
            - /url: /dynamic/StarterTemplate/cases-table
        - menuitem "credit-card All Calls" [ref=e23] [cursor=pointer]:
          - img "credit-card" [ref=e24]:
            - img [ref=e25]
          - link "All Calls" [ref=e28]:
            - /url: /dynamic/Boxfusion.ServiceManagementTelephony/calls-index
        - menuitem "calendar Events" [ref=e29] [cursor=pointer]:
          - img "calendar" [ref=e30]:
            - img [ref=e31]
          - link "Events" [ref=e34]:
            - /url: /dynamic/Boxfusion.ServiceManagement/event-table
        - menuitem "play-square Work Order Management" [ref=e35] [cursor=pointer]:
          - img "play-square" [ref=e36]:
            - img [ref=e37]
          - generic [ref=e40]: Work Order Management
        - menuitem "question-circle FAQ" [ref=e41] [cursor=pointer]:
          - img "question-circle" [ref=e42]:
            - img [ref=e43]
          - link "FAQ" [ref=e47]:
            - /url: /dynamic/Boxfusion.ServiceManagement/new-faqs-table
        - menuitem "contacts Contacts Directory" [ref=e48] [cursor=pointer]:
          - img "contacts" [ref=e49]:
            - img [ref=e50]
          - link "Contacts Directory" [ref=e53]:
            - /url: /dynamic/Boxfusion.ServiceManagement/lesedi-contacts-table
        - menuitem "home Regional Offices" [ref=e54] [cursor=pointer]:
          - img "home" [ref=e55]:
            - img [ref=e56]
          - link "Regional Offices" [ref=e59]:
            - /url: /dynamic/Boxfusion.Dep/facilities-table
        - menuitem "usergroup-add Customers" [ref=e60] [cursor=pointer]:
          - img "usergroup-add" [ref=e61]:
            - img [ref=e62]
          - link "Customers" [ref=e65]:
            - /url: /dynamic/Boxfusion.Dep/table-customers
        - menuitem "notification Broadcast Notification" [ref=e66] [cursor=pointer]:
          - img "notification" [ref=e67]:
            - img [ref=e68]
          - link "Broadcast Notification" [ref=e71]:
            - /url: /dynamic/Boxfusion.Dep/broad-cast-notificationstableView
        - menuitem "environment Case Mapping" [ref=e72] [cursor=pointer]:
          - img "environment" [ref=e73]:
            - img [ref=e74]
          - link "Case Mapping" [ref=e77]:
            - /url: /dynamic/Boxfusion.ServiceManagement/Spartial_Map
        - menuitem "wechat Social Media" [ref=e78] [cursor=pointer]:
          - img "wechat" [ref=e79]:
            - img [ref=e80]
          - link "Social Media" [ref=e83]:
            - /url: /dynamic/Boxfusion.Dep/dep-libraries
        - menuitem "dashboard Dashboards" [ref=e84] [cursor=pointer]:
          - img "dashboard" [ref=e85]:
            - img [ref=e86]
          - generic [ref=e88]: Dashboards
        - menuitem "area-chart Reports" [ref=e89] [cursor=pointer]:
          - img "area-chart" [ref=e90]:
            - img [ref=e91]
          - generic [ref=e93]: Reports
        - menuitem "tool Administration" [ref=e94] [cursor=pointer]:
          - img "tool" [ref=e95]:
            - img [ref=e96]
          - generic [ref=e98]: Administration
        - menuitem "setting Configurations" [ref=e99] [cursor=pointer]:
          - img "setting" [ref=e100]:
            - img [ref=e101]
          - generic [ref=e103]: Configurations
      - img "menu-unfold" [ref=e106] [cursor=pointer]:
        - img [ref=e107]
    - generic [ref=e109]:
      - banner [ref=e110]:
        - generic [ref=e116]:
          - generic [ref=e118]:
            - button "edit" [ref=e119] [cursor=pointer]:
              - img "edit" [ref=e120]:
                - img [ref=e121]
            - paragraph [ref=e123] [cursor=pointer]: Shesha/header v23
            - generic [ref=e124]:
              - generic [ref=e125]: Live
              - img "close" [ref=e126] [cursor=pointer]:
                - img [ref=e127]
          - generic [ref=e137]:
            - link [ref=e143] [cursor=pointer]:
              - /url: /
              - img [ref=e153]
            - generic [ref=e155]:
              - generic [ref=e158]:
                - button "clear clear" [ref=e164] [cursor=pointer]:
                  - img "clear" [ref=e166]:
                    - img [ref=e167]
                  - generic [ref=e169]: clear
                - generic [ref=e175]:
                  - strong [ref=e180]: Offline
                  - button "login Login" [ref=e181] [cursor=pointer]:
                    - img "login" [ref=e183]:
                      - img [ref=e184]
                    - generic [ref=e186]: Login
              - generic [ref=e187]:
                - generic [ref=e189]:
                  - generic [ref=e190]: Live Mode
                  - switch "Switch to Edit mode" [ref=e192] [cursor=pointer]
                - generic "Click to change view mode" [ref=e196] [cursor=pointer]:
                  - img "block" [ref=e197]:
                    - img [ref=e198]
                  - generic [ref=e200]: Live
              - generic [ref=e202]:
                - generic [ref=e203] [cursor=pointer]:
                  - text: System Administrator
                  - img "down" [ref=e204]:
                    - img [ref=e205]
                - img "user" [ref=e208]:
                  - img [ref=e209]
      - main [ref=e211]:
        - generic [ref=e217]:
          - generic [ref=e219]:
            - button "edit" [ref=e220] [cursor=pointer]:
              - img "edit" [ref=e221]:
                - img [ref=e222]
            - paragraph [ref=e224] [cursor=pointer]: Boxfusion.LesediDep/service-requests v14
            - generic [ref=e225]:
              - generic [ref=e226]: Live
              - img "close" [ref=e227] [cursor=pointer]:
                - img [ref=e228]
          - generic [ref=e245]:
            - generic [ref=e247]:
              - generic [ref=e253]:
                - heading "All Cases" [level=4] [ref=e255] [cursor=pointer]
                - img "down" [ref=e257]:
                  - img [ref=e258]
              - generic [ref=e261]:
                - generic [ref=e264]:
                  - textbox [ref=e266]
                  - button "search" [ref=e269] [cursor=pointer]:
                    - img "search" [ref=e271]:
                      - img [ref=e272]
                - list [ref=e274]:
                  - listitem [ref=e275]: 1-10 of 54812 items
                  - listitem "Previous Page" [ref=e276]:
                    - button "left" [disabled] [ref=e277]:
                      - img "left" [ref=e278]:
                        - img [ref=e279]
                  - listitem "1" [ref=e281] [cursor=pointer]:
                    - generic [ref=e282]: "1"
                  - listitem "2" [ref=e283] [cursor=pointer]:
                    - generic [ref=e284]: "2"
                  - listitem "3" [ref=e285] [cursor=pointer]:
                    - generic [ref=e286]: "3"
                  - listitem "Next 3 Pages" [ref=e287] [cursor=pointer]:
                    - generic [ref=e289]:
                      - img "double-right" [ref=e290]:
                        - img [ref=e291]
                      - generic [ref=e293]: •••
                  - listitem "5482" [ref=e294] [cursor=pointer]:
                    - generic [ref=e295]: "5482"
                  - listitem "Next Page" [ref=e296] [cursor=pointer]:
                    - button "right" [ref=e297]:
                      - img "right" [ref=e298]:
                        - img [ref=e299]
                  - listitem [ref=e301]:
                    - generic "Page Size" [ref=e302] [cursor=pointer]:
                      - generic [ref=e303]:
                        - combobox "Page Size" [ref=e305]
                        - generic "10 / page" [ref=e306]
                      - generic:
                        - img:
                          - img
                - button "reload" [ref=e312] [cursor=pointer]:
                  - img "reload" [ref=e314]:
                    - img [ref=e315]
            - button "plus Create Case" [disabled] [ref=e324]:
              - generic:
                - img "plus":
                  - img
              - generic: Create Case
            - generic [ref=e332]:
              - generic [ref=e334]:
                - button "edit" [ref=e335] [cursor=pointer]:
                  - img "edit" [ref=e336]:
                    - img [ref=e337]
                - paragraph [ref=e339] [cursor=pointer]: Boxfusion.ServiceManagement/case-item-view v12
                - generic [ref=e340]:
                  - generic [ref=e341]: Live
                  - img "close" [ref=e342] [cursor=pointer]:
                    - img [ref=e343]
              - generic [ref=e349]:
                - generic [ref=e350]:
                  - generic [ref=e351]:
                    - 'checkbox "customer-service REF001/26/05/2026: Bridged Meter 123 Test Street, Heidelberg From: Test Automation 26/05/2026 07:28 New User High Assigned To : None" [ref=e353] [cursor=pointer]'
                    - generic [ref=e363]:
                      - generic [ref=e365]:
                        - img "customer-service" [ref=e378]:
                          - img [ref=e379]
                        - generic [ref=e381]:
                          - strong [ref=e388]: "REF001/26/05/2026: Bridged Meter"
                          - generic [ref=e394]: 123 Test Street, Heidelberg
                          - generic [ref=e395]:
                            - generic [ref=e401]: "From: Test Automation"
                            - generic [ref=e407]: 26/05/2026 07:28
                      - generic [ref=e408]:
                        - generic [ref=e409]:
                          - generic [ref=e415]: New
                          - generic [ref=e421]: User
                          - generic [ref=e427]: High
                        - generic [ref=e429]:
                          - text: ": :"
                          - generic [ref=e431]:
                            - generic "Assigned To" [ref=e433]: "Assigned To :"
                            - generic [ref=e436]: None
                  - separator [ref=e437]
                - generic [ref=e438]:
                  - generic [ref=e439]:
                    - 'checkbox "global REF002/25/05/2026: Cable Installation Lesedi Municipal Nursery, Heidelberg - GP, South Africa From: NOMCEBO HLENGIWE MTHEMBU 25/05/2026 10:36 New User High Assigned To : None" [ref=e441] [cursor=pointer]'
                    - generic [ref=e451]:
                      - generic [ref=e453]:
                        - img "global" [ref=e466]:
                          - img [ref=e467]
                        - generic [ref=e469]:
                          - strong [ref=e476]: "REF002/25/05/2026: Cable Installation"
                          - generic [ref=e482]: Lesedi Municipal Nursery, Heidelberg - GP, South Africa
                          - generic [ref=e483]:
                            - generic [ref=e489]: "From: NOMCEBO HLENGIWE MTHEMBU"
                            - generic [ref=e495]: 25/05/2026 10:36
                      - generic [ref=e496]:
                        - generic [ref=e497]:
                          - generic [ref=e503]: New
                          - generic [ref=e509]: User
                          - generic [ref=e515]: High
                        - generic [ref=e517]:
                          - text: ": :"
                          - generic [ref=e519]:
                            - generic "Assigned To" [ref=e521]: "Assigned To :"
                            - generic [ref=e524]: None
                  - separator [ref=e525]
                - generic [ref=e526]:
                  - generic [ref=e527]:
                    - 'checkbox "global REF001/25/05/2026: Bridged Meter Lesedi Municipal Nursery, Heidelberg - GP, South Africa From: NOMCEBO HLENGIWE MTHEMBU 25/05/2026 10:33 New User High Assigned To : None" [ref=e529] [cursor=pointer]'
                    - generic [ref=e539]:
                      - generic [ref=e541]:
                        - img "global" [ref=e554]:
                          - img [ref=e555]
                        - generic [ref=e557]:
                          - strong [ref=e564]: "REF001/25/05/2026: Bridged Meter"
                          - generic [ref=e570]: Lesedi Municipal Nursery, Heidelberg - GP, South Africa
                          - generic [ref=e571]:
                            - generic [ref=e577]: "From: NOMCEBO HLENGIWE MTHEMBU"
                            - generic [ref=e583]: 25/05/2026 10:33
                      - generic [ref=e584]:
                        - generic [ref=e585]:
                          - generic [ref=e591]: New
                          - generic [ref=e597]: User
                          - generic [ref=e603]: High
                        - generic [ref=e605]:
                          - text: ": :"
                          - generic [ref=e607]:
                            - generic "Assigned To" [ref=e609]: "Assigned To :"
                            - generic [ref=e612]: None
                  - separator [ref=e613]
                - generic [ref=e614]:
                  - generic [ref=e615]:
                    - 'checkbox "global REF001/08/05/2026: Burned Cable Blank Lesedi Municipal Nursery, Heidelberg - GP, South Africa From: Mishalia Pillay 08/05/2026 05:15 New Agent Assigned To : Mojalefa Khanye Assigned To Group : A-Team" [ref=e617] [cursor=pointer]'
                    - generic [ref=e627]:
                      - generic [ref=e629]:
                        - img "global" [ref=e642]:
                          - img [ref=e643]
                        - generic [ref=e645]:
                          - strong [ref=e652]: "REF001/08/05/2026: Burned Cable Blank"
                          - generic [ref=e658]: Lesedi Municipal Nursery, Heidelberg - GP, South Africa
                          - generic [ref=e659]:
                            - generic [ref=e665]: "From: Mishalia Pillay"
                            - generic [ref=e671]: 08/05/2026 05:15
                      - generic [ref=e672]:
                        - generic [ref=e673]:
                          - generic [ref=e679]: New
                          - generic [ref=e685]: Agent
                        - generic [ref=e693]:
                          - generic [ref=e695]:
                            - generic "Assigned To" [ref=e697]: "Assigned To :"
                            - generic [ref=e700]: Mojalefa Khanye
                          - generic [ref=e702]:
                            - generic "Assigned To Group" [ref=e704]: "Assigned To Group :"
                            - generic [ref=e707]: A-Team
                          - text: ":"
                  - separator [ref=e708]
                - generic [ref=e709]:
                  - generic [ref=e710]:
                    - 'checkbox "question-circle REF016/07/05/2026: Case Type Missing Address Missing From: System Administrator 07/05/2026 11:45 New Agent Assigned To : None" [ref=e712] [cursor=pointer]'
                    - generic [ref=e722]:
                      - generic [ref=e724]:
                        - img "question-circle" [ref=e737]:
                          - img [ref=e738]
                        - generic [ref=e741]:
                          - strong [ref=e748]: "REF016/07/05/2026: Case Type Missing"
                          - generic [ref=e754]: Address Missing
                          - generic [ref=e755]:
                            - generic [ref=e761]: "From: System Administrator"
                            - generic [ref=e767]: 07/05/2026 11:45
                      - generic [ref=e768]:
                        - generic [ref=e769]:
                          - generic [ref=e775]: New
                          - generic [ref=e781]: Agent
                        - generic [ref=e789]:
                          - text: ": :"
                          - generic [ref=e791]:
                            - generic "Assigned To" [ref=e793]: "Assigned To :"
                            - generic [ref=e796]: None
                  - separator [ref=e797]
                - generic [ref=e798]:
                  - generic [ref=e799]:
                    - 'checkbox "question-circle REF015/07/05/2026: Case Type Missing Address Missing From: System Administrator 07/05/2026 09:50 New Agent Assigned To : None" [ref=e801] [cursor=pointer]'
                    - generic [ref=e811]:
                      - generic [ref=e813]:
                        - img "question-circle" [ref=e826]:
                          - img [ref=e827]
                        - generic [ref=e830]:
                          - strong [ref=e837]: "REF015/07/05/2026: Case Type Missing"
                          - generic [ref=e843]: Address Missing
                          - generic [ref=e844]:
                            - generic [ref=e850]: "From: System Administrator"
                            - generic [ref=e856]: 07/05/2026 09:50
                      - generic [ref=e857]:
                        - generic [ref=e858]:
                          - generic [ref=e864]: New
                          - generic [ref=e870]: Agent
                        - generic [ref=e878]:
                          - text: ": :"
                          - generic [ref=e880]:
                            - generic "Assigned To" [ref=e882]: "Assigned To :"
                            - generic [ref=e885]: None
                  - separator [ref=e886]
                - generic [ref=e887]:
                  - generic [ref=e888]:
                    - 'checkbox "question-circle REF014/07/05/2026: Case Type Missing Address Missing From: System Administrator 07/05/2026 09:47 New Agent Assigned To : None" [ref=e890] [cursor=pointer]'
                    - generic [ref=e900]:
                      - generic [ref=e902]:
                        - img "question-circle" [ref=e915]:
                          - img [ref=e916]
                        - generic [ref=e919]:
                          - strong [ref=e926]: "REF014/07/05/2026: Case Type Missing"
                          - generic [ref=e932]: Address Missing
                          - generic [ref=e933]:
                            - generic [ref=e939]: "From: System Administrator"
                            - generic [ref=e945]: 07/05/2026 09:47
                      - generic [ref=e946]:
                        - generic [ref=e947]:
                          - generic [ref=e953]: New
                          - generic [ref=e959]: Agent
                        - generic [ref=e967]:
                          - text: ": :"
                          - generic [ref=e969]:
                            - generic "Assigned To" [ref=e971]: "Assigned To :"
                            - generic [ref=e974]: None
                  - separator [ref=e975]
                - generic [ref=e976]:
                  - generic [ref=e977]:
                    - 'checkbox "customer-service REF013/07/05/2026: Bridged Meter Lesedi Municipal Nursery, Heidelberg - GP, South Africa From: Mishalia Pillay 07/05/2026 09:44 New User High Assigned To : None" [ref=e979] [cursor=pointer]'
                    - generic [ref=e989]:
                      - generic [ref=e991]:
                        - img "customer-service" [ref=e1004]:
                          - img [ref=e1005]
                        - generic [ref=e1007]:
                          - strong [ref=e1014]: "REF013/07/05/2026: Bridged Meter"
                          - generic [ref=e1020]: Lesedi Municipal Nursery, Heidelberg - GP, South Africa
                          - generic [ref=e1021]:
                            - generic [ref=e1027]: "From: Mishalia Pillay"
                            - generic [ref=e1033]: 07/05/2026 09:44
                      - generic [ref=e1034]:
                        - generic [ref=e1035]:
                          - generic [ref=e1041]: New
                          - generic [ref=e1047]: User
                          - generic [ref=e1053]: High
                        - generic [ref=e1055]:
                          - text: ": :"
                          - generic [ref=e1057]:
                            - generic "Assigned To" [ref=e1059]: "Assigned To :"
                            - generic [ref=e1062]: None
                  - separator [ref=e1063]
                - generic [ref=e1064]:
                  - generic [ref=e1065]:
                    - 'checkbox "question-circle REF012/07/05/2026: Case Type Missing Address Missing From: Mishalia Pillay 07/05/2026 09:44 New Agent Assigned To : None" [ref=e1067] [cursor=pointer]'
                    - generic [ref=e1077]:
                      - generic [ref=e1079]:
                        - img "question-circle" [ref=e1092]:
                          - img [ref=e1093]
                        - generic [ref=e1096]:
                          - strong [ref=e1103]: "REF012/07/05/2026: Case Type Missing"
                          - generic [ref=e1109]: Address Missing
                          - generic [ref=e1110]:
                            - generic [ref=e1116]: "From: Mishalia Pillay"
                            - generic [ref=e1122]: 07/05/2026 09:44
                      - generic [ref=e1123]:
                        - generic [ref=e1124]:
                          - generic [ref=e1130]: New
                          - generic [ref=e1136]: Agent
                        - generic [ref=e1144]:
                          - text: ": :"
                          - generic [ref=e1146]:
                            - generic "Assigned To" [ref=e1148]: "Assigned To :"
                            - generic [ref=e1151]: None
                  - separator [ref=e1152]
                - generic [ref=e1154]:
                  - 'checkbox "user REF011/07/05/2026: Case Type Missing Address Missing From: Mishalia Pillay 07/05/2026 09:41 New Agent Assigned To : None" [ref=e1156] [cursor=pointer]'
                  - generic [ref=e1166]:
                    - generic [ref=e1168]:
                      - img "user" [ref=e1181]:
                        - img [ref=e1182]
                      - generic [ref=e1184]:
                        - strong [ref=e1191]: "REF011/07/05/2026: Case Type Missing"
                        - generic [ref=e1197]: Address Missing
                        - generic [ref=e1198]:
                          - generic [ref=e1204]: "From: Mishalia Pillay"
                          - generic [ref=e1210]: 07/05/2026 09:41
                    - generic [ref=e1211]:
                      - generic [ref=e1212]:
                        - generic [ref=e1218]: New
                        - generic [ref=e1224]: Agent
                      - generic [ref=e1232]:
                        - text: ": :"
                        - generic [ref=e1234]:
                          - generic "Assigned To" [ref=e1236]: "Assigned To :"
                          - generic [ref=e1239]: None
  - generic [ref=e1240]:
    - dialog "Create Case":
      - generic [ref=e1241]:
        - button "Close" [ref=e1242] [cursor=pointer]:
          - img "close" [ref=e1244]:
            - img [ref=e1245]
        - generic [ref=e1248]: Create Case
        - generic [ref=e1253]:
          - generic [ref=e1255]:
            - button "edit" [ref=e1256] [cursor=pointer]:
              - img "edit" [ref=e1257]:
                - img [ref=e1258]
            - paragraph [ref=e1260] [cursor=pointer]: Boxfusion.LesediDep/lesedi-case-create v21
            - generic [ref=e1261]:
              - generic [ref=e1262]: Live
              - img "close" [ref=e1263] [cursor=pointer]:
                - img [ref=e1264]
          - generic [ref=e1273]:
            - generic [ref=e1278]:
              - generic [ref=e1280]:
                - generic [ref=e1286]: Case Channel
                - generic [ref=e1291]:
                  - generic "Channel" [ref=e1298]
                  - generic [ref=e1309] [cursor=pointer]:
                    - combobox [ref=e1312]
                    - generic:
                      - img:
                        - img
              - generic [ref=e1314]:
                - generic [ref=e1315]:
                  - generic [ref=e1324]: Submitter Details
                  - generic [ref=e1329]:
                    - button "check" [ref=e1331] [cursor=pointer]:
                      - img "check" [ref=e1333]:
                        - img [ref=e1334]
                    - button "rollback" [ref=e1337] [cursor=pointer]:
                      - img "rollback" [ref=e1339]:
                        - img [ref=e1340]
                - generic [ref=e1349]:
                  - generic [ref=e1351]:
                    - button "edit" [ref=e1352] [cursor=pointer]:
                      - img "edit" [ref=e1353]:
                        - img [ref=e1354]
                    - paragraph [ref=e1356] [cursor=pointer]: Boxfusion.LesediDep/update-submitter v3
                    - generic [ref=e1357]:
                      - generic [ref=e1358]: Live
                      - img "close" [ref=e1359] [cursor=pointer]:
                        - img [ref=e1360]
                  - generic [ref=e1366]:
                    - generic [ref=e1368]:
                      - generic [ref=e1370]:
                        - generic "First Name" [ref=e1372]
                        - textbox [ref=e1377]
                      - generic [ref=e1379]:
                        - generic "Mobile Number" [ref=e1381]:
                          - text: Mobile Number
                          - generic [ref=e1382]: "*"
                        - textbox [ref=e1387]
                      - generic [ref=e1389]:
                        - generic "Email Address" [ref=e1391]:
                          - text: Email Address
                          - generic [ref=e1392]: "*"
                        - textbox [ref=e1397]
                      - generic [ref=e1399]:
                        - generic "Account Number" [ref=e1401]
                        - textbox [ref=e1406]
                    - generic [ref=e1408]:
                      - generic [ref=e1410]:
                        - generic "Last Name" [ref=e1412]
                        - textbox [ref=e1417]
                      - generic [ref=e1419]:
                        - generic "Preferred Contact Method" [ref=e1421]
                        - generic [ref=e1425] [cursor=pointer]:
                          - combobox [ref=e1428]
                          - generic:
                            - img:
                              - img
              - generic [ref=e1430]:
                - generic [ref=e1436]: Case Info
                - generic [ref=e1437]:
                  - generic [ref=e1440]:
                    - generic [ref=e1442]:
                      - generic "Category" [ref=e1444]:
                        - text: Category
                        - generic [ref=e1445]: "*"
                      - generic [ref=e1449] [cursor=pointer]:
                        - combobox [ref=e1452]
                        - generic:
                          - img:
                            - img
                    - strong [ref=e1463]: Priority
                    - generic [ref=e1468]:
                      - generic "Description" [ref=e1470]
                      - textbox [ref=e1474]
                  - generic [ref=e1477]:
                    - generic "Case type" [ref=e1481]:
                      - text: Case type
                      - generic [ref=e1482]: "*"
                    - generic [ref=e1486]:
                      - generic "Address" [ref=e1488]:
                        - text: Address
                        - generic [ref=e1489]: "*"
                      - generic [ref=e1494]:
                        - img "search" [ref=e1496]:
                          - img [ref=e1497]
                        - textbox "Search places" [ref=e1499]
                    - generic [ref=e1502]:
                      - generic "Can't Find Address" [ref=e1504]
                      - checkbox [ref=e1510] [cursor=pointer]
            - alert [ref=e1515]:
              - img "info-circle" [ref=e1516]:
                - img [ref=e1517]
              - generic [ref=e1521]: The possible matches for 'Submitter Details' will appear here.
        - generic [ref=e1522]:
          - button "Cancel" [ref=e1523] [cursor=pointer]:
            - generic [ref=e1524]: Cancel
          - button "OK" [ref=e1525] [cursor=pointer]:
            - generic [ref=e1526]: OK
```

# Test source

```ts
  1   | // AUTO-SCAFFOLDED from test-plans/service-requests/create-service-request.md
  2   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  3   | // Do not hand-edit unless you are also updating the .md plan.
  4   | //
  5   | // NOTE: Selectors are inherited from the sibling `dep` project's working v2 spec
  6   | // (same Shesha framework, very similar UI). If the Dispatcher portal diverges,
  7   | // AI-repair on first /RunTest will resolve the failing lines.
  8   | 
  9   | import { test, expect, Page } from '@playwright/test';
  10  | 
  11  | const APP_URL = 'https://linux-lesedi-dep-adminportal-test.azurewebsites.net/';
  12  | const ADMIN = { user: 'admin', password: '123@Qwee' };
  13  | 
  14  | async function loginAsAdmin(page: Page) {
  15  |   await page.goto(APP_URL);
  16  |   await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  17  |   await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  18  |   await page.getByRole('button', { name: 'Sign In' }).click();
  19  |   await page.waitForLoadState('networkidle');
  20  | }
  21  | 
  22  | test.describe('Create Service Request', () => {
  23  |   test('TC-01: Login as Admin', async ({ page }) => {
  24  |     // STEP 1: NAVIGATE to https://linux-lesedi-dep-adminportal-test.azurewebsites.net/
  25  |     await page.goto(APP_URL);
  26  | 
  27  |     // STEP 2: SNAPSHOT — confirm login form is visible
  28  |     // SNAPSHOT: login form is visible
  29  | 
  30  |     // STEP 3: TYPE username field with `admin`
  31  |     await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  32  | 
  33  |     // STEP 4: TYPE password field with `123@Qwee`
  34  |     await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  35  | 
  36  |     // STEP 5: CLICK the login / sign-in button
  37  |     await page.getByRole('button', { name: 'Sign In' }).click();
  38  | 
  39  |     // STEP 6: WAIT for dashboard/home page to load
  40  |     await page.waitForLoadState('networkidle');
  41  | 
  42  |     // ASSERT (BLOCKING) dashboard or home page is visible after login
  43  |     await expect(page).not.toHaveURL(/login/i);
  44  |   });
  45  | 
  46  |   test('TC-02: Navigate to Service Requests', async ({ page }) => {
  47  |     await loginAsAdmin(page);
  48  | 
  49  |     // STEP 1: SNAPSHOT — confirm dashboard is loaded
  50  |     // SNAPSHOT: dashboard is loaded
  51  | 
  52  |     // STEP 2: CLICK the Service Requests menu / navigation item
  53  |     // TODO[selector]: Service Requests menu item — confirm exact label in Dispatcher portal
  54  |     await page.getByRole('menuitem', { name: /Service Request/i }).first().click();
  55  | 
  56  |     // STEP 3: WAIT for the Service Requests list page to load
  57  |     await page.waitForLoadState('networkidle');
  58  | 
  59  |     // STEP 4: SNAPSHOT — confirm Service Requests page is visible
  60  |     // SNAPSHOT: Service Requests page is visible
  61  | 
  62  |     // ASSERT (BLOCKING) Service Requests page is visible
  63  |     await expect(page).toHaveURL(/service-request/i);
  64  |   });
  65  | 
  66  |   test('TC-03: Create a Service Request', async ({ page }) => {
  67  |     await loginAsAdmin(page);
  68  |     // TODO[selector]: Service Requests menu item — confirm exact label in Dispatcher portal
  69  |     await page.getByRole('menuitem', { name: /Service Request/i }).first().click();
  70  |     await page.waitForLoadState('networkidle');
  71  | 
  72  |     // STEP 1: SNAPSHOT — confirm Service Requests page is loaded
  73  |     // SNAPSHOT: Service Requests page is loaded
  74  | 
  75  |     // STEP 2: CLICK the "Create" / "New Service Request" button
  76  |     // TODO[selector]: Create button label may differ — Dispatcher may use "Create Service Request" or "New"
  77  |     await page.getByRole('button', { name: /Create/i }).first().click();
  78  | 
  79  |     // STEP 3: WAIT for the create service request form/dialog to appear
  80  |     const dialog = page.getByRole('dialog').first();
  81  |     await expect(dialog).toBeVisible();
  82  | 
  83  |     // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
  84  |     // SNAPSHOT: form is open with mandatory fields
  85  | 
  86  |     // ASSERT create service request form is visible
  87  |     await expect(dialog).toBeVisible();
  88  | 
  89  |     // STEP 5: SELECT / TYPE each mandatory field on the form with valid values
  90  |     // Channel — Ant Design combobox; pick first available option
> 91  |     await dialog.getByRole('combobox', { name: 'Channel' }).click();
      |                                                             ^ Error: locator.click: Test timeout of 90000ms exceeded.
  92  |     await page.getByRole('option').first().click();
  93  | 
  94  |     // Mobile Number
  95  |     await dialog.getByLabel('Mobile Number', { exact: true }).fill('0766791145');
  96  | 
  97  |     // Email Address
  98  |     await dialog.getByLabel('Email Address', { exact: true }).fill('automation@boxfusion.io');
  99  | 
  100 |     // Category — pick first option
  101 |     await dialog.getByRole('combobox', { name: 'Category' }).click();
  102 |     await page.getByRole('option').first().click();
  103 | 
  104 |     // Case type — cascades from Category; wait for it then pick first option
  105 |     await dialog.getByRole('combobox', { name: /Case type|Request type/i }).click();
  106 |     await page.getByRole('option').first().click();
  107 | 
  108 |     // Address — type into "Search places"
  109 |     await dialog.getByRole('textbox', { name: /Search places/i }).fill('1 Sandton Drive, Sandton');
  110 | 
  111 |     // STEP 6: SNAPSHOT — confirm each mandatory field is populated
  112 |     // SNAPSHOT: mandatory fields populated
  113 | 
  114 |     // ASSERT all mandatory fields are populated before submit
  115 |     await expect(dialog.getByLabel('Mobile Number', { exact: true })).toHaveValue('0766791145');
  116 | 
  117 |     // STEP 7: CLICK the OK button to submit
  118 |     await dialog.getByRole('button', { name: /^OK$|^Submit$/i }).click();
  119 | 
  120 |     // ASSERT OK button was clicked and form was submitted
  121 |     // (covered by waiting for confirmation below)
  122 | 
  123 |     // STEP 8: WAIT for confirmation or service request reference to appear
  124 |     await page.waitForLoadState('networkidle');
  125 | 
  126 |     // STEP 9: SNAPSHOT — confirm success message is visible
  127 |     // SNAPSHOT: success message visible
  128 | 
  129 |     // ASSERT (BLOCKING) success message or service request reference is visible after submit
  130 |     await expect(dialog).toBeHidden({ timeout: 30_000 });
  131 |   });
  132 | });
  133 | 
```