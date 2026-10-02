# PriorSight

**A calm alert at the moment of ordering: a similar test was already done.**

PriorSight is a clinical decision support prototype. When a clinician orders a diagnostic test, it checks whether the same or a similar test was recently done for that patient, including at another hospital, and shows what was found. The clinician always makes the final decision.

> **Prototype only.** Front end with fake data. No backend, no real patient data (PHI), no connection to any EHR or health information exchange. All patients, IDs and results are synthetic.

---

## The problem

When patients move between hospitals, clinics and labs, their earlier results are often not visible to the new clinician. The same or a very similar test (CT, MRI, X-ray, HbA1c, lipid panel and so on) can be ordered again. That can add cost, avoidable radiation or procedure burden, and delay.

Existing tools such as record viewers and health information exchanges require the clinician to go and look. PriorSight explores a narrower idea: surface the prior result **at the point of ordering**, with one low-friction alert.

Evidence for the size of this problem is still being verified. See `docs/` for the problem brief, which separates indicative evidence from claims that are not yet confirmed.

## How it works

1. The clinician selects a patient, picks a test, sets priority (Routine or Urgent) and enters a clinical indication.
2. On **Place Order**, PriorSight compares the order against the patient's earlier tests.
3. If a likely duplicate falls inside the review window, one alert shows the prior test, date, facility, source (This hospital or External) and result, with a link to the full prior report.
4. The clinician chooses one of three actions:
   - **Cancel order, use prior result**
   - **Order anyway** (a reason is required)
   - **Order modified test**
5. Every outcome is written to an audit log.

**Urgent orders** show the alert but never block care.

If the only match is older than the review window, the order goes through with an informational note.

## Screens

| Screen | Purpose |
|---|---|
| **Order Entry** | Search for a test, set priority and indication, place the order. Shows the duplicate alert. |
| **Patient Timeline** | Earlier tests and results, filterable by Labs, Imaging and External only. Newly placed orders appear as "Ordered, result pending". |
| **Admin Insights** | Alerts shown, orders cancelled and overridden, potential avoided tests, override reasons and an audit log. |

## Synthetic patients

Each patient has a made-up patient ID (format `PS-NNNN-NNNN-NN`, last digit is a Luhn check digit) alongside a hospital-specific MRN.

| Patient | Try this | Expected result |
|---|---|---|
| Maria Gonzalez | Order **CT Chest with Contrast** | Alert. Prior CT Chest 21 days ago at an outside hospital. |
| Maria Gonzalez | Order **Echocardiogram** | No alert. A different test, even though the body area is the same. |
| James Carter | Order **Lipid Panel** | Alert. Prior lipid panel 12 days ago. |
| James Carter | Order **HbA1c** | Informational note only. Prior test is 140 days old, outside the window. |
| Aisha Khan | Order **CBC** | No alert. No prior CBC on record. |

## Matching rules (illustrative)

These rules are assumptions for the prototype and **need clinical validation** before any real use.

- The same test name always matches.
- Imaging also matches when both the **modality** (CT, MRI, X-ray and so on) and the **body region** are the same.
- Labs match only on the same test name, never on body region.
- Review windows: **90 days for imaging, 30 days for labs.** Real windows would be test-specific and configurable (for example HbA1c, CBC and echo would differ).

## Design principles

- **Clinician in the loop.** The tool supports a decision and never makes one.
- **One alert, never a stack.** Silent when there is no meaningful match.
- **Minimum necessary information** is shown.
- **Everything is logged.**

## Not in this prototype

- Automated decisions or auto-cancelling orders
- Patient-facing features
- Claims or billing logic
- Predictive or machine learning models
- Replacing or rebuilding any EHR or exchange
- Real data sources, identity matching across organizations, or real EHR integration

## Known limitations

- Data is hardcoded. "Days ago" values are fixed and do not change with the calendar.
- State is held in memory and resets on page refresh.
- A pending order does not yet trigger a duplicate alert.
- "Potential avoided tests" and cost figures on Admin Insights are **illustrative**. A cancelled order does not prove a test was unnecessary, and an override does not prove an alert was wrong. A real evaluation would need chart review.
- A shared patient ID only works if organizations use the same one. Real-world matching relies on demographics and carries error risk.
- Whether a product like this is regulated as a medical device depends on specific criteria and needs legal and regulatory review.

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Recharts, Sonner.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173

Other commands:

```bash
npm run build     # type-check and production build
npm run preview   # serve the production build
```

Styling is precompiled into `src/index.css`. `npm run dev` and `npm run build` regenerate it from `src/tailwind.source.css`.

## Project structure

```
src/
  App.tsx                    App shell, tabs, shared state
  components/
    OrderEntry.tsx           Order form and duplicate alert
    PatientTimeline.tsx      Earlier tests and pending orders
    AdminInsights.tsx        Metrics, charts, audit log
    PatientBanner.tsx        Patient header and selector
    ui/                      shadcn/ui components
  lib/data.ts                Synthetic patients, test catalog, matching rules
  types/index.ts             Shared types
docs/                        Project documents
```

## Documents

The `docs/` folder holds the product documents for this proposal (problem brief, vision and scope, and further requirement documents as they are completed).

## Status

Draft prototype for discussion. Evidence figures in the documents are indicative and unverified until checked against original sources.
