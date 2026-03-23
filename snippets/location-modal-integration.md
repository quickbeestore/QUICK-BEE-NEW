# Location Detection Modal - Integration Guide

## Overview
The location detection modal provides a two-stage flow for users to select their delivery location:
1. **Detect Automatically** - Uses GPS to auto-detect location and fill the form
2. **Add Manually** - Manual entry of address

## Features
✅ GPS-based auto-detection with reverse geocoding
✅ Manual address entry option
✅ Real-time delivery time estimation
✅ Responsive design (mobile & desktop)
✅ Local storage persistence
✅ Success confirmation state
✅ Accessibility support

## Integration

### Step 1: Add Modal to Header/Layout
In your `header.liquid` or main layout file, add:

```liquid
{% render 'location-detection-modal' %}
```

### Step 2: Trigger Modal
Show the location modal programmatically:

```javascript
// Show modal
window.showLocationModal();

// Hide modal
window.hideLocationModal();

// Get selected location
const location = window.getSelectedLocation();
```

### Step 3: Listen for Location Selection
```javascript
// Option 1: Custom event
window.addEventListener('locationSelected', (event) => {
  const location = event.detail;
  console.log('Selected:', location);
  // Update delivery estimates, show products, etc.
});

// Option 2: Callback function
window.QB_LOCATION_CALLBACK = function(location) {
  console.log('Location selected:', location);
};
```

## Location Object Structure
```javascript
{
  street: "Street Address",
  city: "City Name",
  zip: "Postal Code",
  latitude: 27.7172,
  longitude: 85.3240,
  mode: "auto" or "manual",
  timestamp: "2026-03-23T10:30:00Z"
}
```

## Showing Modal on Page Load
To show modal automatically on first visit (no saved location):

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('qb_selected_location');
  if (!saved) {
    window.showLocationModal();
  }
});
```

## Styling Customization
Key CSS variables that can be overridden:

```css
:root {
  --qb-location-primary-color: #7a14ac;
  --qb-location-border-color: #e8e8e8;
  --qb-location-error-color: #dc2626;
}
```

## Updating Address Form
When location is selected, auto-fill the checkout form:

```javascript
window.addEventListener('locationSelected', (event) => {
  const location = event.detail;

  // Populate checkout form
  const form = document.getElementById('qbCheckoutForm');
  if (form) {
    document.getElementById('qbStreet').value = location.street;
    document.getElementById('qbCity').value = location.city;
    document.getElementById('qbZip').value = location.zip;
  }
});
```

## Delivery Time Estimation
The modal includes a basic delivery time estimation (16-21 mins).

To use your actual API:
1. Modify the `estimateDeliveryTime()` function
2. Call your delivery time API endpoint
3. Update `deliveryTime.textContent` with actual estimate

```javascript
// In location-detection-modal.liquid, replace estimateDeliveryTime()
function estimateDeliveryTime() {
  const lat = formInputs.lat.value;
  const lng = formInputs.lng.value;

  fetch('/api/delivery-time', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  })
  .then(res => res.json())
  .then(data => {
    deliveryTime.textContent = `${data.minTime}-${data.maxTime} mins`;
    deliveryInfo.style.display = 'block';
  });
}
```

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires HTTPS)
- iOS Safari: Full support (requires HTTPS)

⚠️ Note: Geolocation requires HTTPS in production

## Localization
To translate modal text, modify the following keys:

```liquid
{%- render 'location-detection-modal',
  title: 'Select Delivery Location',
  detect_label: 'Detect Automatically',
  detect_desc: 'Use GPS to find your location',
  manual_label: 'Add Manually',
  manual_desc: 'Enter your address manually',
  finding_location: 'Finding your location...',
  select_btn: 'Select Location',
  cancel_btn: 'Cancel'
-%}
```

## Testing Checklist
- [ ] GPS detection works on mobile
- [ ] Manual entry works on desktop
- [ ] Form validation prevents invalid submissions
- [ ] Delivery time displays correctly
- [ ] Location persists after page reload
- [ ] Modal closes on outside click
- [ ] Keyboard escape closes modal
- [ ] Mobile responsive layout works
- [ ] Geolocation permission prompts correctly

## Troubleshooting

### GPS Not Working
- Ensure HTTPS is enabled
- Check browser geolocation permissions
- Verify user clicked "Allow" in geolocation prompt

### Address Not Auto-filling
- Check browser console for geocoding API errors
- Ensure latitude/longitude are being captured
- Fall back to manual entry if API fails

### Modal Not Appearing
- Verify snippet is included in layout
- Check browser console for JavaScript errors
- Ensure modal ID `qbLocationModal` is unique
