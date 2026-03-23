# Location Detection Modal - Setup Example

## Quick Start

### 1. Add Modal to Header
Edit your `sections/header.liquid` and add this snippet at the very end (before closing tag):

```liquid
<!-- Add this at the end of header.liquid, before </header> or similar closing tag -->
{% render 'location-detection-modal' %}
```

### 2. Add Location Button to Header Actions
Edit `snippets/header-actions.liquid` and add this before the closing div:

```liquid
<!-- Add location selection button -->
<div class="header-action" style="margin-right: 8px;">
  {% render 'location-button' %}
</div>
```

Or in the main header navigation bar, add:
```liquid
{% render 'location-button' %}
```

### 3. Show Modal on Page Load
Add this to your `sections/quickbee-homepage.liquid` after the opening `<script>` tag:

```javascript
<script>
// Show location modal on first visit if no location selected
document.addEventListener('DOMContentLoaded', () => {
  const hasLocation = localStorage.getItem('qb_selected_location');
  if (!hasLocation && window.showLocationModal) {
    // Optional: uncomment to auto-show on first visit
    // window.showLocationModal();
  }
});

// Listen for location selection
window.addEventListener('locationSelected', (event) => {
  const location = event.detail;
  console.log('📍 Location Selected:', location);

  // Pre-fill checkout form
  if (document.getElementById('qbCheckoutForm')) {
    document.getElementById('qbStreet').value = location.street;
    document.getElementById('qbCity').value = location.city;
    if (location.zip) document.getElementById('qbZip').value = location.zip;
  }

  // Update page content based on location
  updateDeliveryZone(location);
});

// Update delivery zone, availability, etc.
function updateDeliveryZone(location) {
  console.log('Updating zone for:', location.city);
  // Call your backend API to update available products, delivery fees, etc.
  // fetch('/api/update-location', { method: 'POST', body: JSON.stringify(location) })
}
</script>
```

## Complete Header Integration Example

### Option 1: Add Button to Top Navigation
In your header, add the location button next to search:

```liquid
<div class="header-search-and-location">
  <!-- Location Button -->
  {% render 'location-button' %}

  <!-- Search Bar -->
  {% render 'search', style: 'modal' %}
</div>

<!-- Location Modal (at end of header) -->
{% render 'location-detection-modal' %}
```

### Option 2: Add Button to Hero Section
In `sections/quickbee-homepage.liquid`, add before the search bar:

```liquid
<div class="qb-hero">
  <!-- Location Selector Button -->
  <div style="margin-bottom: 20px;">
    {% render 'location-button' %}
  </div>

  <!-- Existing search bar -->
  <div class="qb-search">
    <!-- search implementation -->
  </div>
</div>

<!-- Modal -->
{% render 'location-detection-modal' %}
```

## Flow Diagram

```
User Visit
    ↓
[No Saved Location?] → Show "Select Location" Button
    ↓
User Clicks Button
    ↓
┌─────────────────────────────────────┐
│  Choose Method                       │
│  • Detect Automatically (GPS)        │
│  • Add Manually                      │
└──────────┬──────────────────────────┘
           ↓
    ┌──────────────┐
    │              │
 GPS AUTO      MANUAL
    │              │
    ↓              ↓
 Find GPS    Enter Address
 Location    Manually
    │              │
    └──────┬───────┘
           ↓
   Auto-fill Form
   (Street, City, Zip, Lat/Lng)
           ↓
   Show Delivery Time
   (16-21 mins estimated)
           ↓
   [Select Location] Button
           ↓
   Save to localStorage
   Trigger locationSelected event
           ↓
   Auto-fill Checkout Form
   Update Page Content
           ↓
   ✓ Location Set & Ready
```

## JavaScript Events & API

### Show Modal Programmatically
```javascript
// Trigger from any button click
const btn = document.querySelector('.any-trigger-button');
btn.addEventListener('click', () => {
  window.showLocationModal();
});
```

### Listen for Location Selection
```javascript
// All listeners receive location object
window.addEventListener('locationSelected', (event) => {
  const { street, city, zip, latitude, longitude, mode, timestamp } = event.detail;

  // Update UI with selected location
  console.log(`Selected: ${street}, ${city}`);
  console.log(`Coordinates: ${latitude}, ${longitude}`);
  console.log(`Detection mode: ${mode}`); // 'auto' or 'manual'
});
```

### Get Current Location
```javascript
const currentLocation = window.getSelectedLocation();
if (currentLocation) {
  console.log('Current location:', currentLocation.city);
} else {
  console.log('No location selected yet');
}
```

### Callback Function
```javascript
window.QB_LOCATION_CALLBACK = function(location) {
  // This runs when location is selected
  console.log('Location confirmed:', location);
};
```

## Styling & Customization

### Change Primary Color
```css
/* Add to your theme CSS */
.qb-location-modal {
  --qb-location-primary: #your-color;
}

.qb-location-method-btn:hover {
  border-color: #your-color;
}

.qb-location-btn-primary {
  background: #your-color;
}
```

### Responsive Sizes
The modal automatically adjusts for:
- **Mobile** (< 480px): Full-width bottom sheet
- **Tablet** (480-1024px): Centered modal
- **Desktop** (> 1024px): Centered modal

### Custom Delivery Time
Modify in `location-detection-modal.liquid`:

```javascript
function estimateDeliveryTime() {
  // Replace with your API call
  const baseTime = 16;

  // Call your backend
  fetch('/api/delivery-estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: formInputs.lat.value,
      longitude: formInputs.lng.value,
      city: formInputs.city.value
    })
  })
  .then(res => res.json())
  .then(data => {
    deliveryTime.textContent = `${data.min}-${data.max} mins`;
    deliveryInfo.style.display = 'block';
  })
  .catch(err => {
    // Fallback to default estimate
    deliveryTime.textContent = `${baseTime}-${baseTime + 5} mins`;
    deliveryInfo.style.display = 'block';
  });
}
```

## Mobile Testing

### iOS Safari
- Test with HTTPS only (localhost:8443 for local testing)
- Allow location access when prompted
- Verify GPS coordinates are captured

### Android Chrome
- Enable location in Chrome settings
- Test both high accuracy and normal mode
- Verify reverse geocoding works

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal not showing | Verify `location-detection-modal.liquid` is included in header |
| GPS not working | Ensure HTTPS, check browser permissions, test on real device |
| Geocoding fails | Falls back to empty form, user can enter manually |
| Location not persisting | Check localStorage is enabled in browser |
| Button not visible | Verify `location-button.liquid` is rendered in correct position |

## Production Checklist

- [ ] Modal snippet added to header.liquid
- [ ] Location button added to header or hero
- [ ] Event listeners set up in homepage script
- [ ] Delivery time API integrated
- [ ] Checkout form auto-fill tested
- [ ] Mobile responsive tested
- [ ] Geolocation permission prompts work
- [ ] Error messages display correctly
- [ ] localStorage persistence works
- [ ] Analytics tracking added (optional)
- [ ] A/B test auto-show vs on-click (optional)

## Next Steps

1. ✅ Add modal and button to header
2. ✅ Test GPS detection on mobile device
3. ✅ Integrate with your delivery time API
4. ✅ Auto-fill checkout form
5. ✅ Track analytics (location selections, method used)
6. ✅ Optimize delivery time accuracy
7. ✅ Add location favorites/recent locations
8. ✅ Integrate with payment/checkout flow
