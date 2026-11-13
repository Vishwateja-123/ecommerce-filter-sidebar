# Viva & Interview Preparation Notes
## E-Commerce Product Multi-Filter Sidebar

This document breaks down the major design decisions, architecture patterns, and key functions in this project so you can confidently explain and defend your code during an interview or Viva evaluation.

---

## 1. Quick Project Elevator Pitch
> *"I built a full-stack e-commerce catalog featuring a responsive sticky filter sidebar, dual-thumb price slider, customer star rating radio buttons, and instant multi-criteria filtering and sorting. The application adheres strictly to the rule that all business logic—including input validation, category OR filtering, multi-filter AND logic, and sorting—is executed on the Express backend. The React frontend is purely presentational, managing user inputs and immediately dispatching queries to the API."*

---

## 2. Core Architectural Decisions

### Q1: Why do filtering and sorting on the backend instead of the frontend?
* **Scalability**: In real-world e-commerce, catalogs contain tens of thousands to millions of products. Fetching all items to the browser would cause severe network latency, excessive bandwidth consumption, and browser memory exhaustion. Backend filtering ensures the client only receives the exact subset of data it needs.
* **Security & Validation**: Relying on frontend filtering alone exposes raw data and invites manipulation. Server-side validation (`validateAndSanitizeQuery`) guarantees that bounds like `minPrice <= maxPrice` and valid rating ranges are strictly enforced before processing.
* **Single Source of Truth**: The server maintains accurate inventory counts, bounds, and business rules consistently for web, mobile apps, and third-party integrations.

---

### Q2: Why use OR logic for categories, but AND logic across different filters?
* **Category OR Logic**: When a shopper selects both *"Footwear"* and *"Clothing"*, their mental model is: *"Show me either shoes OR clothes."* An AND condition inside categories would yield 0 results because a single product cannot belong to multiple distinct categories.
* **Cross-Filter AND Logic**: When a shopper chooses *"Footwear"* **AND** sets price to *"$50 – $150"* **AND** selects *"4 Stars & up"*, each additional filter narrows down the search. This requires strict **AND** evaluation:
  $$\text{Matches} = \text{CategoryMatch (OR)} \land \text{PriceMatch} \land \text{RatingMatch}$$

---

### Q3: Why "Filter first, then sort"?
* **Efficiency ($O(N)$ vs $O(M \log M)$)**: If you sort the entire catalog first, you expend computational energy ordering all $N$ products, only to discard most of them during filtering. By filtering first down to $M$ items (where $M \le N$), you only sort the matching items, significantly improving performance.
* **Pagination Readiness**: Real-world APIs apply `OFFSET` and `LIMIT` (pagination). To return the *"Top 10 cheapest Electronics"*, you must first isolate all Electronics, sort them by price, and then slice the first 10. Sorting without filtering yields incorrect pages.

---

### Q4: Why is debouncing applied only to the price slider?
* **User Experience & Network Traffic**: Dragging a range slider fires continuous events (dozens of times per second). Sending an HTTP request on every micro-movement would flood the backend with dozens of redundant requests and cause UI stutter.
* **Selective Debouncing**: We wrap the slider input in a `180ms` debounce timer (`setTimeout`). If the user keeps moving the slider, previous timers are cancelled. As soon as dragging stops for 180ms, the request fires.
* **Immediate Feedback for Discrete Inputs**: Checkbox clicks, radio button selections, and sort dropdown changes are discrete one-click actions; these trigger API updates immediately without debounce delay.

---

### Q5: How is the sticky sidebar implemented without breaking on small screens?
* **Desktop**:
  ```css
  .filter-sidebar {
    position: sticky;
    top: calc(var(--header-height) + 1.25rem);
    max-height: calc(100vh - var(--header-height) - 2.5rem);
    display: flex;
    flex-direction: column;
  }
  .sidebar-scrollable-content {
    overflow-y: auto;
  }
  ```
  *Explanation*: Setting `position: sticky` anchors the sidebar when scrolling through hundreds of product cards. To prevent the sidebar from cutting off on shorter laptop screens, we constrain its `max-height` to the viewport minus headers and give it an independent `overflow-y: auto` scrollbar.
* **Mobile**:
  * On viewports $< 960\text{px}$, the sidebar transforms into an off-canvas drawer (`transform: translateX(-100%)` to `translateX(0)`) toggled by a mobile "Filters" button with a backdrop overlay.

---

## 3. Key Functions Walkthrough

### 1. `validateAndSanitizeQuery(query, bounds)`
* **Location**: `backend/src/utils/filterSort.js`
* **Purpose**:
  - Parses comma-separated category strings (e.g. `categories=Footwear,Clothing`) or arrays into a clean string array.
  - Converts `minPrice` and `maxPrice` to numbers, ensuring $0 \le \text{minPrice} \le \text{maxPrice}$. If invalid, pushes descriptive error messages.
  - Validates `minRating` is between 0 and 5.
  - Validates `sortBy` against an allowed whitelist (`['default', 'price_asc', 'price_desc', 'rating_desc', 'rating_asc']`).
  - Returns `{ sanitized, errors }`. If errors exist, the controller replies with `HTTP 400 Bad Request`.

---

### 2. `filterProducts(products, filters)`
* **Location**: `backend/src/utils/filterSort.js`
* **Purpose**:
  - Iterates through the product array.
  - Checks if `categories.length === 0` (all allowed) OR if `product.category` matches any chosen category.
  - Checks `product.price >= minPrice && product.price <= maxPrice`.
  - Checks `product.rating >= minRating`.
  - Optional search query matching against `name`, `brand`, or `description`.

---

### 3. `sortProducts(products, sortBy)`
* **Location**: `backend/src/utils/filterSort.js`
* **Purpose**:
  - Uses `[...products]` to create a shallow copy so the original inventory array is never mutated.
  - Executes appropriate comparison logic:
    - `price_asc`: `a.price - b.price`
    - `price_desc`: `b.price - a.price`
    - `rating_desc`: Primary comparator `b.rating - a.rating`, secondary comparator `b.ratingCount - a.ratingCount` (tie-breaker).
    - `default`: Preserves inventory order (`a.id - b.id`).

---

### 4. `DualRangeSlider.jsx` - Highlight Calculation
* **Location**: `frontend/src/components/DualRangeSlider.jsx`
* **Purpose**:
  - Calculates the visual track highlight bar between the two sliders:
    $$\text{minPercent} = \frac{\text{minVal} - \text{min}}{\text{max} - \text{min}} \times 100$$
    $$\text{maxPercent} = \frac{\text{maxVal} - \text{min}}{\text{max} - \text{min}} \times 100$$
  - Sets the track style: `left: ${minPercent}%`, `width: ${maxPercent - minPercent}%`.
  - Implements collision prevention: `minVal` cannot exceed `maxVal - step`.

---

### 5. `EmptyState.jsx` & Working Reset
* **Location**: `frontend/src/components/EmptyState.jsx`
* **Purpose**:
  - Displayed whenever `products.length === 0 && !loading`.
  - Provides a prominent "Reset All Filters" button.
  - Clicking calls `handleResetAll()` in `App.jsx`, which resets:
    - `selectedCategories = []`
    - `currentPriceRange = { minVal: minBound, maxVal: maxBound }`
    - `selectedRating = 0`
    - `searchQuery = ''`
    - `sortBy = 'default'`
  - Triggers an immediate backend query to restore all 28 products.

---

## 4. Viva Quick-Fire Q&A Cheat Sheet

| Question | Short Answer |
|---|---|
| **What happens if a user submits negative price?** | The backend validation rejects it with HTTP 400 Bad Request: *"minPrice must be a non-negative number."* |
| **How does React avoid race conditions when filters change quickly?** | Using `AbortController`: each new query aborts the previous pending fetch request so outdated responses are never rendered out of order. |
| **How many products are in the inventory?** | 28 realistic products covering 5 categories (Electronics, Footwear, Clothing, Home & Kitchen, Accessories) with prices from \$12 to \$999 and ratings from 1.9 to 4.9. |
| **Where are the automated tests located?** | In `backend/tests/filterSort.test.js` (unit tests), `backend/tests/api.test.js` (Express API integration tests), and `backend/tests/system_verification.js` (E2E system tests). Run with `npm test`. |
| **What CSS layout is used for product cards?** | CSS Grid with responsive `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` ensuring smooth wrapping across all screen sizes. |
