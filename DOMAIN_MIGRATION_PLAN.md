# QuickBEE Domain Migration Plan
**From:** `yetinepal.myshopify.com`
**To:** `quickbee.store`
**Date:** March 23, 2026

---

## 📋 Project Overview

This document outlines the required changes to migrate QuickBEE from the Shopify test domain to the custom domain `quickbee.store`.

---

## 🔍 Files That Need Updates

### 1. **Primary Update - Shop Domain Reference**
**File:** `/sections/quickbee-header.liquid`
**Line:** 3753
**Current:** `shopDomain: 'yetinepal.myshopify.com',`
**Change to:** `shopDomain: 'quickbee.store',`
**Impact:** This affects API calls for customer messages and communication

---

## 🎨 Promotional Banners Management

### Current Setup
The promotional banners are managed through:
- **Section:** `sections/qb-promotions.liquid`
- **Renders:** `snippets/banner-carousel.liquid` and `snippets/promo-card.liquid`
- **Style:** `assets/qb-promotions.css`
- **JavaScript:** `assets/qb-promotions.js`

### Current Banners (To Review):
1. ✅ **BUY 1 GET 1 GROCERIES** - Keep
2. ✅ **ORDER CLOTHES WASHING 24/7** - Keep
3. ✅ **ORDER VEGETABLES DIRECTLY FROM THE FARM** - Keep
4. ✅ **ORDER DAIRY PRODUCTS 24/7** - Keep
5. ❌ **SNACKS** - Remove
6. ❌ **ORAL CARE** - Remove
7. ❌ **ORDER 24/7 GROCERIES & MORE** - Remove
8. ❌ **BEER MONTH: FREE DELIVERY** - Remove

---

## 📂 Files Affected by This Migration

### Tier 1: Critical Updates (Must Change)
- [ ] `sections/quickbee-header.liquid` - Update shopDomain

### Tier 2: Configuration (May Need Updates)
- [ ] `config/settings_data.json` - Review theme settings
- [ ] `.git` config - Ensure GitHub references are correct

### Tier 3: Documentation (Update for Clarity)
- [ ] `README_LOCATION_PICKER.md` - Update any domain references
- [ ] `DARK_MODE_AUDIT.md` - Update live URL reference

---

## ✅ Checklist

- [ ] **Update shopDomain in quickbee-header.liquid**
- [ ] **Remove lower 4 promotional banners from homepage**
- [ ] **Keep upper 4 promotional banners active**
- [ ] **Test API communication with new domain**
- [ ] **Update documentation files**
- [ ] **Verify Shopify Admin settings point to quickbee.store**
- [ ] **Update DNS records (if not already done)**
- [ ] **Test checkout flow with new domain**
- [ ] **Verify all customer communication emails use correct domain**

---

## 🚀 Implementation Steps

### Step 1: Update Shop Domain
1. Open `sections/quickbee-header.liquid`
2. Find line 3753: `shopDomain: 'yetinepal.myshopify.com',`
3. Replace with: `shopDomain: 'quickbee.store',`
4. Save and test

### Step 2: Manage Promotional Banners
1. Access Shopify Admin
2. Go to Homepage sections
3. Disable the lower 4 promotional banners:
   - Snacks
   - Oral Care
   - Groceries & More
   - Beer Month
4. Verify upper 4 banners remain active

### Step 3: Test & Verify
- [ ] Test on desktop version
- [ ] Test on mobile version
- [ ] Verify API calls work with new domain
- [ ] Check customer communication flows

---

## 🔗 Additional Considerations

### Shopify Admin URL Update
- Old: `https://admin.shopify.com/` (yetinepal.myshopify.com)
- New: `https://admin.shopify.com/` (quickbee.store dashboard)

### Email & Communications
- All customer emails should reference `support@quickbee.com` (currently correct in code)
- Order confirmation emails will use new domain automatically via Shopify

### SEO Impact
- Ensure old domain redirects to new domain (301 redirects)
- Update Google Search Console
- Update sitemap.xml references
- Update robots.txt if applicable

---

## 📊 Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Update shopDomain | ⏳ Pending | Line 3753 of quickbee-header.liquid |
| Remove 4 banners | ⏳ Pending | Via Shopify Admin or code config |
| Test API calls | ⏳ Pending | After domain update |
| DNS verification | ⏳ Pending | Confirm domain is active |
| Documentation update | ⏳ Pending | Update all references |

---

## 📝 Notes for Future Reference

- The codebase is a Shopify theme with custom sections and snippets
- QuickBee uses custom animations and carousel functionality
- Theme has dark mode support with multiple color schemes
- Location picker functionality is implemented for delivery zones (Bhaktapur, Lalitpur, Kathmandu)

