# Registration Flow

```text
                                  ┌──────────┐
                                  │  Start   │
                                  └────┬─────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   Register?    │
                              └──────┬─────────┘
                                   No│
                                     └──────────────► Start
                                       │
                                      Yes
                                       ▼
                             ┌──────────────────┐
                             │  Screen Choice   │
                             └──────┬─────┬─────┘
                                    │     │
                    Attendance       │     │ Library
                                    ▼     ▼
                 ┌─────────────────────┐ ┌─────────────────────┐
                 │ Attendance          │ │ Library             │
                 │ Register Page       │ │ Register Page       │
                 └─────────┬───────────┘ └─────────┬───────────┘
                           │                       │
                           ▼                       ▼
                 ┌─────────────────────┐ ┌─────────────────────┐
                 │ Fill Out Forms      │ │ Fill Out Forms      │
                 └─────────┬───────────┘ └─────────┬───────────┘
                           │                       │
                           ▼                       ▼
                 ┌─────────────────────┐ ┌─────────────────────┐
                 │ Submit Form         │ │ Submit Form         │
                 └─────────┬───────────┘ └─────────┬───────────┘
                           │                       │
                           ▼                       ▼
                 ┌─────────────────────┐ ┌─────────────────────┐
                 │ Valid Credentials?  │ │ Valid Credentials?  │
                 └──────┬────────┬─────┘ └──────┬────────┬─────┘
                      No│        │Yes         No│        │Yes
                        ▼        ▼              ▼        ▼
                Fill Out Forms   ┌─────────────────────────────┐
                                 │ Registration Request        │
                                 │ Submitted                   │
                                 └─────────────┬───────────────┘
                                               │
                                               ▼
                                          ┌──────────┐
                                          │   End    │
                                          └──────────┘
```

## Flow Description

1. **Start**
2. The system asks whether the user wants to **Register**.
   - If **No**, the flow returns to **Start**.
   - If **Yes**, proceed to **Screen Choice**.
3. The user selects the registration screen:
   - **Attendance Register Page**
   - **Library Register Page**
4. On the selected registration page, the user:
   - Fills out the registration form.
   - Submits the form.
5. The system validates the submitted credentials.
   - If the credentials are **invalid**, the user is returned to **Fill Out Forms**.
   - If the credentials are **valid**, the **Registration Request Submitted** message is displayed.
6. The process ends.

## Summary Flow

```text
Start
 │
 ▼
Register?
 ├── No
 │     └── Start
 │
 └── Yes
       │
       ▼
   Screen Choice
       ├── Attendance Register Page
       │      │
       │      ▼
       │  Fill Out Forms
       │      │
       │      ▼
       │  Submit Form
       │      │
       │      ▼
       │  Valid Credentials?
       │      ├── No
       │      │     └── Fill Out Forms
       │      └── Yes
       │            └── Registration Request Submitted
       │
       └── Library Register Page
              │
              ▼
          Fill Out Forms
              │
              ▼
          Submit Form
              │
              ▼
          Valid Credentials?
              ├── No
              │     └── Fill Out Forms
              └── Yes
                    └── Registration Request Submitted
                            │
                            ▼
                           End
```
