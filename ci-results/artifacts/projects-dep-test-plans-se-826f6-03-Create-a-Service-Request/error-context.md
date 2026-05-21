# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dep/test-plans/service-requests/create-service-request-v2.spec.ts >> Create Service Request (v2) >> TC-03: Create a Service Request
- Location: projects/dep/test-plans/service-requests/create-service-request-v2.spec.ts:62:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: /Create Case/i }).locator('.ant-form-item').filter({ hasText: 'Channel' }).first().locator('.ant-select')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e5]:
    - complementary [ref=e6]:
      - menu [ref=e10]:
        - menuitem "home Cases" [ref=e11] [cursor=pointer]:
          - img "home" [ref=e12]:
            - img [ref=e13]
          - link "Cases" [ref=e16]:
            - /url: /dynamic/Boxfusion.ServiceManagement/service-requests
        - menuitem "menu-unfold All Cases" [ref=e17] [cursor=pointer]:
          - img "menu-unfold" [ref=e18]:
            - img [ref=e19]
          - link "All Cases" [ref=e22]:
            - /url: /dynamic/StarterTemplate/cases-table
        - menuitem "calendar Events" [ref=e23] [cursor=pointer]:
          - img "calendar" [ref=e24]:
            - img [ref=e25]
          - link "Events" [ref=e28]:
            - /url: /dynamic/Boxfusion.Dep/events-table
        - menuitem "question-circle FAQ" [ref=e29] [cursor=pointer]:
          - img "question-circle" [ref=e30]:
            - img [ref=e31]
          - link "FAQ" [ref=e35]:
            - /url: /dynamic/Boxfusion.ServiceManagement/new-faqs-table
        - menuitem "contacts Contacts" [ref=e36] [cursor=pointer]:
          - img "contacts" [ref=e37]:
            - img [ref=e38]
          - link "Contacts" [ref=e41]:
            - /url: /dynamic/Boxfusion.ServiceManagement/contacts-table
        - menuitem "home Facilities" [ref=e42] [cursor=pointer]:
          - img "home" [ref=e43]:
            - img [ref=e44]
          - link "Facilities" [ref=e47]:
            - /url: /dynamic/Boxfusion.Dep/facilities-table
        - menuitem "usergroup-delete Customers" [ref=e48] [cursor=pointer]:
          - img "usergroup-delete" [ref=e49]:
            - img [ref=e50]
          - link "Customers" [ref=e53]:
            - /url: /dynamic/Boxfusion.Dep/table-customers
        - menuitem "notification Broadcast Notification" [ref=e54] [cursor=pointer]:
          - img "notification" [ref=e55]:
            - img [ref=e56]
          - link "Broadcast Notification" [ref=e59]:
            - /url: /dynamic/Boxfusion.Dep/broad-cast-notificationstableView
        - menuitem "pic-left Ambulance Requests" [ref=e60] [cursor=pointer]:
          - img "pic-left" [ref=e61]:
            - img [ref=e62]
          - link "Ambulance Requests" [ref=e65]:
            - /url: /dynamic/Boxfusion.PatientEngagement/ambulance-requests-tableview
        - menuitem "environment Case Mapping" [ref=e66] [cursor=pointer]:
          - img "environment" [ref=e67]:
            - img [ref=e68]
          - link "Case Mapping" [ref=e71]:
            - /url: /dynamic/Boxfusion.ServiceManagement/Spartial_Map
        - menuitem "wechat Social Media" [ref=e72] [cursor=pointer]:
          - img "wechat" [ref=e73]:
            - img [ref=e74]
          - link "Social Media" [ref=e77]:
            - /url: /dynamic/Boxfusion.Dep/dep-libraries
        - menuitem "appstore Content Item Types" [ref=e78] [cursor=pointer]:
          - img "appstore" [ref=e79]:
            - img [ref=e80]
          - link "Content Item Types" [ref=e83]:
            - /url: /dynamic/boxfusion.content/content-item-types
        - menuitem "windows Manage Content Libraries" [ref=e84] [cursor=pointer]:
          - img "windows" [ref=e85]:
            - img [ref=e86]
          - link "Manage Content Libraries" [ref=e89]:
            - /url: /dynamic/boxfusion.content/manage-libraries-list
        - menuitem "windows Public Libraries" [ref=e90] [cursor=pointer]:
          - img "windows" [ref=e91]:
            - img [ref=e92]
          - link "Public Libraries" [ref=e95]:
            - /url: /dynamic/boxfusion.content/public-libraries
        - menuitem "check Service Ratings" [ref=e96] [cursor=pointer]:
          - img "check" [ref=e97]:
            - img [ref=e98]
          - link "Service Ratings" [ref=e101]:
            - /url: /dynamic/Boxfusion.ServiceManagement/case-service-ratings-table
        - menuitem "area-chart DashBoards" [ref=e102] [cursor=pointer]:
          - img "area-chart" [ref=e103]:
            - img [ref=e104]
          - generic [ref=e106]: DashBoards
        - menuitem "message Chat Console" [ref=e107] [cursor=pointer]:
          - img "message" [ref=e108]:
            - img [ref=e109]
          - link "Chat Console" [ref=e112]:
            - /url: /dynamic/boxfusion.chat/chat-customer-info
        - menuitem "area-chart Reports" [ref=e113] [cursor=pointer]:
          - img "area-chart" [ref=e114]:
            - img [ref=e115]
          - generic [ref=e117]: Reports
        - menuitem "Surveys" [ref=e118] [cursor=pointer]:
          - generic [ref=e119]: Surveys
        - menuitem "tool Administration" [ref=e120] [cursor=pointer]:
          - img "tool" [ref=e121]:
            - img [ref=e122]
          - generic [ref=e124]: Administration
        - menuitem "setting Configurations" [ref=e125] [cursor=pointer]:
          - img "setting" [ref=e126]:
            - img [ref=e127]
          - generic [ref=e129]: Configurations
        - menuitem "edit-reported-user" [ref=e130] [cursor=pointer]:
          - link "edit-reported-user" [ref=e132]:
            - /url: /dynamic/Boxfusion.ServiceManagement/edit-reported-user
        - menuitem "Test Desktop Notif" [ref=e133] [cursor=pointer]:
          - link "Test Desktop Notif" [ref=e135]:
            - /url: /dynamic/Boxfusion.Dep/test-site-desk-notif
      - img "menu-unfold" [ref=e138] [cursor=pointer]:
        - img [ref=e139]
    - generic [ref=e141]:
      - banner [ref=e142]:
        - generic [ref=e148]:
          - generic [ref=e150]:
            - button "edit" [ref=e151] [cursor=pointer]:
              - img "edit" [ref=e152]:
                - img [ref=e153]
            - paragraph [ref=e155] [cursor=pointer]: Shesha/header v11
            - generic [ref=e156]:
              - generic [ref=e157]: Live
              - img "close" [ref=e158] [cursor=pointer]:
                - img [ref=e159]
          - generic [ref=e169]:
            - link [ref=e175] [cursor=pointer]:
              - /url: /
              - img [ref=e185]
            - generic [ref=e187]:
              - generic [ref=e188]:
                - generic [ref=e190]:
                  - generic [ref=e191]: Live Mode
                  - switch "Switch to Edit mode" [ref=e193] [cursor=pointer]
                - generic "Click to change view mode" [ref=e197] [cursor=pointer]:
                  - img "block" [ref=e198]:
                    - img [ref=e199]
                  - generic [ref=e201]: Live
              - generic [ref=e203]:
                - generic [ref=e204] [cursor=pointer]:
                  - text: Lebos Lebos
                  - img "down" [ref=e205]:
                    - img [ref=e206]
                - img "user" [ref=e209]:
                  - img [ref=e210]
      - main [ref=e212]:
        - generic [ref=e218]:
          - generic [ref=e220]:
            - button "edit" [ref=e221] [cursor=pointer]:
              - img "edit" [ref=e222]:
                - img [ref=e223]
            - paragraph [ref=e225] [cursor=pointer]: Boxfusion.ServiceManagement/service-requests v30
            - generic [ref=e226]:
              - generic [ref=e227]: Live
              - img "close" [ref=e228] [cursor=pointer]:
                - img [ref=e229]
          - generic [ref=e242]:
            - generic [ref=e244]:
              - generic [ref=e250]:
                - heading "All Cases" [level=4] [ref=e252] [cursor=pointer]
                - img "down" [ref=e254]:
                  - img [ref=e255]
              - generic [ref=e258]:
                - generic [ref=e261]:
                  - textbox [ref=e263]
                  - button "search" [ref=e266] [cursor=pointer]:
                    - img "search" [ref=e268]:
                      - img [ref=e269]
                - list [ref=e271]:
                  - listitem [ref=e272]: 1-10 of 3129 items
                  - listitem "Previous Page" [ref=e273]:
                    - button "left" [disabled] [ref=e274]:
                      - img "left" [ref=e275]:
                        - img [ref=e276]
                  - listitem "1" [ref=e278] [cursor=pointer]:
                    - generic [ref=e279]: "1"
                  - listitem "2" [ref=e280] [cursor=pointer]:
                    - generic [ref=e281]: "2"
                  - listitem "3" [ref=e282] [cursor=pointer]:
                    - generic [ref=e283]: "3"
                  - listitem "Next 3 Pages" [ref=e284] [cursor=pointer]:
                    - generic [ref=e286]:
                      - img "double-right" [ref=e287]:
                        - img [ref=e288]
                      - generic [ref=e290]: •••
                  - listitem "313" [ref=e291] [cursor=pointer]:
                    - generic [ref=e292]: "313"
                  - listitem "Next Page" [ref=e293] [cursor=pointer]:
                    - button "right" [ref=e294]:
                      - img "right" [ref=e295]:
                        - img [ref=e296]
                  - listitem [ref=e298]:
                    - generic "Page Size" [ref=e299] [cursor=pointer]:
                      - generic [ref=e300]:
                        - combobox "Page Size" [ref=e302]
                        - generic "10 / page" [ref=e303]
                      - generic:
                        - img:
                          - img
                - button "reload" [ref=e309] [cursor=pointer]:
                  - img "reload" [ref=e311]:
                    - img [ref=e312]
            - button "plus Create Case" [disabled] [ref=e321]:
              - generic:
                - img "plus":
                  - img
              - generic: Create Case
            - generic [ref=e329]:
              - generic [ref=e331]:
                - button "edit" [ref=e332] [cursor=pointer]:
                  - img "edit" [ref=e333]:
                    - img [ref=e334]
                - paragraph [ref=e336] [cursor=pointer]: Boxfusion.ServiceManagement/case-item-view v25
                - generic [ref=e337]:
                  - generic [ref=e338]: Live
                  - img "close" [ref=e339] [cursor=pointer]:
                    - img [ref=e340]
              - generic [ref=e346]:
                - generic [ref=e347]:
                  - generic [ref=e348]:
                    - 'checkbox "question-circle REF006/19/05/2026: Case Type Missing Address Missing From: jim test 19/05/2026 15:17 New Agent Assigned To : None" [ref=e350] [cursor=pointer]'
                    - generic [ref=e360]:
                      - generic [ref=e362]:
                        - img "question-circle" [ref=e375]:
                          - img [ref=e376]
                        - generic [ref=e379]:
                          - strong [ref=e386]: "REF006/19/05/2026: Case Type Missing"
                          - generic [ref=e392]: Address Missing
                          - generic [ref=e393]:
                            - generic [ref=e399]: "From: jim test"
                            - generic [ref=e405]: 19/05/2026 15:17
                      - generic [ref=e406]:
                        - generic [ref=e407]:
                          - generic [ref=e413]: New
                          - generic [ref=e419]: Agent
                        - generic [ref=e427]:
                          - text: ": :"
                          - generic [ref=e429]:
                            - generic "Assigned To" [ref=e431]: "Assigned To :"
                            - generic [ref=e434]: None
                  - separator [ref=e435]
                - generic [ref=e436]:
                  - generic [ref=e437]:
                    - 'checkbox "question-circle REF005/19/05/2026: Case Type Missing Address Missing From: jim test 19/05/2026 15:16 New Agent Assigned To : None" [ref=e439] [cursor=pointer]'
                    - generic [ref=e449]:
                      - generic [ref=e451]:
                        - img "question-circle" [ref=e464]:
                          - img [ref=e465]
                        - generic [ref=e468]:
                          - strong [ref=e475]: "REF005/19/05/2026: Case Type Missing"
                          - generic [ref=e481]: Address Missing
                          - generic [ref=e482]:
                            - generic [ref=e488]: "From: jim test"
                            - generic [ref=e494]: 19/05/2026 15:16
                      - generic [ref=e495]:
                        - generic [ref=e496]:
                          - generic [ref=e502]: New
                          - generic [ref=e508]: Agent
                        - generic [ref=e516]:
                          - text: ": :"
                          - generic [ref=e518]:
                            - generic "Assigned To" [ref=e520]: "Assigned To :"
                            - generic [ref=e523]: None
                  - separator [ref=e524]
                - generic [ref=e525]:
                  - generic [ref=e526]:
                    - 'checkbox "question-circle REF004/19/05/2026: Case Type Missing Address Missing From: jim test 19/05/2026 15:16 New Agent Assigned To : None" [ref=e528] [cursor=pointer]'
                    - generic [ref=e538]:
                      - generic [ref=e540]:
                        - img "question-circle" [ref=e553]:
                          - img [ref=e554]
                        - generic [ref=e557]:
                          - strong [ref=e564]: "REF004/19/05/2026: Case Type Missing"
                          - generic [ref=e570]: Address Missing
                          - generic [ref=e571]:
                            - generic [ref=e577]: "From: jim test"
                            - generic [ref=e583]: 19/05/2026 15:16
                      - generic [ref=e584]:
                        - generic [ref=e585]:
                          - generic [ref=e591]: New
                          - generic [ref=e597]: Agent
                        - generic [ref=e605]:
                          - text: ": :"
                          - generic [ref=e607]:
                            - generic "Assigned To" [ref=e609]: "Assigned To :"
                            - generic [ref=e612]: None
                  - separator [ref=e613]
                - generic [ref=e614]:
                  - generic [ref=e615]:
                    - 'checkbox "question-circle REF003/19/05/2026: Case Type Missing Address Missing From: jim test 19/05/2026 13:21 New Agent Assigned To : None" [ref=e617] [cursor=pointer]'
                    - generic [ref=e627]:
                      - generic [ref=e629]:
                        - img "question-circle" [ref=e642]:
                          - img [ref=e643]
                        - generic [ref=e646]:
                          - strong [ref=e653]: "REF003/19/05/2026: Case Type Missing"
                          - generic [ref=e659]: Address Missing
                          - generic [ref=e660]:
                            - generic [ref=e666]: "From: jim test"
                            - generic [ref=e672]: 19/05/2026 13:21
                      - generic [ref=e673]:
                        - generic [ref=e674]:
                          - generic [ref=e680]: New
                          - generic [ref=e686]: Agent
                        - generic [ref=e694]:
                          - text: ": :"
                          - generic [ref=e696]:
                            - generic "Assigned To" [ref=e698]: "Assigned To :"
                            - generic [ref=e701]: None
                  - separator [ref=e702]
                - generic [ref=e703]:
                  - generic [ref=e704]:
                    - 'checkbox "question-circle REF002/19/05/2026: Case Type Missing Address Missing From: jim test 19/05/2026 13:19 New Agent Assigned To : None" [ref=e706] [cursor=pointer]'
                    - generic [ref=e716]:
                      - generic [ref=e718]:
                        - img "question-circle" [ref=e731]:
                          - img [ref=e732]
                        - generic [ref=e735]:
                          - strong [ref=e742]: "REF002/19/05/2026: Case Type Missing"
                          - generic [ref=e748]: Address Missing
                          - generic [ref=e749]:
                            - generic [ref=e755]: "From: jim test"
                            - generic [ref=e761]: 19/05/2026 13:19
                      - generic [ref=e762]:
                        - generic [ref=e763]:
                          - generic [ref=e769]: New
                          - generic [ref=e775]: Agent
                        - generic [ref=e783]:
                          - text: ": :"
                          - generic [ref=e785]:
                            - generic "Assigned To" [ref=e787]: "Assigned To :"
                            - generic [ref=e790]: None
                  - separator [ref=e791]
                - generic [ref=e792]:
                  - generic [ref=e793]:
                    - 'checkbox "question-circle REF001/19/05/2026: Case Type Missing Address Missing From: jim test 19/05/2026 13:12 New Agent Assigned To : None" [ref=e795] [cursor=pointer]'
                    - generic [ref=e805]:
                      - generic [ref=e807]:
                        - img "question-circle" [ref=e820]:
                          - img [ref=e821]
                        - generic [ref=e824]:
                          - strong [ref=e831]: "REF001/19/05/2026: Case Type Missing"
                          - generic [ref=e837]: Address Missing
                          - generic [ref=e838]:
                            - generic [ref=e844]: "From: jim test"
                            - generic [ref=e850]: 19/05/2026 13:12
                      - generic [ref=e851]:
                        - generic [ref=e852]:
                          - generic [ref=e858]: New
                          - generic [ref=e864]: Agent
                        - generic [ref=e872]:
                          - text: ": :"
                          - generic [ref=e874]:
                            - generic "Assigned To" [ref=e876]: "Assigned To :"
                            - generic [ref=e879]: None
                  - separator [ref=e880]
                - generic [ref=e881]:
                  - generic [ref=e882]:
                    - 'checkbox "question-circle REF002/15/05/2026: Case Type Missing Address Missing From: jim test 15/05/2026 13:07 New Agent Assigned To : None" [ref=e884] [cursor=pointer]'
                    - generic [ref=e894]:
                      - generic [ref=e896]:
                        - img "question-circle" [ref=e909]:
                          - img [ref=e910]
                        - generic [ref=e913]:
                          - strong [ref=e920]: "REF002/15/05/2026: Case Type Missing"
                          - generic [ref=e926]: Address Missing
                          - generic [ref=e927]:
                            - generic [ref=e933]: "From: jim test"
                            - generic [ref=e939]: 15/05/2026 13:07
                      - generic [ref=e940]:
                        - generic [ref=e941]:
                          - generic [ref=e947]: New
                          - generic [ref=e953]: Agent
                        - generic [ref=e961]:
                          - text: ": :"
                          - generic [ref=e963]:
                            - generic "Assigned To" [ref=e965]: "Assigned To :"
                            - generic [ref=e968]: None
                  - separator [ref=e969]
                - generic [ref=e970]:
                  - generic [ref=e971]:
                    - 'checkbox "question-circle REF001/15/05/2026: Case Type Missing Address Missing From: jim test 15/05/2026 09:57 New Agent Assigned To : None" [ref=e973] [cursor=pointer]'
                    - generic [ref=e983]:
                      - generic [ref=e985]:
                        - img "question-circle" [ref=e998]:
                          - img [ref=e999]
                        - generic [ref=e1002]:
                          - strong [ref=e1009]: "REF001/15/05/2026: Case Type Missing"
                          - generic [ref=e1015]: Address Missing
                          - generic [ref=e1016]:
                            - generic [ref=e1022]: "From: jim test"
                            - generic [ref=e1028]: 15/05/2026 09:57
                      - generic [ref=e1029]:
                        - generic [ref=e1030]:
                          - generic [ref=e1036]: New
                          - generic [ref=e1042]: Agent
                        - generic [ref=e1050]:
                          - text: ": :"
                          - generic [ref=e1052]:
                            - generic "Assigned To" [ref=e1054]: "Assigned To :"
                            - generic [ref=e1057]: None
                  - separator [ref=e1058]
                - generic [ref=e1059]:
                  - generic [ref=e1060]:
                    - 'checkbox "question-circle REF003/14/05/2026: Case Type Missing Address Missing From: jim test 14/05/2026 13:10 New Agent Assigned To : None" [ref=e1062] [cursor=pointer]'
                    - generic [ref=e1072]:
                      - generic [ref=e1074]:
                        - img "question-circle" [ref=e1087]:
                          - img [ref=e1088]
                        - generic [ref=e1091]:
                          - strong [ref=e1098]: "REF003/14/05/2026: Case Type Missing"
                          - generic [ref=e1104]: Address Missing
                          - generic [ref=e1105]:
                            - generic [ref=e1111]: "From: jim test"
                            - generic [ref=e1117]: 14/05/2026 13:10
                      - generic [ref=e1118]:
                        - generic [ref=e1119]:
                          - generic [ref=e1125]: New
                          - generic [ref=e1131]: Agent
                        - generic [ref=e1139]:
                          - text: ": :"
                          - generic [ref=e1141]:
                            - generic "Assigned To" [ref=e1143]: "Assigned To :"
                            - generic [ref=e1146]: None
                  - separator [ref=e1147]
                - generic [ref=e1149]:
                  - 'checkbox "question-circle REF002/14/05/2026: Case Type Missing Address Missing From: jim test 14/05/2026 12:47 New Agent Assigned To : None" [ref=e1151] [cursor=pointer]'
                  - generic [ref=e1161]:
                    - generic [ref=e1163]:
                      - img "question-circle" [ref=e1176]:
                        - img [ref=e1177]
                      - generic [ref=e1180]:
                        - strong [ref=e1187]: "REF002/14/05/2026: Case Type Missing"
                        - generic [ref=e1193]: Address Missing
                        - generic [ref=e1194]:
                          - generic [ref=e1200]: "From: jim test"
                          - generic [ref=e1206]: 14/05/2026 12:47
                    - generic [ref=e1207]:
                      - generic [ref=e1208]:
                        - generic [ref=e1214]: New
                        - generic [ref=e1220]: Agent
                      - generic [ref=e1228]:
                        - text: ": :"
                        - generic [ref=e1230]:
                          - generic "Assigned To" [ref=e1232]: "Assigned To :"
                          - generic [ref=e1235]: None
  - generic [ref=e1236]:
    - dialog "Create Case":
      - generic [ref=e1237]:
        - button "Close" [ref=e1238] [cursor=pointer]:
          - img "close" [ref=e1240]:
            - img [ref=e1241]
        - generic [ref=e1244]: Create Case
        - generic [ref=e1249]:
          - generic [ref=e1251]:
            - button "edit" [ref=e1252] [cursor=pointer]:
              - img "edit" [ref=e1253]:
                - img [ref=e1254]
            - paragraph [ref=e1256] [cursor=pointer]: Boxfusion.ServiceManagement/case-add v1
            - generic [ref=e1257]:
              - generic [ref=e1258]: Live
              - img "close" [ref=e1259] [cursor=pointer]:
                - img [ref=e1260]
          - generic [ref=e1269]:
            - generic [ref=e1274]:
              - generic [ref=e1276]:
                - generic [ref=e1282]: Case Channel
                - generic [ref=e1287]:
                  - generic "Channel" [ref=e1294]
                  - generic [ref=e1305] [cursor=pointer]:
                    - combobox [ref=e1308]
                    - generic:
                      - img:
                        - img
              - generic [ref=e1310]:
                - generic [ref=e1311]:
                  - generic [ref=e1320]: Submitter Details
                  - button "check" [ref=e1327] [cursor=pointer]:
                    - img "check" [ref=e1329]:
                      - img [ref=e1330]
                - generic [ref=e1339]:
                  - generic [ref=e1341]:
                    - button "edit" [ref=e1342] [cursor=pointer]:
                      - img "edit" [ref=e1343]:
                        - img [ref=e1344]
                    - paragraph [ref=e1346] [cursor=pointer]: Boxfusion.Dep/update-submitter v34
                    - generic [ref=e1347]:
                      - generic [ref=e1348]: Live
                      - img "close" [ref=e1349] [cursor=pointer]:
                        - img [ref=e1350]
                  - generic [ref=e1356]:
                    - generic [ref=e1358]:
                      - generic [ref=e1360]:
                        - generic "First Name" [ref=e1362]
                        - textbox [ref=e1367]
                      - generic [ref=e1369]:
                        - generic "Mobile Number" [ref=e1371]:
                          - text: Mobile Number
                          - generic [ref=e1372]: "*"
                        - textbox [ref=e1377]
                      - generic [ref=e1379]:
                        - generic "Email Address" [ref=e1381]:
                          - text: Email Address
                          - generic [ref=e1382]: "*"
                        - textbox [ref=e1387]
                    - generic [ref=e1389]:
                      - generic [ref=e1391]:
                        - generic "Last Name" [ref=e1393]
                        - textbox [ref=e1398]
                      - generic [ref=e1400]:
                        - generic "Preferred Contact Method" [ref=e1402]
                        - generic [ref=e1406] [cursor=pointer]:
                          - combobox [ref=e1409]
                          - generic:
                            - img:
                              - img
              - generic [ref=e1411]:
                - generic [ref=e1417]: Case Info
                - generic [ref=e1418]:
                  - generic [ref=e1421]:
                    - generic [ref=e1423]:
                      - generic "Category" [ref=e1425]:
                        - text: Category
                        - generic [ref=e1426]: "*"
                      - generic [ref=e1430] [cursor=pointer]:
                        - combobox [ref=e1433]
                        - generic:
                          - img:
                            - img
                    - strong [ref=e1444]: Priority
                    - generic [ref=e1449]:
                      - generic "Description" [ref=e1451]
                      - textbox [ref=e1455]
                  - generic [ref=e1458]:
                    - generic "Case type" [ref=e1462]:
                      - text: Case type
                      - generic [ref=e1463]: "*"
                    - generic [ref=e1467]:
                      - generic "Address" [ref=e1469]:
                        - text: Address
                        - generic [ref=e1470]: "*"
                      - generic [ref=e1475]:
                        - img "search" [ref=e1477]:
                          - img [ref=e1478]
                        - textbox "Search places" [ref=e1480]
                    - generic [ref=e1483]:
                      - generic "Can't Find Address" [ref=e1485]
                      - checkbox [ref=e1491] [cursor=pointer]
            - alert [ref=e1496]:
              - img "info-circle" [ref=e1497]:
                - img [ref=e1498]
              - generic [ref=e1502]: The possible matches for 'Submitter Details' will appear here.
        - generic [ref=e1503]:
          - button "Cancel" [ref=e1504] [cursor=pointer]:
            - generic [ref=e1505]: Cancel
          - button "OK" [ref=e1506] [cursor=pointer]:
            - generic [ref=e1507]: OK
```

# Test source

```ts
  1   | // AUTO-SCAFFOLDED from test-plans/service-requests/create-service-request-v2.md
  2   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  3   | // Do not hand-edit unless you are also updating the .md plan.
  4   | 
  5   | import { test, expect, Page } from '@playwright/test';
  6   | 
  7   | const APP_URL = 'https://linux-dep-adminportal-test.azurewebsites.net/';
  8   | const ADMIN = { user: 'admin', password: '123qwe' };
  9   | 
  10  | async function loginAsAdmin(page: Page) {
  11  |   await page.goto(APP_URL);
  12  |   await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  13  |   await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  14  |   await page.getByRole('button', { name: 'Sign In' }).click();
  15  |   await page.waitForLoadState('networkidle');
  16  | }
  17  | 
  18  | test.describe('Create Service Request (v2)', () => {
  19  |   test('TC-01: Login as Admin', async ({ page }) => {
  20  |     // STEP 1: NAVIGATE to https://linux-dep-adminportal-test.azurewebsites.net/
  21  |     await page.goto(APP_URL);
  22  | 
  23  |     // STEP 2: SNAPSHOT — confirm login form is visible
  24  |     // SNAPSHOT: login form is visible
  25  | 
  26  |     // STEP 3: TYPE username field with `admin`
  27  |     await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  28  | 
  29  |     // STEP 4: TYPE password field with `123qwe`
  30  |     await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  31  | 
  32  |     // STEP 5: CLICK the login / sign-in button
  33  |     await page.getByRole('button', { name: 'Sign In' }).click();
  34  | 
  35  |     // STEP 6: WAIT for dashboard/home page to load
  36  |     await page.waitForLoadState('networkidle');
  37  | 
  38  |     // ASSERT (BLOCKING) dashboard or home page is visible after login
  39  |     await expect(page).not.toHaveURL(/login/i);
  40  |     await expect(page.getByRole('menuitem', { name: /Cases/i }).first()).toBeVisible();
  41  |   });
  42  | 
  43  |   test('TC-02: Navigate to Service Requests', async ({ page }) => {
  44  |     await loginAsAdmin(page);
  45  | 
  46  |     // STEP 1: SNAPSHOT — confirm dashboard is loaded
  47  |     // SNAPSHOT: dashboard is loaded
  48  | 
  49  |     // STEP 2: CLICK the Service Requests menu / navigation item
  50  |     await page.getByRole('menuitem', { name: /Cases/i }).first().click();
  51  | 
  52  |     // STEP 3: WAIT for the Service Requests list page to load
  53  |     await page.waitForLoadState('networkidle');
  54  | 
  55  |     // STEP 4: SNAPSHOT — confirm Service Requests page is visible
  56  |     // SNAPSHOT: Service Requests page is visible
  57  | 
  58  |     // ASSERT (BLOCKING) Service Requests page is visible
  59  |     await expect(page).toHaveURL(/service-requests/i);
  60  |   });
  61  | 
  62  |   test('TC-03: Create a Service Request', async ({ page }) => {
  63  |     await loginAsAdmin(page);
  64  |     await page.getByRole('menuitem', { name: /Cases/i }).first().click();
  65  |     await page.waitForLoadState('networkidle');
  66  | 
  67  |     // STEP 1: SNAPSHOT — confirm Service Requests page is loaded
  68  |     // SNAPSHOT: Service Requests page is loaded
  69  | 
  70  |     // STEP 2: CLICK the "Create" / "New Service Request" button
  71  |     await page.getByRole('button', { name: /Create Case/i }).click();
  72  | 
  73  |     // STEP 3: WAIT for the create service request form/dialog to appear
  74  |     const dialog = page.getByRole('dialog', { name: /Create Case/i });
  75  |     await expect(dialog).toBeVisible();
  76  | 
  77  |     // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
  78  |     // SNAPSHOT: form is open with mandatory fields
  79  | 
  80  |     // ASSERT create service request form is visible
  81  |     await expect(dialog).toBeVisible();
  82  | 
  83  |     // STEP 5: SELECT / TYPE each mandatory field on the form with valid values
  84  |     // Channel — Call Centre (Ant Design select)
> 85  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Channel' }).first().locator('.ant-select').click();
      |                                                                                                          ^ Error: locator.click: Test timeout of 90000ms exceeded.
  86  |     await page.locator('.ant-select-item-option').filter({ hasText: 'Call Centre' }).first().click();
  87  | 
  88  |     // Mobile Number
  89  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Mobile Number' }).locator('input').fill('0766791145');
  90  | 
  91  |     // Email Address
  92  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Email Address' }).locator('input').fill('automation@boxfusion.io');
  93  | 
  94  |     // Category — pick first option
  95  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Category' }).first().locator('.ant-select').click();
  96  |     await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();
  97  | 
  98  |     // Case type — pick first option
  99  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Case type' }).first().locator('.ant-select').click();
  100 |     await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();
  101 | 
  102 |     // Address — type into "Search places"
  103 |     await dialog.getByRole('textbox', { name: /Search places/i }).fill('1 Sandton Drive, Sandton');
  104 | 
  105 |     // STEP 6: SNAPSHOT — confirm each mandatory field is populated
  106 |     // SNAPSHOT: mandatory fields populated
  107 | 
  108 |     // ASSERT all mandatory fields are populated before submit
  109 |     await expect(dialog.locator('.ant-form-item').filter({ hasText: 'Mobile Number' }).locator('input')).toHaveValue('0766791145');
  110 | 
  111 |     // STEP 7: CLICK the OK button to submit
  112 |     await dialog.getByRole('button', { name: /^OK$/ }).click();
  113 | 
  114 |     // ASSERT OK button was clicked and form was submitted
  115 |     // (covered by waiting for confirmation below)
  116 | 
  117 |     // STEP 8: WAIT for confirmation or service request reference to appear
  118 |     await page.waitForLoadState('networkidle');
  119 | 
  120 |     // STEP 9: SNAPSHOT — confirm success message is visible
  121 |     // SNAPSHOT: success message visible
  122 | 
  123 |     // ASSERT (BLOCKING) success message or service request reference is visible after submit
  124 |     await expect(dialog).toBeHidden({ timeout: 30_000 });
  125 |   });
  126 | });
  127 | 
```