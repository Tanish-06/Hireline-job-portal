# Hireline – MERN Job Portal

A full-stack job portal with two roles (job seeker and recruiter), built with MongoDB, Express, React (Vite) and Tailwind CSS.

**Features**
- Register / login with JWT stored in an httpOnly cookie, bcrypt password hashing
- Role-based access: job seekers and recruiters see and can do different things
- Recruiters: post, edit and delete jobs; see applicants per job; shortlist, reject or hire
- Job seekers: search and filter jobs (keyword, location, type, salary) with pagination; apply with a PDF resume and cover letter; track application status
- Profile page with skills and resume upload (PDF, max 2 MB)
- Security basics: zod validation, helmet, rate limiting on auth, ownership checks, one application per job per person

---

## 1. Run it locally

You need Node.js 18+ and MongoDB (local install or a free MongoDB Atlas cluster).

### Backend
```bash
cd Backend
npm install
cp .env.example .env      # then open .env and set MONGODB_URI and JWT_SECRET
npm run dev               # http://localhost:5000
npm run seed              # optional: demo data (see logins below)
```

### Frontend (new terminal)
```bash
cd Frontend
npm install
npm run dev               # http://localhost:5173
```

Demo logins after `npm run seed`:
- Recruiter: `recruiter@demo.com` / `demo1234`
- Candidate: `candidate@demo.com` / `demo1234`

> The seed script **deletes all existing users, jobs and applications**. Use it only on a development database.

### Already have your own `Job-portal` folder?
You don't need to start over. Copy files into your existing structure:
- `Backend/src/Schema/*` replaces/adds your models (`user.model.js` is extended with `role` and `profile`)
- Copy `controllers`, `routes`, `middlewares`, `utils` as new folders
- Replace your `app.js` and `server.js` with these versions
- Merge the dependencies from `Backend/package.json` (run `npm i bcryptjs cookie-parser cors express-rate-limit helmet jsonwebtoken multer zod`)
- Backend uses ES modules, so `"type": "module"` must be in `package.json`

For the frontend, copy `src/` into your Vite project. This code uses **Tailwind v4**: `npm i tailwindcss @tailwindcss/vite`, add the plugin in `vite.config.js` (see the file here) and keep `@import "tailwindcss";` at the top of `index.css`. Also run `npm i axios react-router-dom`.

---

## 2. How the pieces fit together

```
Backend/src
  server.js        loads .env, connects MongoDB, starts Express
  app.js           middleware (helmet, cors, cookies), mounts routes, error handler
  db/              Mongo connection
  Schema/          User, Job, Application models
  routes/          URL -> middleware chain -> controller
  controllers/     the actual logic for each endpoint
  middlewares/     protect (JWT), authorize (roles), validate (zod), upload (multer), errors
  utils/           token + cookie helper, validators, asyncHandler, ApiError

Frontend/src
  api/axios.js     one axios instance (withCredentials: true)
  context/         AuthContext: who is logged in, login/register/logout
  components/      Navbar, ProtectedRoute, JobCard, StatusBadge, Alert
  pages/           Home, JobDetail, Login, Register, Profile, MyApplications,
                   RecruiterDashboard, JobForm, Applicants
```

### The login flow (good to be able to explain in interviews)
1. `POST /api/auth/login` checks the password with bcrypt and, if valid, signs a JWT.
2. The JWT is sent back in an **httpOnly cookie**, so JavaScript can't read it (safer than localStorage against XSS).
3. The browser automatically sends the cookie with every request (`withCredentials: true`).
4. `protect` middleware verifies the token and loads the user into `req.user`.
5. `authorize("recruiter")` then checks `req.user.role`.
6. On page refresh the frontend calls `GET /api/auth/me` to restore the logged-in user.

### Data model
- **User**: name, email (unique), password (hidden by default), role, profile (bio, skills, location, resumeUrl, companyName, companyWebsite)
- **Job**: title, description, companyName, location, jobType, salary (LPA), skills[], postedBy -> User
- **Application**: job -> Job, applicant -> User, coverLetter, resumeUrl, status. A unique index on (job, applicant) prevents duplicate applications at the database level.

---

## 3. API reference

| Method | Endpoint | Who | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | name, email, password, role |
| POST | `/api/auth/login` | public | sets cookie |
| POST | `/api/auth/logout` | any | clears cookie |
| GET | `/api/auth/me` | logged in | current user |
| GET | `/api/jobs` | public | `?search=&location=&jobType=&minSalary=&page=&limit=` |
| GET | `/api/jobs/:id` | public | |
| GET | `/api/jobs/mine/list` | recruiter | own jobs + applicant counts |
| POST | `/api/jobs` | recruiter | |
| PUT | `/api/jobs/:id` | owner recruiter | |
| DELETE | `/api/jobs/:id` | owner recruiter | also deletes its applications |
| POST | `/api/applications/:jobId` | job seeker | multipart: `coverLetter`, `resume` (PDF) |
| GET | `/api/applications/me` | job seeker | |
| GET | `/api/applications/job/:jobId` | owner recruiter | applicants list |
| PATCH | `/api/applications/:id/status` | owner recruiter | applied / shortlisted / rejected / hired |
| PUT | `/api/users/profile` | logged in | multipart: profile fields + `resume` |

---

## 4. Test the backend first (Postman / Thunder Client)

Build confidence in the API before touching the UI:
1. `POST /api/auth/register` as a recruiter, check the response and that a `token` cookie is set
2. `POST /api/jobs` with a title, description (20+ chars), companyName, location, jobType
3. Register a job seeker (use a different client session or log out first), then `POST /api/applications/:jobId` as form-data with a PDF
4. Try the same apply again, you should get **409 "already applied"**
5. Try recruiter-only routes as a job seeker, you should get **403**

---

## 5. Deploying (so your resume has a live link)

1. **Database**: create a free MongoDB Atlas cluster, create a user, allow network access (0.0.0.0/0 for a demo), copy the connection string.
2. **Backend on Render** (Web Service, root directory `Backend`):
   - Build: `npm install`, Start: `npm start`
   - Env vars: `MONGODB_URI`, `JWT_SECRET` (long random string), `CLIENT_URL` (your Vercel URL, no trailing slash), `NODE_ENV=production`
3. **Frontend on Vercel** (root directory `Frontend`):
   - Env var: `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`
   - Add `Frontend/vercel.json` so page refreshes on routes like `/profile` don't 404:
     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
     ```
4. **Important limitation**: Render's free disk is wiped on every redeploy/restart, so uploaded resumes will disappear. For a real deployment, move uploads to **Cloudinary** or S3: replace `multer.diskStorage` with memory storage and upload the buffer to Cloudinary, then store the returned URL in `resumeUrl`. This is a great upgrade to mention in interviews.
5. Cookies across two domains need `sameSite: "none"` and `secure: true`. This is already handled in `utils/token.js` when `NODE_ENV=production`.

---

## 6. Next features (to push it beyond a basic clone)

Pick two or three; each one is a good talking point.
- **Cloudinary resume upload** (see above)
- **Saved/bookmarked jobs** (add `savedJobs: [ObjectId]` on User + toggle endpoint)
- **Email on status change** with Nodemailer
- **Employer-side filters** on the applicants page (by status)
- **Job expiry / close a job** using the existing `isActive` field
- **MongoDB text index** instead of regex search, for ranked results
- **Tests**: Jest + Supertest for auth and application routes
- **Refresh tokens** or password reset by email

---

## 7. Resume bullets (edit to match what you finish)

- Built a full-stack job portal (MongoDB, Express, React, Node.js, Tailwind) with role-based access for recruiters and job seekers
- Implemented JWT authentication with httpOnly cookies, bcrypt hashing, zod request validation, rate limiting and ownership checks on protected routes
- Designed REST APIs for job posting, server-side search/filter/pagination, and resume uploads (Multer); enforced one application per job via a unique compound index
- Deployed on Render + Vercel with MongoDB Atlas; live demo: `<your link>`

## 8. Questions to prepare for interviews
- Why httpOnly cookies instead of localStorage for the JWT?
- How do you stop a recruiter from editing another recruiter's job? (ownership check in the controller)
- How do you prevent duplicate applications? (unique compound index, handled in the error middleware as a 409)
- Why is `/mine/list` declared before `/:id` in the routes?
- How would you scale search? (text index, then Elasticsearch/Atlas Search)
