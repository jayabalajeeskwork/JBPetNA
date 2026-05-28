# Task List: Backend Implementation for LOOP Dental SaaS

## 1. Project & Environment Setup
- [x] Set up Node.js/Express project structure
- [x] Configure environment variables for dev/staging/prod
- [x] Set up MongoDB (MVP) with migration path to PostgreSQL
- [x] Integrate code linting, formatting, and pre-commit hooks
- [x] Set up CI/CD pipeline for automated testing and deployment

## 2. Core Domain Models & Database
- [x] Implement Appointment model (team-scoped, provider-scoped, form fields: patientType, firstName, lastName, email, phoneNumber, preferredDays, preferredTimes, servicesInterested, message, status, notes, etc.)
    - [x] Use `{ timestamps: true, versionKey: false }` in all Mongoose schemas; do not manually add `createdAt`/`updatedAt` fields or use `__v`.
    - [x] Do not override or mutate Mongoose's built-in timestamp behavior.
    - [x] Do not store sensitive or unnecessary data in appointment documents.
    - [x] Do not use magic numbers or hardcoded status values; always use enums/constants.
    - [x] Do not create indexes that duplicate those provided by `{ timestamps: true }` or Mongoose defaults.
    - [x] Only use status values from the allowed enum: `scheduled`, `contacted`, `not_contacted`, `declined`.
    - [x] Only use patientType values from the allowed enum: `new`, `existing`.
    - [x] Ensure teamId is required and indexed for efficient team-based queries
    - [x] Ensure providerId is required and indexed for efficient provider-based queries
- [ ] Implement Team model (name, url, isActive)
    - [ ] Create TeamRepository with CRUD operations
    - [ ] Register TeamRepository in repositories/index.js
    - [ ] Create request validators for team creation and updates
    - [ ] Create TeamResponse for API responses
    - [ ] Create TeamController with all endpoints
    - [ ] Add team routes to api.routes.js
    - [ ] Write Jest/Supertest tests for team endpoints
    - [ ] Add team endpoints to loop-postman.json
    - [ ] Update Provider model to include teamId field
    - [ ] Update Appointment model to include teamId field
    - [ ] Update Referral model to include teamId field
    - [ ] Update existing provider, appointment, and referral endpoints to handle teamId
    - [ ] Add team-based appointment listing:
        - [ ] Add listByTeam method to AppointmentRepository
        - [ ] Add listByTeam method to AppointmentController
        - [ ] Add GET /api/appointments/team endpoint
        - [ ] Add tests for team-based appointment listing
        - [ ] Update Postman collection with team-based appointment endpoints
    - [ ] Add team-based referral listing:
        - [ ] Add listByTeam method to ReferralRepository
        - [ ] Add listByTeam method to ReferralController
        - [ ] Add GET /api/referrals/team endpoint
        - [ ] Add tests for team-based referral listing
        - [ ] Update Postman collection with team-based referral endpoints
- [x] Implement Referral model (team-scoped, cross-provider, dental chart, clinical milestones)
    - [x] Referral model now includes required teamId and provider references (ObjectId, ref: 'Team' and 'Provider'). All related logic, endpoints, validators, and repository methods must enforce and handle these fields.
    - [x] Create ReferralRepository with CRUD and soft delete
    - [x] Register ReferralRepository in repositories/index.js
    - [x] Create request validators for create/update
    - [x] Create ReferralResponse for API responses
    - [x] Create ReferralController with all endpoints
    - [x] Add referral routes to api.routes.js
    - [x] Write Jest/Supertest tests for referral endpoints
    - [x] Add referral endpoints to loop-postman.json
- [ ] Implement Provider model (profile, subscription, directory)
- [ ] Implement User model (roles, credential verification, provider link)
- [ ] Implement Audit Log model (for HIPAA compliance)

## 3. Authentication & Authorization
- [ ] Implement JWT-based authentication
- [ ] Implement credential verification and licensing validation for professionals
- [ ] Implement role-based access control (RBAC) for endpoints
- [ ] Enforce provider/professional isolation for all queries

## 4. Appointment Management APIs
- [x] POST /api/appointments – Create appointment (external form integration)
    - [x] Ensure teamId is required and validated
    - [x] Ensure providerId is required and validated
- [x] GET /api/appointments – List/search appointments (by team, provider, name, email, phone, preferred days/times, status, patient type)
    - [x] Add team-based filtering as primary filter
    - [x] Add provider-based filtering as secondary filter
- [x] PUT /api/appointments/:id – Update appointment (status, notes, outcome)
    - [x] Ensure teamId cannot be changed
    - [x] Ensure providerId cannot be changed
- [x] DELETE /api/appointments/:id – Delete appointment
    - [x] Ensure team-based access control
- [x] POST /api/appointments/:id/notes – Add clinical/internal notes
    - [x] Ensure team-based access control

## 5. Referral Management APIs
- [x] POST /api/referrals – Create referral (with dental chart, specialty template)
    - [x] Ensure teamId is required and validated
    - [x] Ensure fromProviderId and toProviderId are required and validated
    - [x] Ensure both providers belong to the same team
- [x] GET /api/referrals – List/search referrals (by team, patient, provider, specialty, status)
    - [x] Add team-based filtering as primary filter
    - [x] Add provider-based filtering as secondary filter
- [x] PUT /api/referrals/:id – Update referral (status, milestones, outcome)
    - [x] Ensure teamId cannot be changed
    - [x] Ensure provider references cannot be changed
- [x] POST /api/referrals/:id/messages – Secure clinical messaging
    - [x] Ensure team-based access control
- [x] POST /api/referrals/:id/documents – Upload referral documents
    - [x] Ensure team-based access control

## 5a. Provider Notes for Appointments & Referrals
- [x] Implement Note model (fields: text, author, appointmentId, referralId, timestamps)
- [x] Implement NoteRepository with CRUD and permission checks
- [x] Register NoteRepository in repositories/index.js
- [x] Create request validators for note creation, update, and deletion
- [x] Create NoteResponse for API responses
- [x] Create NoteController with all endpoints (add, list, edit, delete, view)
- [x] Add note endpoints to api.routes.js
- [x] Write Jest/Supertest tests for all note endpoints and permissions
- [x] Add note endpoints to loop-postman.json
- [x] Ensure notes are only visible to providers and admins
- [x] Ensure audit logging for all note actions

## 5b. Real-Time Notifications for Appointments & Referrals
- [x] Implement Notification model (fields: type, recipient, entityId, message, isRead, timestamps)
- [x] Implement NotificationRepository with CRUD and permission checks
- [x] Register NotificationRepository in repositories/index.js
- [x] Create request validators for notification mark-read and deletion
- [x] Create NotificationResponse for API responses
- [x] Create NotificationController with endpoints (list, mark-read, delete)
- [x] Add notification endpoints to api.routes.js
- [x] Integrate notification creation with appointment/referral creation logic
- [x] Implement real-time socket delivery for notifications (e.g., Socket.IO)
- [x] Write Jest/Supertest tests for all notification endpoints and permissions
- [x] Add notification endpoints to loop-postman.json
- [x] Ensure notifications are only visible to recipients (and optionally admins)
- [x] Ensure audit logging for all notification actions

## 6. User & Provider Management APIs
- [x] POST /auth/register – Dentist/professional registration (with credential verification)
- [x] POST /auth/login – Login
- [x] POST /auth/logout – Logout
- [ ] GET /api/users – List users (provider directory)
- [ ] PUT /api/users/:id – Update user profile/role
- [ ] POST /api/providers – Register provider
- [x] GET /api/providers/profile – Get current user's provider profile
    - [x] Create ProviderController with getProfile method
    - [x] Create ProviderRequest validator for getProfile
    - [x] Create ProviderResponse class for provider responses
    - [x] Add findById method to ProviderRepository
    - [x] Add GET /api/providers/profile route to api.routes.js
- [x] Implement Provider Registration Flow using UnRegisteredProvider (admin-only creation)
    - [x] Implement UnRegisteredProvider model (admin creates entries)
    - [x] Implement Provider model (if not already present)
    - [x] Create UnRegisteredProviderRepository and ProviderRepository
    - [x] Add request validators for each registration step
    - [x] Add response classes for registration steps
    - [x] Implement controller methods for:
        - [x] Initiate registration (email entry, code send)
        - [x] Code verification
        - [x] Password creation
        - [x] Profile setup
    - [x] Implement service functions for code generation, email sending, password hashing, and migration
    - [x] Add endpoints to auth.routes.js and api.routes.js:
        - [x] POST /auth/register/initiate
        - [x] POST /auth/register/verify-code
        - [x] POST /auth/register/set-password
        - [x] POST /api/providers (profile setup)
    - [x] Implement rate limiting and security for code requests and verification attempts
    - [x] Integrate email service for code delivery and notifications
    - [x] Write unit/integration tests for all flows and edge cases
    - [x] Document endpoints and flow

## 7. External Integrations
- [x] POST /api/webhooks/appointment – Website form appointment capture
    - [x] Add team validation based on provider's team
    - [x] Ensure teamId is set from provider's team
- [x] POST /api/webhooks/referral – External referral capture
    - [x] Add team validation based on provider's team
    - [x] Ensure teamId is set from provider's team

## 8. Notifications
- [ ] POST /api/notifications/email – Clinical/appointment/referral alerts (basic, MVP)

## 9. Security & Compliance
- [ ] Implement input validation and sanitization (express-validator)
    - [ ] Add team-based validation for all endpoints
    - [ ] Ensure teamId is validated for all operations
- [ ] Implement data encryption at rest and in transit
- [ ] Implement audit logging for all clinical data access and modifications
    - [ ] Add team context to all audit logs
- [ ] Enforce HIPAA compliance (access control, data retention, professional verification)
    - [ ] Add team-based access control for all operations
- [ ] Implement rate limiting, CORS, XSS, and injection protection
    - [ ] Add team-based rate limiting

## 10. Testing & Quality
- [ ] Test edge cases (invalid data, missing fields, etc.)
- [ ] Place all test files in the /tests directory (e.g., tests/session.api.test.js)

## 11. Monitoring & DevOps
- [ ] Implement centralized logging (request/response, errors, audit)
- [ ] Implement health check endpoints
- [ ] Set up metrics for uptime, response time, error rates
- [ ] Set up automated daily backups with 7-year retention for clinical records

## 12. Development Workflow & Code Quality
- [ ] Ensure modular code, <500 lines per file
- [ ] Use controller/service/repository pattern for all features
    - [ ] Add team context to all repository methods
    - [ ] Add team validation to all service methods
- [ ] Register new repositories in repositories/index.js
- [ ] Add request validators and responses for each endpoint
    - [ ] Add team validation to all request validators
- [ ] Document API endpoints and clinical data structures
    - [ ] Document team-based access control
- [ ] Follow "What Not to Do" rules:
    - [ ] Never store user credentials or sensitive info in sessions
    - [ ] Never allow updates to locked sessions
    - [ ] Never bypass request validation or error handling
    - [ ] Never put business logic in controllers (use repository/service pattern)
    - [ ] Never use direct res.status or res.json in response classes or controllers; always use response classes and status helpers
    - [ ] Never implement endpoints for deleting, locking, or exporting sessions
    - [ ] Never manually add `createdAt` or `updatedAt` fields to Mongoose schemas; always use `{ timestamps: true }`.
    - [ ] Never use the default `__v` version key; always set `{ versionKey: false }` in schema options.
    - [ ] Never override or mutate Mongoose's built-in timestamp behavior.
    - [ ] Never store sensitive or unnecessary data in appointment documents.
    - [ ] Never use magic numbers or hardcoded status values; always use enums/constants.
    - [ ] Never create indexes that duplicate those provided by `{ timestamps: true }` or Mongoose defaults.
    - [ ] Never use status values outside the allowed enum: `scheduled`, `contacted`, `not_contacted`, `declined` for appointments.
    - [ ] Never use patientType values outside the allowed enum: `new`, `existing`.
    - [ ] Never use direct res.status or res.json in response classes; always use BaseResponse's okResponse structure for all responses (see AuthResponse for reference).
    - [ ] Never forget to register and initialize new repositories in BaseController. All repositories used in controllers must be initialized in BaseController.
    - [ ] Never bypass team-based access control
    - [ ] Never allow cross-team operations without explicit team validation

## 13. MVP & Phased Delivery
- [ ] Complete all Phase 1 (MVP) tasks above
- [ ] Plan and implement Phase 2 and Phase 3 features as described in PLANNING.md

## Discovered During Work
- [ ] Review token invalidation/blacklist for JWT if needed for enhanced security.
- [ ] Implement webhook domain validation (match req.body.url to Provider.url, normalize domain, reject unregistered domains, attach provider to payload, test valid/invalid cases)

## Pagination & List Endpoints
- [ ] Implement pagination for notes, appointments, referrals, and notifications
    - [ ] Update request validators to accept and validate pagination params (page, limit)
    - [ ] Update repository methods to support paginated queries
    - [ ] Update controllers to handle pagination and return paginated responses
    - [ ] Update response classes to include pagination metadata
    - [ ] Add/modify tests for paginated endpoints and edge cases
    - [ ] Document pagination in API docs

## Google Business Review Management AI Integration ✅ COMPLETED (Team-Based)
- [x] Design and implement googleReview, googleReviewLog, and googleOAuthToken Mongoose models (**team-based**)
- [x] Create repositories for reviews, logs, and OAuth tokens; register in repositories/index.js
- [x] Implement Google OAuth2 authentication (endpoints, token storage, config) (**team-scoped**)
- [x] Implement review sync: fetch from Google, upsert in DB, avoid duplicates (**team-scoped**)
- [x] Implement reply-to-review endpoint: Google API call, update DB, log action (**team-scoped**)
- [x] Implement review log schema and logging logic (**team-scoped**)
- [x] Implement average rating aggregation endpoint (last 12 months) (**team-based**)
- [x] Add request validators and response classes for all endpoints
- [x] Add rate limiting and secure token storage (**team-based**)
- [x] Add endpoints to googleReview.routes.js and register in main router
- [x] Write unit/integration tests for all new logic and endpoints (**updated for team-based access**)
- [x] Document endpoints and update Postman collection
- [x] **Implement team dashboard endpoint matching reference image design**
- [x] **Create migration script from provider-based to team-based structure**
- [x] **Update all documentation to reflect team-based architecture**
