# E-Commerce Product Multi-Filter Sidebar

A full-stack e-commerce filtering application built with **React 19 + Vite**, **Node.js + Express**, and a local JSON dataset of 28 realistic products.

All filtering, sorting, price calculations, and input validation are performed strictly on the **Express backend**, while the React frontend handles user interaction, state management, and visual presentation.

---

## 📸 Key Features

1. **Sticky Filter Sidebar**:
   - Anchored on the left with `position: sticky; top: ...`.
   - Independent smooth scrolling so filters remain accessible as the user browses the product grid.
   - Fully responsive: transitions to an off-canvas mobile drawer on smaller viewports.

2. **Multiple Category Checkboxes (OR Logic)**:
   - Filter by multiple categories simultaneously (e.g., *Electronics* OR *Clothing*).
   - Real-time product count badges per category.
   - Quick "Clear Category" shortcuts.

3. **Dual-Handle Min/Max Price Slider**:
   - Dual-thumb range slider to adjust minimum and maximum budget bounds simultaneously.
   - Synchronized direct numeric inputs with dollar formatting.
   - One-click price preset chips (`Under $100`, `$100 - $300`, `$300+`).
   - Prevents thumb overlap collisions.

4. **Minimum 1–5 Star Rating Radios**:
   - Accessible radio buttons for `4★ & up`, `3★ & up`, `2★ & up`, `1★ & up`, and `All Ratings`.
   - Golden visual star ratings for instant readability.

5. **Sorting Capabilities ("Filter First, Then Sort")**:
   - Sort By: `Price: Low to High` (`price_asc`)
   - Sort By: `Price: High to Low` (`price_desc`)
   - Sort By: `Top Rated First` (`rating_desc`)
   - Sort By: `Featured (Default)`

6. **Active Filter Chips & Working Reset**:
   - Dismissible chips for active categories, price ranges, ratings, and search queries.
   - Prominent **Reset Filters** button in sidebar, chips bar, and empty state.
   - Resetting restores all 28 products immediately.

7. **Zero-Results Empty State**:
   - Illustrated empty state displayed when no products match the combined criteria, featuring an immediate "Reset All Filters" CTA.

8. **Instant Updates with Debounce Protection**:
   - Sliders use a 180ms debounce to maintain smooth 60fps dragging while avoiding excessive HTTP requests.
   - Checkboxes, radio buttons, and sort dropdowns update instantly.

---

## 🏗️ Architecture & Filter Logic

```
                     ┌──────────────────────────────┐
                     │     React + Vite Client      │
                     │  - Sticky Filter Sidebar     │
                     │  - Dual Price Range Slider   │
                     │  - Rating Radio Buttons      │
                     │  - Active Filter Chips       │
                     └──────────────┬───────────────┘
                                    │ HTTP GET /api/products?categories=...&minPrice=...
                                    ▼
                     ┌──────────────────────────────┐
                     │    Node.js + Express API     │
                     │  1. Input Validation (400)   │
                     │  2. Filter Stage:            │
                     │     - Categories: OR logic   │
                     │     - Combined: AND logic    │
                     │  3. Sort Stage (After Filter)│
                     │  4. Return Filtered Data     │
                     └──────────────┬───────────────┘
                                    │ Reads
                                    ▼
                     ┌──────────────────────────────┐
                     │  products.json (28 Products) │
                     └──────────────────────────────┘
```

### Filtering Rules:
- **OR Logic Across Selected Categories**:
  Selecting *Electronics* and *Footwear* returns items that are either *Electronics* **OR** *Footwear*.
- **AND Logic Across Different Filter Types**:
  `Category (OR)` **AND** `Price (min <= price <= max)` **AND** `Rating (rating >= minRating)`.
- **Filter First, Then Sort**:
  Filtering narrows down the dataset first ($O(N)$), then sorting orders only the matching results ($O(M \log M)$).

---

## 📂 Project Structure

```
ecommerce-filter-sidebar/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js                # Express app entry point & routes
│   │   ├── controllers/
│   │   │   └── productController.js # Product endpoint logic & response packaging
│   │   ├── utils/
│   │   │   └── filterSort.js        # Core filtering, sorting & validation engine
│   │   └── data/
│   │       └── products.json        # 28 realistic e-commerce products
│   └── tests/
│       ├── filterSort.test.js       # Unit tests for filter & sort algorithms
│       ├── api.test.js              # Integration tests for Express API
│       └── system_verification.js   # Automated end-to-end system test suite
├── frontend/
│   ├── package.json
│   ├── vite.config.js               # Vite config with API proxy
│   ├── index.html
│   └── src/
│       ├── main.jsx                 # React root renderer
│       ├── App.jsx                  # Main application state & API coordination
│       ├── App.css                  # Responsive layout, sticky sidebar & component styles
│       ├── index.css                # Global design tokens and reset
│       ├── services/
│       │   └── api.js               # Backend fetch client & query serializer
│       └── components/
│           ├── FilterSidebar.jsx    # Sticky sidebar container with drawer support
│           ├── DualRangeSlider.jsx  # Two-thumb interactive price range slider
│           ├── RatingFilter.jsx     # 1-5 star radio buttons
│           ├── ProductCard.jsx      # E-commerce card with image, rating, price, badge
│           ├── ProductGrid.jsx      # Responsive grid with skeleton loading state
│           ├── SortDropdown.jsx     # Sort dropdown selector
│           ├── ActiveFilterChips.jsx# Dismissible filter tags
│           └── EmptyState.jsx       # No-results UI with working reset CTA
├── package.json                     # Root convenience scripts
├── README.md                        # Project documentation
└── VIVA_NOTES.md                    # Comprehensive Viva interview preparation guide
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on `v25.6.1`)
- **npm**: v9+ (tested on `v11.9.0`)

### Installation

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🏃 Running the Application

### 1. Start the Express Backend (Port 5001)
```bash
cd backend
npm start
```
*Backend will be running at `http://localhost:5001` with API at `http://localhost:5001/api/products`.*

### 2. Start the React Frontend (Port 3000)
Open a separate terminal window:
```bash
cd frontend
npm run dev
```
*Frontend will open at `http://localhost:3000`.*

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (13 tests)
```bash
cd backend
npm test
```
*Tests query validation, category OR logic, price range bounds, minimum ratings, combined AND logic, and HTTP endpoints.*

### End-to-End System Verification (10 tests)
With the backend server running:
```bash
node backend/tests/system_verification.js
```

---

## 📡 API Reference

### `GET /api/products`
Retrieves products filtered and sorted according to query parameters.

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `categories` | `string` | *(all)* | Comma-separated category names (e.g. `Electronics,Footwear`). Treated with **OR** logic. |
| `minPrice` | `number` | `12` | Minimum product price. Must be $\ge 0$ and $\le \text{maxPrice}$. |
| `maxPrice` | `number` | `999` | Maximum product price. |
| `minRating` | `number` | `0` | Minimum star rating (between `1` and `5`). |
| `sortBy` | `string` | `default` | Sort strategy: `price_asc`, `price_desc`, `rating_desc`, `rating_asc`, `default`. |
| `search` | `string` | `""` | Optional text search across product name, description, and brand. |

#### Example Request:
```http
GET /api/products?categories=Footwear,Clothing&minPrice=50&maxPrice=200&minRating=4&sortBy=price_asc
```

#### Example Response:
```json
{
  "success": true,
  "count": 4,
  "totalInventoryCount": 28,
  "bounds": {
    "minPrice": 12,
    "maxPrice": 999
  },
  "availableCategories": [
    { "name": "Electronics", "count": 7 },
    { "name": "Footwear", "count": 5 },
    { "name": "Clothing", "count": 5 },
    { "name": "Home & Kitchen", "count": 5 },
    { "name": "Accessories", "count": 6 }
  ],
  "appliedFilters": {
    "categories": ["Footwear", "Clothing"],
    "minPrice": 50,
    "maxPrice": 200,
    "minRating": 4,
    "sortBy": "price_asc",
    "search": ""
  },
  "products": [ ... ]
}
```

---

## 🛡️ Input Validation & Error Handling
- Requests with `minPrice > maxPrice` return `400 Bad Request` with an explicit error message.
- Ratings outside `0` to `5` return `400 Bad Request`.
- Unknown sort options return `400 Bad Request` listing valid choices.
