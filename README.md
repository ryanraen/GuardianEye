# GuardianEye
## Auth Setup (Supabase)

Set these environment variables for both backend and frontend:

Backend (`backend/.env`):

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_JWT_AUDIENCE=authenticated
```

Frontend (`frontend/.env` or `.env.local`):

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_BACKEND_URL=http://localhost:8000
```

The backend verifies Supabase JWTs against the project's JWKS endpoint and protects all non-public routes.
