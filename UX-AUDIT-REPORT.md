# FOLIKA — ১০ এজেন্ট UX অডিট রিপোর্ট

**তারিখ:** ২৯ আগস্ট, ২০২৬  
**পদ্ধতি:** ১০টি স্বাধীন এজেন্ট পুরো প্রজেক্ট পর্যালোচনা → সমস্যা নোট → উচ্চ-প্রভাব ফিক্স

---

## এজেন্টভিত্তিক মূল খুঁজ

| # | এজেন্ট | মূল সমস্যা |
|---|--------|------------|
| 1 | Login/Auth | ডেমো OTP স্ক্রিনে, resend নেই, error CSS ভাঙা, ইংরেজি জার্গন |
| 2 | Profile | ইংরেজি bottom-nav, status ইংরেজি, sync জার্গন, toggle revert নেই |
| 3 | Fish | ইংরেজি লেবেল, Enter-only depth, শতাংশ/শতক বিভ্রান্তি |
| 4 | Crop | Harvest destructive, localStorage vs API disconnect |
| 5 | Livestock | Income zero on suggest, reminder modal dead, English nav |
| 6 | Navigation | Inconsistent bottom-nav, drawer doesn't close, profile subpages no nav |
| 7 | Disease/Community | Fake AI demo, broken dealer filters, alert() stubs |
| 8 | Settings/i18n | Contrast not saved, no font scale, theme flash |
| 9 | API/Offline | Dual API clients, misleading offline messages, 401 partial clear |
| 10 | Home/Market/Govt | Market filters fake, hotlines not callable |

---

## এই সেশনে ঠিক করা হয়েছে

### লগইন (`login.html`, `login.js`)
- ডেমো OTP production UI থেকে সরানো (শুধু localhost-এ টেস্ট হিন্ট)
- `alert-danger` → `alert-error` ফিক্স
- **আবার কোড পাঠান** বাটন যোগ
- ধাপ ১/২ ইন্ডিকেটর, বাংলা-প্রধান কপি
- অফলাইন চেক যোগ

### গ্লোবাল (`main.js`, `api.js`, `tokens.css`)
- Bottom-nav বাংলা লেবেল (`initBottomNavLabels`)
- Mobile drawer লিংকে ক্লিক করলে বন্ধ হয়
- 401-এ পুরো session clear (`Session.clear()`)
- Theme/contrast/font early load (flash কমানো)
- হাই কন্ট্রাস্ট persist (`folika-contrast`)
- **লেখার আকার** (সাধারণ/বড়) সেটিংসে যোগ
- রোগ নির্ণয়: JPG/PNG validation, 10MB limit, image preview, logged-in হলে real API

### প্রোফাইল (`profile.js`, `profile-utils.js`, `profile-pages.js`)
- Status বাংলায় (চলমান, সম্পন্ন...)
- Sync বার্তা সহজ বাংলায়
- Notification toggle fail হলে revert
- Edit panel scroll + focus
- Bottom-nav বাংলা + প্রোফাইল ট্যাব

### মাছ (`fish.html`, `fish-plan.js`)
- **হিসাব করুন** বাটন depth-এর পাশে
- Hint টেক্সট সহজ বাংলায়

### প্রাণিসম্পদ (`livestock-plan.js`)
- প্রস্তাবিত খরচে income আর শূন্য হয় না

### সরকারি (`govt.html`)
- হটলাইন `tel:` লিংক — এক ট্যাপে কল

### API (`api-client.js`)
- Network error vs offline আলাদা বার্তা

### CSS (`components.css`, `tokens.css`)
- `.alert-danger` alias
- High contrast light background
- Large font scale tokens

---

## এখনও বাকি (পরবর্তী ধাপ)

| বিষয় | কারণ |
|-------|------|
| Crop/Livestock API sync | বড় কাজ — fish-pattern অনুসরণ করতে হবে |
| Market price filters live | Backend wiring দরকার |
| Profile sub-pages full nav shell | Shared layout partial |
| Community dealer filter fix | data attributes + filter logic |
| Service Worker / PWA | Architecture decision |
| Crop harvest confirm dialog | crop-plan.js refactor |

---

## টেস্ট

```bash
node tests/js/profile-client.test.mjs
```

ব্রাউজার: http://127.0.0.1:5500/pages/login.html → OTP → profile
