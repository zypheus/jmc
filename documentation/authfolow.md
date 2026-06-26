# System Flow

```text
                               ┌──────────┐
                               │  Start   │
                               └────┬─────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │  Login   │
                              └────┬─────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │  Check User Role   │
                        └─────┬────┬────┬────┘
                              │    │    │
          ┌───────────────────┘    │    └───────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
 ┌────────────────┐      ┌────────────────┐       ┌──────────────────┐
 │ Library Admin  │      │ Library Staff  │       │ Attendance Admin │
 └──────┬─────────┘      └──────┬─────────┘       └────────┬─────────┘
        │                       │                          │
        ▼                       ▼                          ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────────────┐
│ Library Admin        │  │ Library Staff       │  │ Attendance Admin       │
│ Dashboard            │  │ Dashboard           │  │ Dashboard              │
└──────────┬───────────┘  └──────────┬──────────┘  └──────────┬─────────────┘
           │                         │                        │
           │                         │                        │
           │        ┌────────────────┴────────────────┐       │
           │        │                                 │       │
           ▼        ▼                                 ▼       ▼
                 ┌────────────────┐
                 │ Attendance     │
                 │ Staff          │
                 └──────┬─────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │ Attendance Staff    │
              │ Dashboard           │
              └──────────┬──────────┘
                         │
                         ▼
                   ┌──────────┐
                   │ Logout   │
                   └──────────┘
```

## Flow Description

1. **Start**
2. User proceeds to **Login**.
3. After successful login, the system **checks the user's role**.
4. Based on the assigned role, the user is redirected to one of the following:
   - **Library Admin**
     - Opens the **Library Admin Dashboard**
     - User can then **Logout**.
   - **Library Staff**
     - Opens the **Library Staff Dashboard**
     - User can then **Logout**.
   - **Attendance Admin**
     - Opens the **Attendance Admin Dashboard**
     - User can then **Logout**.
   - **Attendance Staff**
     - Opens the **Attendance Staff Dashboard**
     - User can then **Logout**.

## Summary Flow

```text
Start
  │
  ▼
Login
  │
  ▼
Check User Role
  ├── Library Admin
  │      └── Library Admin Dashboard
  │               └── Logout
  │
  ├── Library Staff
  │      └── Library Staff Dashboard
  │               └── Logout
  │
  ├── Attendance Admin
  │      └── Attendance Admin Dashboard
  │               └── Logout
  │
  └── Attendance Staff
         └── Attendance Staff Dashboard
                  └── Logout
```
