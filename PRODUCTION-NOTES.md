# FOLIKA Profile Section — Production Notes

**Date:** 2026-08-29  
**Stack adapted from master prompt:** Static HTML + custom CSS (not Blade/Tailwind)

---

## Implemented Now

| Deliverable | Status | Location |
|-------------|--------|----------|
| Profile dashboard (§4.1–4.4, 4.7–4.10) | Done | `pages/profile.html`, `js/profile.js` |
| All Plans list pages (§4.5) | Done | `pages/profile-crops.html`, `profile-fish.html`, `profile-livestock.html` |
| All Diagnoses list (§4.7) | Done | `pages/profile-diagnoses.html` |
| Notifications list (§4.9) | Done | `pages/profile-notifications.html` |
| Crop / Fish / Livestock detail pages (§4.6) | Done | `pages/profile-*-detail.html`, `js/profile-pages.js` |
| Diagnosis detail page | Done | `pages/profile-diagnosis-detail.html` |
| Central API client (§6.1) | Done | `js/api-client.js` |
| Offline queue (§6.3) | Done | `js/offline-sync.js` |
| Profile styles | Done | `css/profile.css` |
| Unit tests (§6.8 required) | Done | `tests/js/profile-client.test.mjs` |

### Features wired to real APIs
- `GET /user/profile` — identity card, farm info, onboarding nudge
- `PATCH /user/profile` — inline name + farm/location edit
- `GET /user/summary` — financial summary cards
- `GET /crops/plans`, `/fish/plans`, `/livestock/plans` — plan previews + lists
- `GET /disease/history`, `/disease/{id}` — diagnosis section
- `GET /notifications`, mark read, read all
- `GET /sync/status` — sync indicator
- `PATCH /user/preferences` — push notification toggle
- `POST /auth/logout`, `/auth/logout-all`, `DELETE /user/account`
- `PATCH /livestock/plans/{id}/vaccines/{vid}/complete` — optimistic vaccination complete

---

## Intentionally Stubbed / Deferred

| Item | Reason |
|------|--------|
| Service Worker / PWA cache | No SW in repo yet; offline uses localStorage queue only |
| Avatar upload + client resize | `avatar_url` field exists; no upload endpoint yet |
| FCM push token silent registration | `user/fcm-token` API exists; browser push not configured |
| Digital Farmer ID card | No backend field for FK-ID; removed from new profile |
| Full E2E browser tests | Optional per §6.8; only unit tests for client/queue |
| Real monitoring service | Console logging only via `FolikaApiClient.log()` |
| Conflict diff UI | Simple conflict flag + manual re-save only |
| Server-side pagination for plan lists | Client-side pagination over full list (API returns all plans) |

---

## Architecture Notes

- **Not Blade:** Pages are static HTML in `pages/`; JS IIFEs attach to `window`.
- **Not Tailwind:** Uses `css/tokens.css` design tokens and existing component classes.
- **Auth:** Profile pages redirect to `login.html` if no Sanctum token.
- **Guest users:** Cannot access profile dashboard (login required).

---

## How to Test

1. Start backend: `cd folika-backend && php artisan serve`
2. Start frontend: `python -m http.server 5500` from project root
3. Login: mobile `01711111111`, OTP `123456`
4. Open: http://127.0.0.1:5500/pages/profile.html
5. Run unit tests: `node tests/js/profile-client.test.mjs`

---

## Known Limitations

1. Plan edit from detail pages links back to crop/fish/livestock planners (not inline edit on profile).
2. `profileCompletion()` uses name + location + farm_type; mobile OTP counts as verified badge.
3. Disease history pagination depends on backend `per_page` support.
4. Offline cache for GET is in-memory (session), not persistent Service Worker cache.
