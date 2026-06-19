# API & Integration Setup Guide (INTEGRATION_GUIDE.md)

This document provides step-by-step instructions to configure credentials for the Google Gemini/Groq APIs, Notion MCP Sync, Gmail Draft creator, and Google Play Store reviews crawler.

---

## 1. Notion API Integration Setup
To sync Weekly Product Pulse reports and Fee Explainers to a Notion database:

### Step 1.1: Create a Notion Integration
1. Go to the [Notion Integrations Portal](https://www.notion.so/my-integrations).
2. Click **+ New integration**.
3. Select the Workspace you want to connect, enter name "InsightFlow Link", and set Capabilites to **Read content**, **Update content**, and **Insert content**.
4. Submit to generate the token. Copy the **Internal Integration Token** (e.g. `secret_...`).
5. Add it to `.env.local` as `NOTION_API_KEY`.

### Step 1.2: Create & Share the Database
1. Create a new Page in Notion. Add a **Database** (select "Table" layout).
2. Set up the following database Columns (Properties):
   * **Name** (Title type)
   * **Date** (Date type)
   * **FeeIssue** (Rich Text type)
   * **TopThemes** (Multi-select type)
3. Share the database with the integration:
   * Click the **•••** icon in the top right corner of the database page.
   * Scroll down to **Connections** (or **Add connections**) and search for your integration: "InsightFlow Link". Confirm.
4. Extract the **Database ID** from the Notion URL:
   * URL format: `https://www.notion.so/workspace-name/DATABASE_ID?v=...`
   * Copy the 32-character string between the slash after page title and the question mark.
   * Add it to `.env.local` as `NOTION_DATABASE_ID`.

---

## 2. Google OAuth2 Setup (Gmail Drafts)
To create email drafts inside Gmail, you need an OAuth2 client with a persistent refresh token.

### Step 2.1: Create Google Cloud Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a new project.
3. Search for **Gmail API** in the API library and click **Enable**.

### Step 2.2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** User Type, then click **Create**.
3. Fill out App Name ("InsightFlow Client"), User Support Email, and Developer Contact Information.
4. Save and continue to **Scopes**. Click **Add or Remove Scopes**.
5. Find and add the scope: `https://www.googleapis.com/auth/gmail.compose` (or `https://www.googleapis.com/auth/gmail.readonly` if managing scopes).
6. Continue to **Test Users**. Add your own Gmail address as a test user. Save.

### Step 2.3: Generate Credentials
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Select **Web application** as Application Type.
4. Under **Authorized redirect URIs**, add:
   * `https://developers.google.com/oauthplayground` (useful for fast token generation).
5. Click **Create** and copy the generated **Client ID** and **Client Secret**.
6. Set them in `.env.local` as `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`.

### Step 2.4: Acquire Refresh Token
1. Open the [Google OAuth2 Playground](https://developers.google.com/oauthplayground).
2. Click the Gear Icon (OAuth2 settings) in the top-right corner. Check **Use your own OAuth credentials** and enter your Client ID and Client Secret.
3. Under **Step 1 (Select & authorize APIs)**, input the scope in the text box:
   `https://www.googleapis.com/auth/gmail.compose`
   Then click **Authorize APIs**.
4. Log into your test Gmail account and click **Allow** (dismiss any "unverified app" warnings since it is your own test configuration).
5. Under **Step 2 (Exchange authorization code for tokens)**, click **Exchange authorization code for tokens**.
6. Copy the **Refresh Token** displayed on the left panel.
7. Add it to `.env.local` as `GMAIL_REFRESH_TOKEN`.

---

## 3. Play Store Reviews Ingestion & Crawlers
In a production deployment, reviews are crawled using the Play Store API or local package parsers.

### Step 3.1: Package-Based Local Scraping (Node.js)
The easiest way to grab reviews dynamically without Google Play Console developer access is using the `google-play-scraper` package:
1. Install package: `npm install google-play-scraper`
2. Create script to fetch reviews:
   ```typescript
   import gplay from "google-play-scraper";
   
   const reviews = await gplay.reviews({
     appId: "com.whatsapp", // Target application ID
     sort: gplay.sort.NEWEST,
     num: 100, // Number of items
     lang: "en",
     country: "us"
   });
   ```
3. Map the returned properties to your Scraper schema inside `src/backend/services/scraper.ts`.

### Step 3.2: Enterprise GCP Access (Google Play Console API)
For authorized internal developer workflows:
1. Link your Google Developer Account to the Cloud Console.
2. Enable the **Google Play Android Developer API**.
3. Navigate to **APIs & Services** > **Credentials** > **Create Service Account**.
4. Download the Service Account private key JSON file. Set the path in your backend environments to authorize the Google Play API client.
5. Ingest reviews via the `reviews.list` endpoint.
