# QuickBEE Location Picker - Implementation Plan

**Project Date:** March 19, 2026
**Theme:** QuickBEE (Savor 3.4.0)
**Primary Color:** #000F9F (Dark Blue)
**Dark Mode:** Enabled

---

## 📋 Executive Summary

Replace the current search-based location picker with a **non-searchable dropdown/dropdown menu** that allows users to either:
1. **Auto-detect location** (via geolocation API)
2. **Select from structured dropdown** (District → Municipality → Area hierarchy)

The color scheme remains **consistent between light and dark modes** using CSS variables.

---

## 🎯 Goals

- ✅ Eliminate search functionality for simplicity
- ✅ Provide auto-detection option for convenience
- ✅ Maintain QuickBEE theme consistency (colors, typography, spacing)
- ✅ Support dark mode with same color code structure
- ✅ Hierarchical selection (District → Municipality → Major Area)
- ✅ Optimized for mobile and desktop
- ✅ Accessible (WCAG 2.1 Level AA)

---

## 📊 Data Structure

### Source: Areas.rtf (53 entries)

**Hierarchy:**
```
District
├── Municipality
│   ├── Major Area
│   │   └── Detailed Sub-Areas & Landmarks
```

**Three Districts:**
- 🏛️ **Kathmandu** (11 municipalities, 30 areas)
- 🏘️ **Lalitpur** (3 municipalities, 11 areas)
- 🕌 **Bhaktapur** (4 municipalities, 11 areas)

### Data File Location
- Input: `/Users/mac/Desktop/Areas.rtf`
- Output: `/Users/mac/Desktop/QuickBEE/QUICK BEE/assets/areas-data.json`

---

## 🛠️ Technical Implementation

### Phase 1: Data Processing
**File:** `assets/areas-data.json`

```json
{
  "districts": [
    {
      "id": "kathmandu",
      "name": "Kathmandu",
      "municipalities": [
        {
          "id": "kathmandu-metro",
          "name": "Kathmandu Metropolitan City",
          "areas": [
            {
              "id": "thamel",
              "name": "Thamel",
              "landmarks": "Narsingh Chowk, Saat Ghumti, Chhetrapati..."
            }
          ]
        }
      ]
    }
  ]
}
```

### Phase 2: Create Snippets

#### 1. `location-picker-component.liquid`
- Main component rendering the dropdown structure
- Integrates with Shopify's cart system
- Stores selected location in customer attributes/session

#### 2. `location-picker.js`
- Geo-location API integration
- Dropdown state management
- Selected location storage
- Event listeners for selection changes

#### 3. `location-picker.css`
- Theme-aware styling
- Light mode: Light backgrounds, dark text
- Dark mode: Dark backgrounds, light text
- Hover/focus states with theme colors (#000F9F primary)
- Mobile-responsive design

### Phase 3: Integrate into Header
**File:** `snippets/header-actions.liquid`

Add location picker widget to header section (before cart icon)

---

## 🎨 Design Specifications

### Color Scheme (Light & Dark Mode)

| Element | Light Mode | Dark Mode | CSS Variable |
|---------|-----------|-----------|--------------|
| Background | #FFFFFF | #1a1a1a | `--location-bg` |
| Text | #000000 | #ffffff | `--location-text` |
| Border | #e0e0e0 | #404040 | `--location-border` |
| Primary (Hover) | #000F9F | #000F9F | `--location-primary` |
| Secondary Hover | #f5f5f5 | #2a2a2a | `--location-hover-bg` |

### UI Components

```
┌─────────────────────────────────┐
│  📍 Select Location  ▼          │  ← Location Picker Button
├─────────────────────────────────┤
│ 🔄 Auto-Detect Location         │  ← Option 1
├─────────────────────────────────┤
│ 📍 Kathmandu                    │  ← District Selection
│    ├ Kathmandu Metropolitan City │  ← Municipality
│    │  ├ Thamel                   │  ← Area
│    │  ├ Baneshwor                │
│    │  └ [7 more...]              │
│    ├ Kirtipur Municipality        │
│    └ [10 more...]                │
│ 📍 Lalitpur                     │  ← District 2
│ 📍 Bhaktapur                    │  ← District 3
└─────────────────────────────────┘
```

### Typography
- **Button Text:** 14px, Medium weight, Uppercase
- **District Labels:** 13px, Bold, uppercase
- **Municipality Labels:** 12px, Normal weight
- **Area Labels:** 12px, Normal weight
- **Landmarks (Tooltip):** 11px, Gray, on hover

### Spacing
- Button padding: 12px 16px
- Dropdown padding: 8px 0
- List item padding: 12px 16px
- Icon margin: 8px right

---

## 📱 Implementation Files

### New Files to Create

1. **`assets/areas-data.json`**
   - Structured location data (3 KB)
   - Pre-processed from Areas.rtf

2. **`snippets/location-picker-component.liquid`**
   - Main Liquid template (~150 lines)
   - Renders dropdown structure
   - Manages selection state

3. **`assets/location-picker.js`**
   - Geo-location API (~100 lines)
   - Dropdown interactions (~150 lines)
   - State management (~80 lines)
   - Total: ~330 lines

4. **`assets/location-picker.css`**
   - Light mode styles (~200 lines)
   - Dark mode media query (~100 lines)
   - Responsive design (~80 lines)
   - Total: ~380 lines

### Modified Files

1. **`snippets/header-actions.liquid`**
   - Add location picker component import
   - Position in header layout

2. **`snippets/header-row.liquid`** (if needed)
   - Adjust spacing/layout

3. **`layout/theme.liquid`** (minimal change)
   - Add dark mode detection meta tag (if not present)

---

## ⚙️ Features & Functionality

### 1. Auto-Detect Location
```javascript
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    // Match coordinates to nearest area
    // Pre-defined mapping: Lat/Long → Area
  });
}
```

**Fallback:** Show all districts (user selects manually)

### 2. Dropdown Hierarchy
- **Level 1:** All 3 districts visible
- **Level 2:** Click district → Show municipalities
- **Level 3:** Click municipality → Show areas
- **Level 4:** Click area → Store selection, close dropdown

### 3. Selection Storage
```javascript
// Store in:
1. localStorage: 'quickbee_selected_location'
2. Shopify cart: theme property
3. Customer attribute (if logged in)
```

### 4. Visual Feedback
- ✅ Selected area highlighted with primary color
- ✅ Hover effects on all interactive items
- ✅ Checkmark icon next to selected area
- ✅ Breadcrumb display: "Kathmandu > Kathmandu Metro > Thamel"

---

## 🌓 Dark Mode Implementation

### CSS Variables Approach
```css
:root {
  --location-bg: #ffffff;
  --location-text: #000000;
  --location-border: #e0e0e0;
  --location-primary: #000F9F;
  --location-hover-bg: #f5f5f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --location-bg: #1a1a1a;
    --location-text: #ffffff;
    --location-border: #404040;
    --location-primary: #000F9F; /* SAME */
    --location-hover-bg: #2a2a2a;
  }
}
```

**Key:** Primary color (#000F9F) remains **identical** in both modes for brand consistency.

---

## 📋 Step-by-Step Implementation

### Step 1: Prepare Data (10 mins)
- [ ] Convert Areas.rtf → JSON format
- [ ] Validate hierarchical structure
- [ ] Test JSON parsing

### Step 2: Create CSS (20 mins)
- [ ] Write base styles
- [ ] Add dark mode media query
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Verify color contrast (WCAG AA)

### Step 3: Create JavaScript (30 mins)
- [ ] Write dropdown toggle logic
- [ ] Add geo-location functionality
- [ ] Implement selection storage
- [ ] Add event listeners

### Step 4: Create Liquid Template (20 mins)
- [ ] Build HTML structure
- [ ] Integrate JavaScript & CSS
- [ ] Add accessibility attributes (ARIA)
- [ ] Test on live theme

### Step 5: Integrate into Header (10 mins)
- [ ] Add component to header-actions.liquid
- [ ] Position correctly (left of cart icon)
- [ ] Test layout on mobile/desktop

### Step 6: Testing & Refinement (20 mins)
- [ ] Test all 3 districts
- [ ] Test all municipalities & areas
- [ ] Test auto-detect (mock geolocation)
- [ ] Test light/dark mode toggle
- [ ] Test mobile responsiveness
- [ ] Test accessibility (keyboard navigation)

### Step 7: Deployment & Git Commit (5 mins)
- [ ] Auto-commit all changes
- [ ] Push to GitHub (Shopify sync)
- [ ] Verify on live site

---

## 🔌 Integration Points

### Shopify Cart System
```liquid
{% if cart.attributes['location'] %}
  Selected: {{ cart.attributes['location'] }}
{% endif %}
```

### Customer Attributes
```javascript
// For logged-in users, save to customer attributes
// API call to Shopify Admin API
```

### Session Storage (Anonymous Users)
```javascript
// localStorage fallback for non-logged-in users
localStorage.setItem('quickbee_location', selectedArea);
```

---

## 🎯 Deliverables

1. ✅ `areas-data.json` - Location hierarchy data
2. ✅ `location-picker-component.liquid` - Main template
3. ✅ `location-picker.js` - Functionality & geo-location
4. ✅ `location-picker.css` - Styling (light + dark modes)
5. ✅ Updated `header-actions.liquid` - Integration
6. ✅ Git commits with auto-deployment

---

## 📊 Testing Checklist

### Functional Testing
- [ ] Dropdown opens/closes correctly
- [ ] All districts display
- [ ] All municipalities load on district click
- [ ] All areas load on municipality click
- [ ] Selection saves correctly
- [ ] Auto-detect shows correct area (or fallback)
- [ ] Back navigation works (collapse dropdown levels)

### Visual Testing
- [ ] Light mode styling correct
- [ ] Dark mode styling correct
- [ ] Primary color (#000F9F) consistent
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Screen reader announces options
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present

### Compatibility Testing
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Geo-location works (with permission)
- [ ] Geo-location gracefully degrades

---

## ⚡ Performance Metrics

- **Initial Load:** < 1.5 KB (JSON data)
- **Script Size:** ~15 KB (unminified, <5 KB minified)
- **CSS Size:** ~8 KB (unminified, <2 KB minified)
- **Geo-location API:** Native browser, no external dependencies
- **Total Bundle Addition:** ~7 KB (minified + gzipped)

---

## 🚀 Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Data Processing | 10 min | ⏳ |
| 2 | CSS Development | 20 min | ⏳ |
| 3 | JavaScript Development | 30 min | ⏳ |
| 4 | Liquid Template | 20 min | ⏳ |
| 5 | Header Integration | 10 min | ⏳ |
| 6 | Testing & QA | 20 min | ⏳ |
| 7 | Deployment | 5 min | ⏳ |
| **TOTAL** | | **115 minutes** | ⏳ |

---

## 🔐 Security Considerations

1. **Geolocation Privacy:** Request explicit user permission, handle denial gracefully
2. **Data Validation:** Validate user selection before saving
3. **XSS Prevention:** Sanitize all user inputs (Shopify Liquid handles this)
4. **CSRF Protection:** Use Shopify's built-in token system
5. **Rate Limiting:** No external API calls (all data is local)

---

## 📚 Dependencies

- **Browser APIs:** Geolocation API (native)
- **Shopify:** Cart attributes, customer data
- **CSS:** CSS Variables, @media (prefers-color-scheme)
- **JavaScript:** ES6 Modules, fetch API
- **Liquid:** Standard Shopify Liquid syntax

**No external libraries required!**

---

## 💡 Future Enhancements

1. **Delivery Time Estimation:** Show estimated delivery for selected area
2. **Area-Based Pricing:** Adjust cart prices based on location
3. **Favorited Locations:** Save multiple frequent addresses
4. **Location History:** Recent selections for quick access
5. **Map Integration:** Show selected area on interactive map
6. **Multi-Language Support:** Translated area names

---

## 📞 Support & Maintenance

- **Git Commits:** Auto-commit on every change (no delays)
- **Dark Mode Testing:** Verify on both `light` and `dark` prefers-color-scheme
- **Mobile Testing:** Test on iOS (Safari) and Android (Chrome)
- **Monitoring:** Track selection patterns in analytics
- **Updates:** Keep geo-location coordinates up-to-date if expansion planned

---

**Plan Ready for Implementation! 🚀**

*Next: Start Phase 1 (Data Processing)*
