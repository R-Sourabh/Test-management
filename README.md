# Test Management Application

A modern, highly optimized, and responsive Test Management System that handles the entire lifecycle of test publishing—from authentication and dashboard tracking to multi-step test metadata configuration, interactive question drafting, and preview publishing.

---

## 🚀 Key Features & Flow

### 1. Secure Authentication Flow
* **Login Form:** Fully validated form (`userId`/`password`) protecting all application routes.
* **Persistent Sessions:** Tokens are securely stored and verified via custom route protection (`ProtectedRoute.tsx`).
* **Profile Dropdown Popover:** Selecting the user profile in the sidebar opens an animated popover showing profile metadata and a **Log out** button. Logging out deletes the session token and redirects back to `/login`.

### 2. Dashboard Tracking
* **Chronological Ordering:** To make tracking easy, tests are sorted so that newly created tests always appear **at the top** of the list.
* **Search:** Instant client-side search across tests by name.
* **Responsive Layouts:** Clean, responsive tabular display showing subjects, statuses (Live/Draft), creation dates, and intuitive actions.

### 3. Test Creation Wizard
* **Validation & Flow:** Form built using `react-hook-form` and `zod` to prevent invalid payloads (correct marks, time, difficulty, etc.) from being saved.
* **Cascading Taxonomy Dropdowns:** Subject, Topic, and Sub-Topic selectors load data dynamically. Selecting a subject dynamically updates the options of the topic list; selecting a topic updates the sub-topic list.
* **Smart Loading States:** Inputs whose options rely on asynchronous API responses are automatically disabled and show a skeleton loader until the data finishes loading.

### 4. Rich Question Editor
* **TipTap WYSIWYG Editor:** Allows rich HTML editing for questions (bold, italic, lists, paragraphs).
* **Option Marking:** Supports multi-choice (MCQ) option addition. Correct options can be marked interactively with instantly updated states.
* **Separate Flow controls:** Question selection behaves strictly based on existing elements. Question creation/addition is isolated to designated controls (like adding an MCQ) so users don't accidentally create empty questions by clicking 'Next'.

### 5. Preview & Publish
* Displays a comprehensive, read-only recap of the test metadata alongside a rendering of all questions.
* Safely publishes test parameters and executes bulk question insertion via the staging backend.

---

## 🛠️ Technical Decisions

While building this application, we made several engineering decisions to improve developer experience, performance, and user satisfaction. Here is the rationale behind them:

### Zustand with Persistent Storage
We chose **Zustand** coupled with the `persist` middleware to manage the test creation wizard state. Multi-step forms are notoriously prone to data loss upon accidental page refreshes. By persisting the test metadata and the array of written questions in `localStorage`, the user's progress is preserved. This provides a native-like desktop app experience.

### API Caching Layer
In standard Single Page Applications, navigating between the metadata creation page, question writing page, and the final preview page triggers redundant requests for subjects, topics, and subtopics.
To optimize network overhead, we implemented **in-memory promise caches** in [src/features/taxonomy/api.ts](file:///home/sourabhraghuwanshi/Documents/Preproute/test-management-app/src/features/taxonomy/api.ts). Instead of caching raw data, we cache the Axios *Promises* themselves. This prevents concurrent duplicate requests from firing if multiple components mount and fetch taxonomy data at the same time.

### Flexible API Validation Checking
Many backend systems use varying formats for response states (e.g. some endpoints output `{ success: true }` while others output `{ status: "success" }`). To make the API client layer resilient to these changes, we updated our type signatures and handled both variants in the frontend check:
```typescript
const isSuccess = createRes.data.status === "success" || createRes.data.success === true;
```
This guarantees the UI will never show false failure messages when the network transactions are successful.

### Standardized Iconography with Heroicons
We replaced `lucide-react` with `@heroicons/react` to align closely with the design aesthetics. This reduced our bundle size, made alignment/size control uniform across the layout, and allowed seamless styling using tailwind modifiers.

---

## 📦 Getting Started

### Installation
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
