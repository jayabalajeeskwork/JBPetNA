Phase 2 — Acknowledgment Core Flow

This is the heart of the project.

Flow
Business sends acknowledgment link
        ↓
Pet Owner opens link
        ↓
Pet Owner fills form
        ↓
Pet Owner uploads documents
        ↓
Acknowledgment created
        ↓
View acknowledgment details
APIs to verify
POST /acknowledgments
POST /acknowledgments/license-details
POST /acknowledgments/update-license-option
POST /acknowledgments/extract-vaccine-data

GET /acknowledgments/details/:token

Before building dashboards, make sure these work.

Phase 3 — Super Admin Features

You already started this.

APIs
GET /super-admin/acknowledgments

GET /super-admin/export-acknowledgments

POST /super-admin/disable-city-admin
Expected

Super Admin should:

See all acknowledgments
Export CSV
Disable City Admin

Test these completely.

Phase 4 — Municipality / City Admin Management

Only after acknowledgments work.

Need:

Create City Admin
Assign Municipality
Enable/Disable City Admin

Possible APIs:

POST /super-admin/city-admin

PUT /super-admin/city-admin/:id

GET /super-admin/city-admins

If these don't exist, build them.

Phase 5 — City Admin Dashboard

Only after municipality assignment exists.

Flow
City Admin Login
      ↓
See acknowledgments
      ↓
Only assigned municipalities
      ↓
Search
      ↓
Filters
      ↓
Export
      ↓
View documents
APIs
GET /city-admin/acknowledgments

GET /city-admin/export
Phase 6 — Pet Owner Dashboard

Last step.

Flow
Pet Owner Login
      ↓
See my acknowledgments
      ↓
Search
      ↓
View uploaded documents
APIs
GET /owner/acknowledgments

GET /owner/acknowledgments/:id

City admin flow


As a City Admin, I want to log in and see all acknowledgement applications for my assigned municipalities, so I can manage my city’s compliance. 
As a City Admin, I want to search and filter by date/channel/status/municipality, so I can quickly find cases. 
As a City Admin, I want to export the list, so I can submit reports or keep records. 
As a City Admin, I want to view uploaded documents, so I can verify licensing proof. 
As a City Admin, I should not be able to send acknowledgement links, so link-sending stays controlled. 



Flow----

GGIA Login Requirements Document (Easy Words + User Stories) 

Purpose 

GGIA has different kinds of users. Each user logs in and sees only what they are allowed to see and do. This document explains what each user type needs after login, in simple words, with user stories. 

 

1) User Types 

Super Admin 

Municipality Admin (City Admin) 

Pet Owner 

 

2) Common Login Requirements (All User Types) 

2.1 Login 

Users can log in using Email + Password. 

(Optional later) Support Mobile + OTP for Pet Owners if needed. 

2.2 Basic Rules 

Users must see only their allowed pages and data. 

If a user is inactive, they cannot log in. 

After login, user goes to their main index page (dashboard list view). 

2.3 Forgot Password / Reset 

All user types should have: 

Forgot password link 

Reset password flow via email 

2.4 Session & Security (simple) 

Auto logout after inactivity (e.g., 15–30 minutes). 

Basic protections: secure password rules, rate limit login attempts. 

 

3) Super Admin Requirements 

3.1 What Super Admin Sees After Login 

A) Main Index Page (All Municipalities) 

A table showing all acknowledgement applications across all municipalities. 

Columns 

Owner Name 

Pet Name 

Type 

Breed 

Municipality 

Sent To (email/phone) 

Sent On Date 

Status 

Action (button) 

Filters 

Date range filter 

Channel filter (Email / SMS) 

Status filter 

Municipality filter 

Other features 

Search field (search by owner, pet, contact, municipality) 

Export button (exports results based on filters/search) 

Actions per row 

View documents 

 

B) Manage City Admins Page 

A list/table of all municipality admins. 

Features 

Search city admins 

Row action buttons: 

Edit 

Send verification email 

 

3.2 Add Municipality Admin (City Admin) 

Super Admin can create a City Admin with these fields: 

Name 

Phone number 

Email 

Stripe account id(for payments/payouts)(Optional) 

Mayor Name (Optional) 

Municipalities (can assign more than 1 municipality to one admin) 

Impound Link 

City Name 

Enter Location (Goggle address) 

Active/Inactive toggle 

 

3.3 Super Admin User Stories 

As a Super Admin, I want to log in and see all acknowledgement applications across all municipalities, so I can monitor everything in one place. 

As a Super Admin, I want filters (date, channel, status, municipality), so I can quickly find specific applications. 

As a Super Admin, I want to export the filtered list, so I can share data with external teams or keep reports. 

As a Super Admin, I want to manage city admins (edit, verify email, reset password), so I can support municipalities. 

As a Super Admin, I want to add a municipality admin and assign one or multiple municipalities, so the right admin can manage the right cities. 

As a Super Admin, I want to disable a city admin (inactive), so they can’t access GGIA when they shouldn’t. 

 

4) Municipality Admin (City Admin) Requirements 

4.1 What City Admin Sees After Login 

Main Index Page (Only Assigned Municipalities) 

A table showing acknowledgement applications only for the municipalities assigned by Super Admin. 

Columns 

Owner Name 

Pet Name 

Type 

Breed 

Municipality 

Sent To 

Sent On Date 

Status 

Action button 

Filters 

Date range 

Channel 

Status 

Municipality (limited to the municipalities assigned to them) 

Other features 

Search 

Export button (exports results based on filters/search) 

Actions per row 

View documents 

🚫 Restriction 

City Admin cannot send an acknowledgement link. 

 

4.2 City Admin User Stories 

As a City Admin, I want to log in and see all acknowledgement applications for my assigned municipalities, so I can manage my city’s compliance. 

As a City Admin, I want to search and filter by date/channel/status/municipality, so I can quickly find cases. 

As a City Admin, I want to export the list, so I can submit reports or keep records. 

As a City Admin, I want to view uploaded documents, so I can verify licensing proof. 

As a City Admin, I should not be able to send acknowledgement links, so link-sending stays controlled. 

 

5) Pet Owner Requirements 

5.1 What Pet Owner Sees After Login 

Main Index Page (Only Their Own Records) 

A table showing acknowledgement applications created by that pet owner. 

Columns 

Pet Name 

Type 

Breed 

Sent To (which business requested it) 

Sent On Date 

Status 

View Documents button 

Other features 

Search field (search by pet name, business, status) 

Actions per row 

View documents (license/rabies/application proof they uploaded) 

 

5.2 Pet Owner User Stories 

As a Pet Owner, I want to log in and see all my acknowledgement records, so I can track what I submitted. 

As a Pet Owner, I want to search my records, so I can find a specific pet or request quickly. 

As a Pet Owner, I want to view documents I uploaded, so I can reuse or confirm what I submitted. 

 

6) Status & Permissions (Simple Matrix) 

Status (examples) 

Pending acknowledgement 

Completed acknowledgement 

Verified licenses 

Permissions Summary 

Super Admin: See all municipalities, manage city admins, send links, view documents, export 

City Admin: See assigned municipalities only, view documents, export, cannot send links 

Pet Owner: See only their records, view documents, search 

 

7) Acceptance Criteria (Quick Checklist) 

Login 

Each user logs in and lands on the correct dashboard 

Inactive users cannot log in 

Forgot/reset password works for all user types 

Access Control 

Super Admin sees all municipalities 

City Admin sees only assigned municipalities 

Pet Owner sees only their own applications 

Features 

Filters + search work on index pages 

Export exports filtered results 

“View documents” opens the correct files 

City Admin cannot access “Send acknowledgement link” 

 

If you want, I can convert this into a 1–2 page PRD format (sections like Overview, Scope, Out of Scope, Roles/Permissions, Screen Requirements, API needs, Error States). 

Pet Owner

As a Pet Owner, I want to log in and see all my acknowledgement records, so I can track what I submitted. 
As a Pet Owner, I want to search my records, so I can find a specific pet or request quickly. 
As a Pet Owner, I want to view documents I uploaded, so I can reuse or confirm what I submitted. 


GGIA Login Requirements Document (Easy Words + User Stories) 

Purpose 

GGIA has different kinds of users. Each user logs in and sees only what they are allowed to see and do. This document explains what each user type needs after login, in simple words, with user stories. 

 


Flow


1) User Types 

Super Admin 

Municipality Admin (City Admin) 

Pet Owner 

 

2) Common Login Requirements (All User Types) 

2.1 Login 

Users can log in using Email + Password. 

(Optional later) Support Mobile + OTP for Pet Owners if needed. 

2.2 Basic Rules 

Users must see only their allowed pages and data. 

If a user is inactive, they cannot log in. 

After login, user goes to their main index page (dashboard list view). 

2.3 Forgot Password / Reset 

All user types should have: 

Forgot password link 

Reset password flow via email 

2.4 Session & Security (simple) 

Auto logout after inactivity (e.g., 15–30 minutes). 

Basic protections: secure password rules, rate limit login attempts. 

 

3) Super Admin Requirements 

3.1 What Super Admin Sees After Login 

A) Main Index Page (All Municipalities) 

A table showing all acknowledgement applications across all municipalities. 

Columns 

Owner Name 

Pet Name 

Type 

Breed 

Municipality 

Sent To (email/phone) 

Sent On Date 

Status 

Action (button) 

Filters 

Date range filter 

Channel filter (Email / SMS) 

Status filter 

Municipality filter 

Other features 

Search field (search by owner, pet, contact, municipality) 

Export button (exports results based on filters/search) 

Actions per row 

View documents 

 

B) Manage City Admins Page 

A list/table of all municipality admins. 

Features 

Search city admins 

Row action buttons: 

Edit 

Send verification email 

 

3.2 Add Municipality Admin (City Admin) 

Super Admin can create a City Admin with these fields: 

Name 

Phone number 

Email 

Stripe account id(for payments/payouts)(Optional) 

Mayor Name (Optional) 

Municipalities (can assign more than 1 municipality to one admin) 

Impound Link 

City Name 

Enter Location (Goggle address) 

Active/Inactive toggle 

 

3.3 Super Admin User Stories 

As a Super Admin, I want to log in and see all acknowledgement applications across all municipalities, so I can monitor everything in one place. 

As a Super Admin, I want filters (date, channel, status, municipality), so I can quickly find specific applications. 

As a Super Admin, I want to export the filtered list, so I can share data with external teams or keep reports. 

As a Super Admin, I want to manage city admins (edit, verify email, reset password), so I can support municipalities. 

As a Super Admin, I want to add a municipality admin and assign one or multiple municipalities, so the right admin can manage the right cities. 

As a Super Admin, I want to disable a city admin (inactive), so they can’t access GGIA when they shouldn’t. 

 

4) Municipality Admin (City Admin) Requirements 

4.1 What City Admin Sees After Login 

Main Index Page (Only Assigned Municipalities) 

A table showing acknowledgement applications only for the municipalities assigned by Super Admin. 

Columns 

Owner Name 

Pet Name 

Type 

Breed 

Municipality 

Sent To 

Sent On Date 

Status 

Action button 

Filters 

Date range 

Channel 

Status 

Municipality (limited to the municipalities assigned to them) 

Other features 

Search 

Export button (exports results based on filters/search) 

Actions per row 

View documents 

🚫 Restriction 

City Admin cannot send an acknowledgement link. 

 

4.2 City Admin User Stories 

As a City Admin, I want to log in and see all acknowledgement applications for my assigned municipalities, so I can manage my city’s compliance. 

As a City Admin, I want to search and filter by date/channel/status/municipality, so I can quickly find cases. 

As a City Admin, I want to export the list, so I can submit reports or keep records. 

As a City Admin, I want to view uploaded documents, so I can verify licensing proof. 

As a City Admin, I should not be able to send acknowledgement links, so link-sending stays controlled. 

 

5) Pet Owner Requirements 

5.1 What Pet Owner Sees After Login 

Main Index Page (Only Their Own Records) 

A table showing acknowledgement applications created by that pet owner. 

Columns 

Pet Name 

Type 

Breed 

Sent To (which business requested it) 

Sent On Date 

Status 

View Documents button 

Other features 

Search field (search by pet name, business, status) 

Actions per row 

View documents (license/rabies/application proof they uploaded) 

 

5.2 Pet Owner User Stories 

As a Pet Owner, I want to log in and see all my acknowledgement records, so I can track what I submitted. 

As a Pet Owner, I want to search my records, so I can find a specific pet or request quickly. 

As a Pet Owner, I want to view documents I uploaded, so I can reuse or confirm what I submitted. 

 

6) Status & Permissions (Simple Matrix) 

Status (examples) 

Pending acknowledgement 

Completed acknowledgement 

Verified licenses 

Permissions Summary 

Super Admin: See all municipalities, manage city admins, send links, view documents, export 

City Admin: See assigned municipalities only, view documents, export, cannot send links 

Pet Owner: See only their records, view documents, search 

 

7) Acceptance Criteria (Quick Checklist) 

Login 

Each user logs in and lands on the correct dashboard 

Inactive users cannot log in 

Forgot/reset password works for all user types 

Access Control 

Super Admin sees all municipalities 

City Admin sees only assigned municipalities 

Pet Owner sees only their own applications 

Features 

Filters + search work on index pages 

Export exports filtered results 

“View documents” opens the correct files 

City Admin cannot access “Send acknowledgement link” 

 

If you want, I can convert this into a 1–2 page PRD format (sections like Overview, Scope, Out of Scope, Roles/Permissions, Screen Requirements, API needs, Error States). 