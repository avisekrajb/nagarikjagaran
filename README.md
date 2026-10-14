# नागरिक जागरण — News Website

A modern Nepali news portal built with a React frontend and a Node.js/Express + MySQL backend.

## Project structure

```
newswebsite/
├── backend/    Express + MySQL REST API (port 5000)
├── frontend/   React (Create React App) SPA (port 3001)
└── .gitignore
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
# make sure backend/.env exists with:
#   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (create the database first)
npm run dev        # Node monitor
# or
npm start          # production-ish run
```

The server auto-creates all tables and seeds default data (site footer, one sample ad, admin user) on first launch. The default admin login is `a@gmail.com` / `123456` — change it in production.

API runs at `http://localhost:5000`. Key routes:

- `GET /api/news` — list news (`?category=`, `?q=`, `?status=`, `?author=`)
- `GET /api/news/:id` — single news
- `POST /api/news` — create (admin)
- `GET /api/ads?position=` — ads for a placement
- `GET /api/footer` / `PUT /api/footer` — footer settings
- `GET /api/patro` — Nepali calendar proxy
- `POST /api/contact` — contact messages
- `POST /api/subscribe` — newsletter subscribers

### 2. Frontend

```bash
cd frontend
npm install
npm start        # dev server on http://localhost:3001
npm run build    # production build (output in frontend/build)
```

Frontend talks to the backend through a proxy configured in `frontend/package.json` — it expects the API on `localhost:5000` during development.

## Features

- Home page: hero slider, ताजा खबर (latest), category sections (विश्व, स्थानीय तह, कला/मनोरञ्जन, राजनीति, खेलकुद), photo marquee, reels, ad placements.
- Category/news pages with search, author pages, Our Team, Contact form.
- Article detail: share, font-size controls, comments, top-news 5/5 rail, related news.
- **Ad system**: admins can create ads and assign them to slots (banner, sidebar, header, inside articles: top / middle / bottom / after comments / after related news, home placements).
- **Rich text editor**: bold/italic/color/lists/links, image insert, and an ad-marker tool that places an ad slot anywhere inside the article description (rendered live on the article page).
- **Patro**: Nepali (BS) calendar with AD dates.
- **Admin dashboard** (`/admin`): news CRUD, ads, footer settings, reels, comments, subscribers, contact messages, team, header photo.

## Notes

- News detail content is "real data only" — there is no mock fallback; sections stay empty until news is published from the admin.
- Description photos inserted in the editor render in-place on the article page at their original position.
- The article-middle ad is auto-placed at the exact center of the description when no manual marker is used, and renders whenever an ad is assigned to the `article-middle` position.