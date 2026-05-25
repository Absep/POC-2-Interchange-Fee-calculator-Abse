# User Acceptance Testing (UAT) Checklist
**Project Title:** [Pay-01] Interchange Fee Calculator  
**Execution Date:** May 25, 2026  
**QA Lead:** Abse Abdul Vahab P.

---

## 🛰️ 1. Core Data Transmission Pipeline
* [ ] **FastAPI Response Verity:** Verify `/api/metrics` and `/api/interchange/registry` return valid JSON with proper status validation.
* [ ] **Relational Query Performance:** Confirm DuckDB handles data operations smoothly when applying targeted filter combinations.

## 🎛️ 2. User Interface Inputs & Filters
* [ ] **Jurisdiction Switcher:** Confirm shifting the jurisdiction picker between global, US, and EU targets updates calculated outputs instantly without a page refresh.
* [ ] **Sector Isolation (MCC):** Verify that filtering by specific codes updates the metric displays correctly.
* [ ] **Parameter Sliders:** Check that dragging the card-present and credit card weighting range sliders recalculates fee outflows smoothly.

## 🎯 3. Data Correctness & Business Logic
* [ ] **Regulatory Ceiling Enforcement:** Verify that choosing the EU region caps the baseline take-rate properly, reflecting strict ECB regulatory ceilings.
* [ ] **Waterfall Sum Check:** Ensure the fee components inside the waterfall always add up to exactly 100% of the calculated cost matrix.
* [ ] **Variance Directionality:** Verify that variances above the benchmark display in high-alert red text, while optimal variances render in electric green.

## 💾 4. Secondary Action Systems
* [ ] **Data Manifest Export:** Confirm clicking the download button calls the streaming response directly and transfers a perfectly formatted `.csv` asset log.