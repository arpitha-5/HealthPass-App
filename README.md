# 🏥 HealthPass Application

HealthPass is a comprehensive digital healthcare management platform designed to streamline medical benefits, appointments, claims, subscriptions, and doctor-patient interactions. This a fully-fledged mobile application built with React Native (Expo) and backend implementations (a modern TypeScript/Prisma backend and a legacy JavaScript/Mongoose backend).

---

## 🛠️ Technology Stack

### Mobile Application
*   **Framework**: React Native with **Expo (v54)**
*   **Navigation**: React Navigation (Native Stack & Bottom Tabs)
*   **State & Services**: Axios (HTTP client), Expo Secure Store (auth tokens), React Context API
*   **UI/UX**: Expo Linear Gradient, Lucide React Native (icons), React Native SVG, React Native Maps (native maps and web fallback)
*   **APIs**: Google Sign-In, Firebase OTP

### Modern Backend (`HealthPassProject`)
*   **Runtime/Language**: Node.js with **TypeScript** & TSX (TypeScript Execute)
*   **Web Framework**: Express
*   **Database ORM**: Prisma ORM with MongoDB adapter
*   **Validation**: Zod
*   **Auth**: JOSE (JSON Web Token signing and encryption)
*   **Documentation**: Swagger UI & OpenAPI 3.0 specification
*   **Code Quality**: Biome (Linter/Formatter)

### Legacy Backend (`backend`)
*   **Runtime/Language**: Node.js with JavaScript (CommonJS)
*   **Web Framework**: Express
*   **Database Client**: MongoDB
*   **Auth**: JWT (jsonwebtoken) & BcryptJS
*   **Payment Gateway**: Razorpay SDK

---

## 📱 Mobile App Features & Screen Flow

The React Native application includes over 40 highly polished screens structured as follows:

1.  **Onboarding & Auth**:
    *   `WelcomeScreen.js`: Entry screen introducing the application.
    *   `LoginScreen.js` & `SignupScreen.js`: User signup and login screens with mobile, email, and Google Sign-in.
    *   `OtpScreen.js`: OTP verification screen using mobile credentials.
2.  **Dashboard & Setup**:
    *   `DashboardScreen.js`: Home screen containing Quick Actions (Book Appointment, Buy Medicine, Claim Benefits, Wallet), subscription summaries, benefits progress, recent activities, and navigation shortcuts.
    *   `AccountSetupScreen.js` & `FamilySetupScreen.js`: Wizards for initial profile details and adding family members.
3.  **Member & Account Management**:
    *   `ProfileScreen.js` & `EditProfileScreen.js`: Detailed user settings, profile updates, and logout actions.
    *   `FamilyManagementScreen.js` & `AddFamilyMemberScreen.js`: Manage dependent profiles (spouse, children, parents), list relationships, and configure coverage.
4.  **Subscriptions & Billing**:
    *   `PlansScreen.js`: Showcase available membership plans.
    *   `PlanSelectionScreen.js` & `PlanComparisonScreen.js`: Interactive tables comparing prices, features, and limits (Basic vs Advanced vs Enhanced).
    *   `CheckoutScreen.js` & `PaymentSuccessScreen.js`: Seamless integration for payment methods and subscription confirmation.
    *   `BillingCycleScreen.js` & `BillsScreen.js`: History of subscription invoices and receipts.
5.  **Appointments & Consultations**:
    *   `DoctorListScreen.js` & `DoctorProfileScreen.js`: Directory of doctors filtered by specialty (Cardiology, Pediatrics, General, etc.) and hospital.
    *   `BookAppointmentScreen.js` & `AppointmentsScreen.js`: Book slots, schedule, reschedule, cancel, or track active medical appointments.
    *   `HospitalMapScreen.js` (with `HospitalMapScreen.web.js` fallback): Geographic locator tracking local network hospitals.
6.  **E-Pharmacy & Lab Tests**:
    *   `PharmacyScreen.js`: E-commerce catalog of OTC medicines and prescription orders.
    *   `LabTestsScreen.js` & `DiagnosticsScreen.js`: Schedule and buy diagnostic health checkup packages (e.g. Fasting Sugar, Diabetes profiles, Vitamin screen) with home sample collection.
7.  **Claims, Benefits & Wallet**:
    *   `BenefitsScreen.js`: Details of available claim percentages (e.g., 10% on diagnostics, 5% on consultation) according to subscription.
    *   `WalletScreen.js`: Detailed breakdown of credits/debits from claims, auto-cashback, referral rewards, and expiry trackers.
    *   `InsuranceScreen.js` & `InsuranceLinkingScreen.js`: Integration of existing corporate or personal third-party insurance policies.
8.  **AI Symptom Checker & Chats**:
    *   `AISymptomCheckerScreen.js`: AI-powered chat screen giving immediate advice based on symptoms.
    *   `ChatScreen.js`: Live messaging chat thread connecting patients with support agents or medical staff.

---

## 🔌 API Endpoints & Routes

The Express backends handle a comprehensive set of REST endpoints:

*   `/api/auth`: Login, OTP generation, OTP verification, tokens refresh.
*   `/api/account/profile` or `/api/user`: Fetch, edit profile, and complete setup.
*   `/api/account/family` or `/api/family`: Add, view, or remove family members.
*   `/api/plans`: Access plans data (Basic, Advanced, Enhanced) with their prices and features.
*   `/api/subscriptions`: Create subscriptions, track remaining free doctor visits, and cancel renewals.
*   `/api/payments`: Create payment orders (Razorpay integration) and confirm payment verification.
*   `/api/doctors`: Fetch available specialist doctors, search by hospital, and retrieve slots.
*   `/api/appointments`: Book time slots, update appointments, and handle cancellations.
*   `/api/hospitals`: Retrieve list of active hospitals, wait times, addresses, and geo-locations.
*   `/api/wallet`: Track wallet balances and ledger transactions.
*   `/api/benefits`: Query percentage limits and claim rules.

---

## 💾 Database Schema (MongoDB & Prisma)

The primary data storage is **MongoDB**. The modern backend structure is defined via `prisma/schema.prisma` containing key models:

*   `User`: Base user account containing profile data, credentials, role (User/Admin), status, and reference arrays.
*   `OtpAttempt`: Tracks active OTP codes, expiry, verification attempts, and rate blocks.
*   `FamilyMember`: Stores dependent attributes (Relation, Age, Gender) tied to a primary User.
*   `Plan` & `Subscription`: Defines subscription tiers and tracks dynamic attributes like `freeVisitsRemaining` and active start/end dates.
*   `Payment`: Financial transactions logged for subscription purchases (integrating Razorpay transaction IDs).
*   `Hospital`, `Doctor`, & `TimeSlot`: Configures appointments. Doctors have hospital relations, and `TimeSlot` logs date, start/end hours, and availability flags.
*   `Appointment`: Connects a Patient, Doctor, Hospital, and specific Time Slot, recording status (Booked, Completed, Cancelled).
*   `ChatThread` & `ChatMessage`: Internal messaging framework for consultation and customer support.
*   `Bill`: Medical claim records containing uploaded invoices (`fileUrl`), amount, verification status (Draft, Submitted, Approved, Rejected), and review notes.
*   `Wallet` & `WalletTransaction`: Represents the digital loyalty cash system. Stores balance and registers ledger credits (reimbursements from uploaded bills) or debits (payments).
*   `CreditRule`: Configures cashback/reimbursement rules by mapping plan tiers to bill categories (e.g. 50% refund on diagnostic tests under the Enhanced plan).
*   `Medicine` & `DiagnosticPackage`: Static catalogs for pharmacy products and pathology packages.

---

## 🚀 Getting Started

### 1. Database Setup
Ensure you have a MongoDB instance running (either MongoDB Community Server locally or a MongoDB Atlas cluster).

### 2. Modern TypeScript Backend (`HealthPassProject`)
1.  Navigate to the directory:
    ```bash
    cd HealthPassProject
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Configure your environment:
    *   Copy `.env.example` to `.env`.
    *   Update `DATABASE_URL` with your MongoDB connection string.
    *   Configure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with long random strings.
4.  Generate Prisma client and seed the database:
    ```bash
    pnpm db:generate
    pnpm db:push
    pnpm db:seed
    ```
5.  Start the development server:
    ```bash
    pnpm dev
    ```
    *   *The API will run on http://localhost:5000/api*
    *   *Access the interactive API docs (Swagger UI) at http://localhost:5000/doc*

### 3. Legacy JavaScript Backend (`backend`)
1.  Navigate to the directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment:
    *   Copy `.env.example` to `.env`.
    *   Set `MONGODB_URI` and `JWT_SECRET`.
4.  Seed subscription plans:
    ```bash
    node seed_plans.js
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```
    *   *The API will run on http://localhost:5000/api*

### 4. Expo Mobile App (`mobile-app`)
1.  Navigate to the directory:
    ```bash
    cd mobile-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the application:
    *   **Start development server**: `npm run start`
    *   **Run on Android**: `npm run android`
    *   **Run on iOS**: `npm run ios`
    *   **Run on Web browser**: `npm run web`
    *   **Clear Expo cache**: `npm run clear`
