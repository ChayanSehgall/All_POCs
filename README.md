# Task Tracker POC

This POC runs a NestJS task API, a separate NestJS notifications service, a React/Vite frontend, and PostgreSQL locally with Compose. Both NestJS services and the frontend can be deployed to Cloud Run; PostgreSQL is Cloud SQL for PostgreSQL, connected through the Cloud SQL Unix socket.

## Prerequisites

- Node.js 22+
- Docker Desktop or Podman Desktop (both are free to install; Podman Desktop is open source)
- For GCP: a Google account, a new-project $300/90-day Google Cloud trial or billing account, and the Google Cloud CLI

Cloud Run has an always-free request allowance in eligible regions. Cloud SQL for PostgreSQL is not an always-free database: the GCP trial credits can cover this POC, but delete the instance when finished to avoid charges. PostgreSQL itself is open source; managed Cloud SQL pricing is separate from the database license.

## Run locally

Copy `.env.example` to `.env` and replace both secret values with local values. Then run:

```powershell
podman compose up --build
# or: docker compose up --build
```

Open `http://localhost:5173`. The API is at `http://localhost:3000`; `GET /` returns the NestJS response. To stop the stack:

```powershell
podman compose down
# Add -v to remove the local PostgreSQL volume too.
```

Before committing code changes, run `npm test`, `npm run build`, and `npm run lint` in `backend/`, then `npm run typecheck`, `npm run build`, and `npm run lint` in `frontend/`.

Register and log in, create a task, then add a comment. The API persists the comment and calls the notifications service, which idempotently stores the event in PostgreSQL. The API only returns success after notification delivery; if delivery fails, the comment is already saved and the error is shown.

## Architecture

- `backend/src/main.ts`: authenticated task API, JWT auth, TypeORM/PostgreSQL, and task comments.
- `backend/src/main-notifications.ts`: separate NestJS app. `POST /notifications` requires the shared `NOTIFICATIONS_API_KEY`; event rows use `commentId` as an idempotency key.
- `frontend/`: React + TypeScript task UI, built as a static nginx container. API URL is embedded at build time.
- Local Compose shares PostgreSQL between the NestJS services. Cloud Run deploys each service separately, connected to Cloud SQL.

This is a learning POC, not a production-ready delivery queue: comment writes and notification delivery are separate operations. A notification outage returns an error even though the comment was saved. TypeORM schema synchronization is enabled for this POC; use versioned migrations and disable synchronization before production use. Cloud Run's `--allow-unauthenticated` exposes the service URLs publicly; keep the notifications API key secret and add service-to-service IAM before using this pattern beyond a demo.

The frontend API URL is a Vite build-time value. Set `VITE_API_URL` before building if the API is not on `http://localhost:3000`.

## Deploy to GCP

Set these PowerShell variables once. Use a globally unique Artifact Registry repository name if needed.

```powershell
$PROJECT_ID = "your-gcp-project-id"
$REGION = "us-central1"
$REPOSITORY = "task-tracker"
$DB_INSTANCE = "task-tracker-db"
$DB_NAME = "tasktracker"
$DB_USER = "taskuser"
$DB_PASSWORD = "use-a-long-random-password"
$JWT_SECRET = "use-a-different-long-random-secret"
$NOTIFICATIONS_API_KEY = "use-another-long-random-secret"
$RUNTIME_SA = "task-tracker-runner@$PROJECT_ID.iam.gserviceaccount.com"

gcloud auth login
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
gcloud artifacts repositories create $REPOSITORY --repository-format=docker --location=$REGION
gcloud iam service-accounts create task-tracker-runner
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$RUNTIME_SA" --role=roles/cloudsql.client
```

Create the managed PostgreSQL instance and application database. For a short POC, `db-f1-micro` keeps the instance small; availability and available machine tiers depend on region and current Cloud SQL offering.

```powershell
gcloud sql instances create $DB_INSTANCE --database-version=POSTGRES_16 --tier=db-f1-micro --region=$REGION
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password=$DB_PASSWORD
$INSTANCE_CONNECTION_NAME = gcloud sql instances describe $DB_INSTANCE --format="value(connectionName)"
```

Build and publish the shared NestJS image with Cloud Build, so a local Docker/Podman installation is not required for the cloud deployment.

```powershell
$BACKEND_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:latest"
gcloud builds submit backend --tag $BACKEND_IMAGE

gcloud run deploy task-tracker-notifications `
  --image=$BACKEND_IMAGE `
  --command=node `
  --args=dist/main-notifications.js `
  --region=$REGION `
  --allow-unauthenticated `
  --service-account=$RUNTIME_SA `
  --add-cloudsql-instances=$INSTANCE_CONNECTION_NAME `
  --set-env-vars="PORT=8080,DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME,DB_PORT=5432,DB_USERNAME=$DB_USER,DB_PASSWORD=$DB_PASSWORD,DB_NAME=$DB_NAME,NOTIFICATIONS_API_KEY=$NOTIFICATIONS_API_KEY"

$NOTIFICATIONS_URL = gcloud run services describe task-tracker-notifications --region=$REGION --format="value(status.url)"

gcloud run deploy task-tracker-api `
  --image=$BACKEND_IMAGE `
  --region=$REGION `
  --allow-unauthenticated `
  --service-account=$RUNTIME_SA `
  --add-cloudsql-instances=$INSTANCE_CONNECTION_NAME `
  --set-env-vars="PORT=8080,DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME,DB_PORT=5432,DB_USERNAME=$DB_USER,DB_PASSWORD=$DB_PASSWORD,DB_NAME=$DB_NAME,JWT_SECRET=$JWT_SECRET,NOTIFICATIONS_URL=$NOTIFICATIONS_URL,NOTIFICATIONS_API_KEY=$NOTIFICATIONS_API_KEY"

$BACKEND_URL = gcloud run services describe task-tracker-api --region=$REGION --format="value(status.url)"
```

Build the frontend with the deployed API URL embedded by Vite, then deploy nginx to Cloud Run.

```powershell
$FRONTEND_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/frontend:latest"
gcloud builds submit frontend --config=frontend/cloudbuild.yaml --substitutions="_VITE_API_URL=$BACKEND_URL,_IMAGE=$FRONTEND_IMAGE"

gcloud run deploy task-tracker-web `
  --image=$FRONTEND_IMAGE `
  --region=$REGION `
  --allow-unauthenticated `
  --port=80

$FRONTEND_URL = gcloud run services describe task-tracker-web --region=$REGION --format="value(status.url)"
$FRONTEND_URL
```

## Verify end to end

Run these checks after both deploys. The second request verifies that a client-side route survives an nginx/Cloud Run reload; use the URL printed by the previous command.

```powershell
Invoke-WebRequest "$BACKEND_URL/" | Select-Object StatusCode, Content
Invoke-WebRequest "$FRONTEND_URL/" | Select-Object StatusCode
Invoke-WebRequest "$FRONTEND_URL/login" | Select-Object StatusCode
```

Then open `$FRONTEND_URL`, register a user, log in, create a task, and add a comment. Browser devtools should show requests going to `$BACKEND_URL`, not `localhost`. Verify the notifications service is reachable with `Invoke-WebRequest "$NOTIFICATIONS_URL/health"`; a comment should create one event in `notification_events` in Cloud SQL.

## Claude Code workflow record

Claude Code was not run from this Copilot session. To meet the Week 3 requirement, run the prompts below in Claude Code against this branch, review the resulting diff yourself, and fill in the actual corrections before presenting. Do not describe the prompts as completed until run.

1. **Plan and implement:** “Inspect the task tracker. Plan and implement task comments end-to-end: ownership-safe NestJS endpoints, PostgreSQL persistence, React UI, a separate notifications service, and focused tests. First list files and assumptions; then implement and run relevant checks. Do not change unrelated files.”
2. **Self-review:** “Review your diff as a skeptical reviewer. Find correctness, authorization, failure-handling, test, and deployment issues. Fix only confirmed issues and rerun relevant checks.”
3. **Refactor and document:** “Refactor the roughest changed module without changing its behavior. Update the README with local run, service architecture, deployment, limitations, and verification steps.”

**Human corrections/review notes (complete after the Claude Code run):** record the prompt/output that needed correction, the final code decision, and the test or manual check that verified it. Confirm comment ownership, notification retry/idempotency, and Cloud Run environment configuration.

## Git self-review flow

The feature branch for this work is `feature/task-comments-notifications`. Before opening a PR, inspect `git diff`, run the checks above, and verify no `.env` or credentials are staged. In the PR description, summarize API/UI changes, tests, Cloud Run configuration, and known delivery limitations. Merge only after the PR-style self-review is complete; this local workspace cannot claim a remote PR or merge until those actions are actually performed.

## 10-minute capstone walkthrough

1. **0:00–1:00 — Architecture:** show the React UI, JWT-protected task API, notifications service, and shared PostgreSQL/Cloud SQL. Explain the HTTP event handoff and its learning-PoC delivery limitation.
2. **1:00–3:00 — Live demo:** register/log in, create a task, add a comment, and show it persisted in the task list and notification event table. Point out task-owner authorization and the service API-key boundary.
3. **3:00–4:30 — Containers:** show Compose services and the multi-stage API/frontend builds; open the local UI and service health endpoint.
4. **4:30–6:00 — Cloud:** open the deployed frontend, demonstrate the API URL and comment flow, and show Cloud Run services and Cloud SQL attachment.
5. **6:00–7:30 — Claude Code:** after actually completing the documented Claude workflow, show the prompts, a reviewed diff, tests, and specific human corrections. If the workflow has not been run, state that plainly and present this as follow-up work.
6. **7:30–9:00 — Git:** show the feature branch, self-review checklist, PR-style summary, and merge commit. Do not claim a remote PR or merge unless it was actually created.
7. **9:00–10:00 — Debugging story:** use a real observed issue (for example, API startup waiting for PostgreSQL, invalid notification credentials, or a deployed Vite URL pointing at localhost). Show evidence, root cause, fix, and retest; do not invent a debugging incident.

## Cleanup

```powershell
gcloud run services delete task-tracker-web --region=$REGION
gcloud run services delete task-tracker-api --region=$REGION
gcloud run services delete task-tracker-notifications --region=$REGION
gcloud sql instances delete $DB_INSTANCE
gcloud artifacts repositories delete $REPOSITORY --location=$REGION
gcloud iam service-accounts delete $RUNTIME_SA
```
