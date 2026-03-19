# Location Picker - Testing Checklist

**Date:** March 19, 2026
**Version:** 1.0.0
**Status:** Ready for QA

---

## ✅ Functional Testing

### Dropdown Interaction
- [ ] Button appears in header (before cart icon, after wallet)
- [ ] Button shows "Select Location" or previously selected area
- [ ] Clicking button opens dropdown
- [ ] Dropdown displays all 3 districts
- [ ] Auto-detect button appears at top
- [ ] Clicking district shows its municipalities
- [ ] "Back" button appears when in municipality/area view
- [ ] Back button collapses to previous level
- [ ] Clicking municipality shows its areas
- [ ] Clicking area closes dropdown and saves selection
- [ ] Button text updates to selected area name

### Auto-Detect Functionality
- [ ] Auto-detect button visible and clickable
- [ ] Clicking triggers geolocation permission request
- [ ] Button shows "Detecting..." state while requesting
- [ ] On success: Shows "✓ Location Detected!" and selects nearest area
- [ ] On failure: Shows "✗ Detection Failed" for 3 seconds
- [ ] Fallback: If permission denied, reverts to dropdown selection
- [ ] Works on both mobile (iOS) and desktop (Chrome, Firefox, Safari)

### Selection Storage
- [ ] Selected location saves to localStorage
- [ ] Selected location saves to Shopify cart attributes
- [ ] On page refresh, previously selected location displays
- [ ] localStorage key: `quickbee_selected_location`
- [ ] Cart attribute key: `location`
- [ ] Timestamp saved with selection (ISO format)

### Breadcrumb Navigation
- [ ] Breadcrumb shows selected path
- [ ] Updates when navigating deeper into hierarchy
- [ ] Example: "Kathmandu / Kathmandu Metropolitan City"
- [ ] Disappears when back at district level

### Keyboard Navigation
- [ ] Tab key navigates through items
- [ ] Arrow Up/Down moves between items
- [ ] Enter key selects item
- [ ] Escape key closes dropdown
- [ ] Focus visible on all interactive elements
- [ ] Focus management proper when opening/closing

### Error Handling
- [ ] Graceful failure if areas-data.json fails to load
- [ ] No console errors on normal operation
- [ ] Geolocation errors handled gracefully
- [ ] CORS issues don't break component

---

## 🎨 Visual Testing

### Light Mode
- [ ] Background: #ffffff (white)
- [ ] Text: #000000 (black)
- [ ] Border: #e0e0e0 (light gray)
- [ ] Primary color: #000F9F (dark blue)
- [ ] Hover state: Light gray background (#f5f5f5)
- [ ] Selected state: Light blue background (#f0f5ff)

### Dark Mode
- [ ] Background: #1a1a1a (dark gray)
- [ ] Text: #ffffff (white)
- [ ] Border: #404040 (medium gray)
- [ ] Primary color: #000F9F (dark blue - SAME as light mode) ✓
- [ ] Hover state: Darker gray (#2a2a2a)
- [ ] Selected state: Dark blue background (#1a2a4a)

### Theme Integration
- [ ] Button inherits header colors
- [ ] Dropdown inherits page background/foreground colors
- [ ] No color conflicts with existing header elements
- [ ] Matches QuickBEE visual style

### Animations
- [ ] Dropdown opens smoothly (no jank)
- [ ] Hover effects smooth transition
- [ ] Arrow icon rotates on open/close
- [ ] Auto-detect pulse animation works
- [ ] Reduced motion preference respected (no animations)

---

## 📱 Responsive Design

### Desktop (> 1024px)
- [ ] Location picker button visible with full label text
- [ ] Dropdown appears below button
- [ ] All levels clickable and functional
- [ ] Landmarks show on area hover (tooltip)
- [ ] Min-width: 180px respected

### Tablet (768px - 1024px)
- [ ] Button size: 160px
- [ ] Font size: 12px
- [ ] Dropdown max-height: 350px
- [ ] All functionality works

### Mobile (< 768px)
- [ ] Button shows icon only
- [ ] Button label hidden
- [ ] Button smaller (120px width, icon only)
- [ ] Dropdown positioned correctly (may shift left)
- [ ] Dropdown max-height: 300px
- [ ] Touch targets > 44px (accessibility)
- [ ] No horizontal scroll
- [ ] Font size: 11px

### Very Small (< 480px)
- [ ] Everything fits on screen
- [ ] Button: 140px width
- [ ] Dropdown: 200px width
- [ ] All text readable
- [ ] Scrollable dropdown if needed

---

## ♿ Accessibility Testing

### ARIA Labels
- [ ] Button has `aria-label="Select delivery location"`
- [ ] Button has `aria-expanded` (true/false)
- [ ] Button has `aria-haspopup="listbox"`
- [ ] Dropdown has `role="listbox"`
- [ ] Items have `role="option"`
- [ ] Properly nested structure

### Keyboard Navigation
- [ ] Tab navigation works in all browsers
- [ ] Focus indicator visible (outline or ring)
- [ ] Keyboard shortcuts work (Enter, Escape, Arrows)
- [ ] Screen reader announces items
- [ ] Screen reader announces selections

### Color Contrast
- [ ] Button text passes WCAG AA (4.5:1 ratio)
- [ ] Dropdown text passes WCAG AA
- [ ] Selected item readable (not too faint)
- [ ] Hover state provides contrast improvement

### Screen Reader Testing
- [ ] Tested with: NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)
- [ ] Component announces: "Location picker, select delivery location"
- [ ] Districts announced as options
- [ ] Selected area announced
- [ ] Back button labeled properly

### Reduced Motion
- [ ] No animations play on `prefers-reduced-motion: reduce`
- [ ] Transitions disabled
- [ ] Pulse animation disabled
- [ ] Functionality unchanged

### High Contrast Mode
- [ ] Borders visible (2px minimum width)
- [ ] Text readable
- [ ] Focus indicators clear

---

## 🌐 Cross-Browser Testing

### Chrome/Chromium
- [ ] Latest version
- [ ] Mobile version
- [ ] All features work

### Firefox
- [ ] Latest version
- [ ] Mobile version (Firefox Mobile)
- [ ] All features work

### Safari
- [ ] Latest version
- [ ] iOS Safari (iPhone)
- [ ] iPad Safari
- [ ] Geolocation works on iOS

### Edge
- [ ] Latest version
- [ ] All features work

---

## 📊 Performance Testing

### Bundle Size
- [ ] JS file: ~15 KB (unminified, <5 KB minified)
- [ ] CSS file: ~14 KB (unminified, <4 KB minified)
- [ ] JSON data: ~3 KB
- [ ] Total: <12 KB (minified + gzipped)

### Load Time
- [ ] Component initializes within 100ms
- [ ] Dropdown renders immediately on click
- [ ] No layout shift (CLS) when opening/closing
- [ ] No paint jank

### Memory
- [ ] No memory leaks on repeated open/close
- [ ] Event listeners properly cleaned up
- [ ] No excessive DOM nodes created

---

## 🚀 Integration Testing

### Cart Functionality
- [ ] Selected location appears in cart.attributes.location
- [ ] Cart updates properly via /cart/update.js
- [ ] Cart retains location on page reload
- [ ] Location persists through checkout

### Analytics
- [ ] Custom event "locationChanged" dispatched
- [ ] Event detail contains: district, municipality, area, landmarks
- [ ] Google Analytics (if enabled) receives event
- [ ] Custom event "quickbee:locationSelected" dispatched

### Shopify Integration
- [ ] Works with all Shopify themes
- [ ] Compatible with theme editor preview
- [ ] Publishes section without errors
- [ ] No conflicts with other snippets

---

## 📝 Data Validation

### Areas Data
- [ ] JSON properly formatted
- [ ] All 3 districts present
- [ ] All 26 municipalities present
- [ ] All 53 areas present
- [ ] No duplicate IDs
- [ ] All landmarks populated
- [ ] No null/undefined values

### Data Structure
- [ ] District → Municipality → Area hierarchy correct
- [ ] Slugs generate properly (no spaces, lowercase)
- [ ] IDs are unique and valid

---

## 🔒 Security Testing

### XSS Prevention
- [ ] No unescaped user input
- [ ] All area names properly escaped in Liquid
- [ ] No innerHTML usage with user data
- [ ] localStorage data sanitized

### CSRF Protection
- [ ] Shopify CSRF token included in cart update
- [ ] /cart/update.js call uses proper headers
- [ ] No sensitive data in URLs

### Data Privacy
- [ ] Geolocation data not logged
- [ ] No tracking of location data beyond cart
- [ ] User can deny geolocation permission

---

## 🐛 Bug Testing

### Known Issues (if any)
- [ ] Document any bugs found during testing
- [ ] Note browser-specific issues
- [ ] Create GitHub issues for tracked bugs

### Regression Testing
- [ ] Existing header functionality unchanged
- [ ] Cart icon still functional
- [ ] Account menu still functional
- [ ] Wallet button still functional
- [ ] Mobile menu not broken

---

## ✨ Edge Cases

- [ ] Very long area names (test truncation)
- [ ] Very long landmark lists (test scroll)
- [ ] Rapid open/close clicks
- [ ] Selecting same area twice
- [ ] Clearing cart and checking location persistence
- [ ] Logging in/out with saved location
- [ ] Theme switching (light ↔️ dark)
- [ ] Resizing window while dropdown open
- [ ] Mobile: landscape to portrait rotation

---

## 📋 Test Results Summary

| Category | Status | Notes |
|----------|--------|-------|
| Functional | 🟡 Pending | Awaiting manual testing |
| Visual | 🟡 Pending | Light/dark mode verification needed |
| Responsive | 🟡 Pending | Mobile testing required |
| Accessibility | 🟡 Pending | Screen reader testing needed |
| Cross-browser | 🟡 Pending | Multi-browser verification needed |
| Performance | 🟡 Pending | Bundle size analysis needed |
| Integration | 🟡 Pending | Live cart testing needed |
| Security | 🟡 Pending | Security audit needed |

---

## 🎯 Sign-Off

- [ ] All functional tests pass
- [ ] All visual tests pass
- [ ] All accessibility tests pass
- [ ] All performance requirements met
- [ ] No critical bugs
- [ ] Ready for production

**Tested by:** ________________
**Date:** ________________
**Notes:** ________________

---

## 📞 Support & Maintenance

- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions
- **Documentation:** `/LOCATION_PICKER_PLAN.md`
- **Code:** 5 files, ~2,000 lines total

---

*Last Updated: March 19, 2026*
