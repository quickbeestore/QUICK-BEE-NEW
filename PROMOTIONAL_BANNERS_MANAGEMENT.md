# 🎨 QuickBEE Promotional Banners Management Guide
**Updated:** March 23, 2026
**Domain:** quickbee.store

---

## 📋 Overview

This guide explains how to manage promotional banners on your QuickBEE homepage. The promotional banners are configured through the Shopify Theme Customizer (not in code), making them easy to update without touching the codebase.

---

## 🎯 Current Banner Status

### ✅ ACTIVE BANNERS (To Keep):
1. **Buy 1 Get 1 Groceries** - `hero-banner.png`
2. **Order Clothes Washing 24/7** - `banner-clothes-washing.png`
3. **Order Vegetables Directly from Farm 24/7** - `banner-vegetables.png`
4. **Order Dairy Products 24/7** - `banner-dairy.png`

### ❌ BANNERS TO REMOVE:
1. **Snacks** - `banner-snacks.png`
2. **Oral Care** - `banner-oral-care.png`
3. **Order 24/7 Groceries & More** - `banner-groceries-more.png`
4. **Beer Month: Free Delivery** - `banner-beer.png`

---

## 🛠️ How to Manage Banners

### Option 1: Through Shopify Admin (Easiest)

#### Step 1: Access Shopify Admin
1. Go to `https://admin.shopify.com/`
2. Log in to your QuickBEE store account
3. Select your store (quickbee.store)

#### Step 2: Edit Home Page
1. Click **Online Store** > **Pages**
2. Find and click **Home** page
3. Click **Edit** or **Customize**

#### Step 3: Manage Promotional Banners Section
1. Look for the promotional banners section on the page
2. You'll see blocks for each banner
3. **To Remove a Banner:**
   - Click on the banner block
   - Look for a **Delete** or **Remove** button
   - Click to remove
4. **To Reorder Banners:**
   - Use drag-and-drop to reorder (if available)
5. **To Disable Without Removing:**
   - Look for an **Enable/Disable** toggle
   - Turn OFF for banners to hide

#### Step 4: Save Changes
1. Click **Save** button
2. Changes should be live immediately
3. Test on desktop and mobile

### Option 2: Through Theme Customizer

#### Step 1: Access Theme Customizer
1. From Shopify Admin, click **Online Store**
2. Click **Themes**
3. Find your active theme
4. Click **Customize**

#### Step 2: Edit Sections
1. Click on the **Home** section in the left sidebar
2. Look for "Promotional Banners" or similar section
3. Each banner should be a block within the section
4. Click on each block to view its settings

#### Step 3: Remove Banners
1. Select the banner block you want to remove
2. Click the **Remove** button (usually shown as an X or trash icon)
3. Confirm removal if prompted

#### Step 4: Save
1. Click **Save** button
2. Preview changes before publishing

---

## 📊 Banner Asset Files

All banner images are stored in the theme assets folder. Here's the complete list:

| Banner Name | Filename | Status |
|-------------|----------|--------|
| Buy 1 Get 1 Groceries | `hero-banner.png` | ✅ KEEP |
| Clothes Washing 24/7 | `banner-clothes-washing.png` | ✅ KEEP |
| Vegetables from Farm | `banner-vegetables.png` | ✅ KEEP |
| Dairy Products 24/7 | `banner-dairy.png` | ✅ KEEP |
| Snacks | `banner-snacks.png` | ❌ REMOVE |
| Oral Care | `banner-oral-care.png` | ❌ REMOVE |
| Groceries & More | `banner-groceries-more.png` | ❌ REMOVE |
| Beer Month | `banner-beer.png` | ❌ REMOVE |
| Pet Care | `banner-pet-care.png` | ℹ️ Not in promo section |
| Baby Care | `banner-baby-care.png` | ℹ️ Not in promo section |
| Drinks | `banner-drinks.png` | ℹ️ Not in promo section |
| Farm Fresh | `banner-farm-fresh.png` | ℹ️ Not in promo section |

---

## 🔧 Code Location (For Reference)

### Promotional Banner Section Files:
- **Main Section:** `sections/qb-promotions.liquid`
- **Banner Carousel:** `snippets/banner-carousel.liquid`
- **Promo Card:** `snippets/promo-card.liquid`
- **Styles:** `assets/qb-promotions.css`
- **Scripts:** `assets/qb-promotions.js`

### Homepage Section Files:
- **Main Homepage:** `sections/quickbee-homepage.liquid`
- **Index Template:** `templates/index.liquid`

---

## 📱 Testing After Changes

After removing banners, test on:

1. **Desktop Browser**
   - Chrome, Firefox, Safari
   - Check responsiveness at 1024px+
   - Verify banner spacing

2. **Tablet View**
   - iPad size (768px)
   - Check layout shifts
   - Verify touch interactions

3. **Mobile View**
   - iPhone size (375px)
   - Check banner size and readability
   - Verify click targets

4. **Different Devices**
   - Test on real phones if possible
   - Check on various Safari/Chrome versions
   - Verify on slow 3G connections

---

## 🎨 Banner Customization Tips

### To Change Banner Content:
1. Access the banner block in Theme Customizer
2. Look for settings like:
   - **Title/Heading**
   - **Subtitle/Description**
   - **Image**
   - **Link/CTA Button**
   - **Colors**
   - **Alignment**

### To Change Banner Images:
1. Click on the banner's image field
2. Upload a new image or select from library
3. Recommended size: **1200x400px** (or check current specs)
4. Format: PNG or JPG
5. Optimize for web (keep file size under 200KB)

### To Add New Banners:
1. Go to the promotional banners section
2. Click **Add Block** or **Add Banner**
3. Configure the new banner settings
4. Save and test

---

## ⚠️ Important Notes

1. **Banner Removal is Safe:**
   - Removing banners from the display won't delete files
   - Image assets remain in the theme
   - You can re-enable anytime

2. **No Code Changes Needed:**
   - Banners are managed through admin interface
   - No GitHub commits required for banner changes
   - Changes are immediately live

3. **Performance Impact:**
   - Each banner image adds slight page load
   - Fewer banners = faster page load
   - Removing 4 banners will improve PageSpeed

4. **Mobile Optimization:**
   - Banners might stack on mobile
   - Check layout on different screen sizes
   - Consider hiding some banners on mobile if needed

---

## 📊 Analytics Impact

When you remove banners:
- **Pros:**
  - Faster page load (fewer images)
  - Cleaner homepage experience
  - Focus on core 4 promotions
  - Reduced visual clutter

- **Metrics to Monitor:**
  - Page load time (should improve)
  - Bounce rate (might change)
  - Conversion rate (monitor closely)
  - User engagement (track clicks)

---

## 🆘 Troubleshooting

### Banners Not Showing:
1. Check if blocks are **enabled** (not hidden)
2. Verify images are uploaded correctly
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check on incognito/private window

### Banners Showing Incorrectly:
1. Check image dimensions
2. Verify CSS isn't conflicting
3. Check browser compatibility
4. Review responsive settings

### Changes Not Saving:
1. Check internet connection
2. Try in different browser
3. Disable browser extensions
4. Wait a few minutes and try again

---

## 📞 Support

If you need help managing banners:

1. **Check Shopify Help:**
   - https://help.shopify.com/en/manual/online-store/themes

2. **Review Theme Documentation:**
   - Check theme settings in Shopify Admin

3. **Contact Support:**
   - Email: support@quickbee.com
   - Include screenshots of issues

---

## 🎯 Quick Checklist

- [ ] Access Shopify Admin (admin.shopify.com)
- [ ] Go to Online Store > Pages > Home
- [ ] Find promotional banners section
- [ ] Remove the 4 unwanted banners
- [ ] Save changes
- [ ] Test on desktop
- [ ] Test on tablet
- [ ] Test on mobile
- [ ] Verify all 4 active banners display correctly
- [ ] Monitor analytics for next 7 days

---

**Last Updated:** March 23, 2026
**Status:** Ready for Implementation
**Domain:** quickbee.store

