# Payroll-Management-System

A secure, role‑based web application to manage employees, leave workflows, and monthly payroll with automated allowances/deductions and exportable reports.

## ✨ Features

### Admin Module

* Create/Update/Delete employee records with unique credentials
* View searchable/filterable employee directory
* Approve/Reject leave requests; add remarks
* Manually assign allowances: Travel, Medical, Washing
* Auto-calculate **HRA** and **DA** (configurable rules)
* Generate employee salary with deductions (e.g., LOP based on approved leaves)
* Reports (view + export PDF/Excel):

  * Monthly salary report
  * Yearly salary report
  * Employee-wise salary report
  * Leave report

### Employee Module

* Secure login (username/email + password)
* View personal profile & salary slips
* Submit leave applications with reason & dates
* Track leave status (Approved/Rejected/Pending)

### Optional Enhancements (ready-to-enable)

* Leave balance tracking (carry-forward, encashment rules)
* Notifications (email for leave status / payslip ready)
* Attendance integration (CSV import or biometric API)
* Role-based dashboards & trend analytics

---

## 🔐 Security

* Passwords hashed with **bcrypt** (configurable salt rounds)
* JWT access tokens (short TTL) + refresh tokens (rotating)
* Role-based authorization guards (Admin vs Employee)
* Server-side input validation (zod) & output sanitization
* Parameterized queries (via Prisma) to prevent SQL injection
* CORS, Helmet, Rate limiting, CSRF-sanitized patterns for APIs

---

## 🧮 Payroll Calculation Rules (default)

> These can be changed via **Admin → Payroll Settings** or `.env`.

* **Basic Salary (B):** stored per employee (monthly)
* **HRA:** `HRA = B * HRA_RATE` (default `0.20` → 20%)
* **DA:** `DA = B * DA_RATE` (default `0.10` → 10%)
* **Travel/Medical/Washing:** set per employee per month (manual)
* **Gross Pay:** `Gross = B + HRA + DA + Travel + Medical + Washing`
* **Leave Without Pay (LOP) Deduction:**

  * `Daily Rate = B / WorkingDaysInMonth`
  * `LOP = Daily Rate * UnpaidLeaveDays`
* **Statutory Deductions (examples, configurable):**

  * **PF:** `PF = min(B * PF_RATE, PF_WAGE_CEILING)`
  * **Professional Tax (PT):** slab-based (state configurable)
  * **TDS:** monthly projection (optional; enable if PAN provided)
* **Net Pay:** `Net = Gross - (LOP + PF + PT + TDS)`

> **Note:** Working days exclude weekends/holidays if a holiday calendar is uploaded.

---

## 🧱 Database Schema (high level)

* **User** `(id, role[ADMIN|EMPLOYEE], email, username, passwordHash, status)`
* **EmployeeProfile** `(userId FK, name, dept, designation, doj, pan, bank, basicSalary, grade)`
* **Allowance** `(employeeId FK, month, year, travel, medical, washing)`
* **Leave** `(id, employeeId FK, startDate, endDate, days, reason, status[PENDING|APPROVED|REJECTED], approverId)`
* **PayrollRun** `(id, month, year, status[DRAFT|FINAL], processedAt, createdBy)`
* **Payslip** `(id, employeeId, payrollRunId, breakdown JSON, gross, deductions, net)`

Prisma schema lives at `prisma/schema.prisma`. Migrations are kept under `prisma/migrations`.

---

## 🔌 API (Selected Endpoints)

`/api` base path. All routes require JWT unless noted.

### Auth

* `POST /auth/login` → { accessToken, refreshToken }
* `POST /auth/refresh` → new tokens
* `POST /auth/logout` → revoke refresh token

### Employees (Admin)

* `GET /employees` list
* `POST /employees` create
* `GET /employees/:id` details
* `PUT /employees/:id` update
* `DELETE /employees/:id` delete

### Leaves

* Employee: `POST /leaves` create
* Employee/Admin: `GET /leaves?me=true` my leaves
* Admin: `PATCH /leaves/:id` approve/reject

### Payroll

* Admin: `POST /payroll/run` (month, year)
* Admin: `GET /payroll/runs` list
* Admin: `GET /payslips?employeeId=&month=&year=`
* Employee: `GET /me/payslips`

### Reports

* Admin: `GET /reports/salary/monthly?month=&year=&format=pdf|xlsx`
* Admin: `GET /reports/salary/yearly?year=&format=pdf|xlsx`
* Admin: `GET /reports/salary/employee/:id?from=&to=&format=`
* Admin: `GET /reports/leaves?from=&to=&format=`

> Swagger/OpenAPI is served at `/api/docs` in development.

---

## 🖥️ Frontend (apps/web)

* React + Vite + TypeScript
* Tailwind CSS for styling, Headless UI + Radix where needed
* Auth via JWT (httpOnly cookie or Authorization header)
* Role-based routes (Admin vs Employee)
* Pages:

  * **Login**, **Dashboard** (role-scoped)
  * **Employees** (CRUD)
  * **Leaves** (apply, list, approve)
  * **Payroll** (settings, run, review)
  * **Reports** (tables + exports; charts)
  * **My Profile**, **My Payslips** (download PDF)

## 🧰 Backend (apps/api)

* Express + TypeScript
* Prisma (PostgreSQL)
* Zod validation, Helmet, morgan, rate limiter
* Services: Auth, Employees, Leaves, Payroll, Reports

---

## 🗺️ Roadmap

* [ ] Attendance device integration (Webhook/CSV/SDK)
* [ ] Advanced TDS & region-specific PT slabs
* [ ] Multi‑company, multi‑currency
* [ ] Audit logs & maker-checker for payroll
* [ ] SSO (SAML/OIDC) & SCIM provisioning

---

## 🤝 Contributing

1. Fork the repo & create a feature branch
2. Run tests locally and ensure lint passes
3. Submit a PR with clear description and screenshots (if UI)

---

## 📎 Screens (reference)

* Admin Dashboard with KPIs & charts
* Employee Directory (filterable)
* Leave Approvals queue
* Payroll Run wizard (preview → finalize)
* Payslip viewer (PDF download)

> This README describes the reference implementation. Adjust naming, rates, and flows to match your organization’s policies.
