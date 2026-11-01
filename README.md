# Solace Clinic: website + admin (CRM & CMS)

A multi-specialty clinic website built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Framer Motion** and **Lenis**. It ships with a full admin panel. Every piece of content, colour and animation on the public site can be edited from the admin, and every booking or enquiry lands in the built-in CRM.

```bash
npm install
cp .env.example .env.local   # optional: set your own admin password / secret
npm run dev                  # http://localhost:3000
```

Admin: **http://localhost:3000/admin**. Demo login: `admin@solace.clinic` / `solace@123`

---

## Public website

| Page | Highlights |
|---|---|
| **Intro** | Full-screen preloader with three styles (ECG pulse, letters, curtain), a 000→100 counter, a rounded-corner reveal, and an option to play once per session. Set from Admin → Appearance. |
| **Navbar** | "Clinical Island": a floating capsule that shows live **Open / Closed** status from your hours, compacts as you scroll down and expands when you scroll up. A scroll-progress hairline runs along it, and it morphs into a full menu sheet with hover image previews, call and 24×7 emergency buttons. |
| **Home** | Hero with masked line reveals, a magnetic CTA and a rotating badge, then a scroll-zoom image that grows from a card to full-bleed. Then: two-way specialty marquee; Apple-style statement whose words light up on scroll; pinned **horizontal-scroll** services (a swipe carousel on mobile); animated counters; stacking "how it works" cards; doctors; packages; a draggable testimonials carousel; journal; FAQ; a clip-path CTA plus an insurer marquee. Sections can be reordered and hidden from the admin. |
| **Services** | Index list plus a detail page for each service (parallax hero, inclusions, matching doctors, FAQ). |
| **Doctors** | Filterable, searchable directory with animated layout; profile pages show weekly availability, fee, education and languages. |
| **Book** | 4-step booking wizard: specialty → doctor → date and **real free slots** (from the doctor's schedule minus slots already booked) → details. Includes an in-clinic / video toggle. The confirmation screen offers **.ics calendar download**, WhatsApp share and a reference number. |
| **Track** | Look up a booking with its reference and phone number, see its status, and cancel online. |
| **Packages, About, Journal (blog), FAQ, Contact** | Contact form, callback request, map, hours and emergency card. |
| **Extras** | Page-transition wipe, cursor follower, smooth scroll, WhatsApp button, announcement bar, newsletter, JSON-LD (MedicalClinic + FAQPage), sitemap, robots, 404 page. Designed mobile-first and respects `prefers-reduced-motion`. |

## Admin panel (`/admin`)

**CRM**
- **Dashboard**: today's visits, pending confirmations, new leads, 30-day revenue, patients, a 14-day bookings chart, a status donut, upcoming visits and newest leads.
- **Appointments**: filter, search, change status inline, internal notes, create bookings manually, CSV export.
- **Patients**: profiles with visit history, tags, blood group and notes.
- **Leads pipeline**: drag-and-drop kanban (New → Contacted → Qualified → Converted / Lost), activity log, deal value, convert-to-patient.
- **Subscribers**: newsletter list with CSV export.

**CMS**
- **Site settings**: name, phone, emergency number, WhatsApp, address, map, opening hours, socials, announcement bar.
- **Appearance & intro**: brand colours (with presets), corner radius, smooth scroll and cursor toggles, and intro animation style, text and duration.
- **Navigation**: links, order, visibility and the CTA button.
- **Homepage**: section order and visibility, hero, marquee, statement, stats, process steps, CTA.
- **About page**, plus **Services, Doctors (with weekly schedule), Journal, Testimonials, FAQs, Packages, Insurers**.
- **Media library**: upload images and use them anywhere.

## Architecture

```
app/(site)/        public pages        app/admin/        admin (auth-guarded)
app/actions.ts     public server actions (booking, contact, newsletter, tracking)
app/admin/actions.ts  admin server actions (all call requireAdmin())
components/site    public UI           components/motion  animation primitives
components/admin   admin UI            lib/               types, db, seed, auth, utils
```

**Data** lives in a single JSON document store (`lib/db.ts`) at `./data/db.json`. It is seeded with demo content on first run and written atomically. The store sits behind two functions, `readDb()` and `mutate()`, so you can swap it for Postgres, Supabase or MongoDB without touching any UI.

**Auth** is a single admin account from environment variables, using an HMAC-signed httpOnly cookie.

## Deploying

The JSON store needs a **writable, persistent disk**. A VPS, Railway, Render or Fly.io with a volume will work: set `DATA_DIR` to the volume path. Serverless hosts such as Vercel have a read-only filesystem, so there you should first replace `lib/db.ts` with a database adapter.

Set in production: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (long random string), `NEXT_PUBLIC_SITE_URL`.

Photography: Unsplash.
