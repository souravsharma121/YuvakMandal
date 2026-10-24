# Multi-Organization Deployment Guide

If you want to provide this application to another organization with a **completely separate database**, you do **not** need to change the code. Instead, you should deploy a separate **instance** of the application.

This ensures complete data isolation and security.

## Step 1: Database Setup
1.  Create a **new MongoDB Database** for the new organization.
    *   If using **MongoDB Atlas**, you can create a new Project or just a new Cluster.
    *   Or, simply use a different **Database Name** in your connection string.
    *   **Old:** `mongodb+srv://user:pass@cluster0.mongodb.net/YuvakMandal?retryWrites=true`
    *   **New:** `mongodb+srv://user:pass@cluster0.mongodb.net/OtherOrganization?retryWrites=true`

## Step 2: Backend Configuration (Environment Variables)
For the new organization's backend, you need a separate `.env` file (or environment variables in your hosting provider like Vercel/Heroku/Render).

**Key variables to change:**

```ini
# A unique JWT Secret ensures tokens from one org don't work on the other
JWT_SECRET=some_super_complex_random_string_unique_to_this_org

# The new database connection string
MONGO_URI=mongodb+srv://.../NewOrgDB

# If running on the same server, change the PORT
PORT=5001
```

## Step 3: Frontend Configuration
For the newly deployed frontend, you simply need to point it to the **new backend**.

In the new frontend's `.env` file (or Vercel/Netlify settings):

```ini
# Point this to the NEW backend URL
VITE_API_URL=https://api.new-organization-app.com
```

## Scenarios

### Scenario A: Completely Separate Hosting (Recommended)
- **Org A:** Hosted on `yuvakmandal.com` (Frontend) + `api.yuvakmandal.com` (Backend)
- **Org B:** Hosted on `otherorg.com` (Frontend) + `api.otherorg.com` (Backend)
- **Result:** They share nothing. They are two totally different apps running the same code.

### Scenario B: Same Server (Cost Saving)
If you are hosting them on the same VPS (Virtual Private Server):
1.  **Backend A:** Runs on Port `5000`. Connected to `DB_A`.
2.  **Backend B:** Runs on Port `5001`. Connected to `DB_B`.
3.  **Frontend A:** Built with `VITE_API_URL=http://server-ip:5000`
4.  **Frontend B:** Built with `VITE_API_URL=http://server-ip:5001`

---

**Summary:** The application is already "Multi-Tenant Ready" in the sense that the code is stateless. The "Tenant" is defined effectively by the Database URL you connect to and the API URL the frontend talks to.
