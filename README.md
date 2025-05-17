# smart-agro-market
SmartAgroMarket is an AgroTech platform offering real-time price monitoring of daily commodities across regions. It helps wholesale buyers compare prices, make informed sourcing decisions, optimize purchasing strategies, and reduce costs. The app ensures competitive pricing and improves procurement efficiency in agriculture.

 Recommended Documents to Attach for Enhanced Verification:
1. ✅ National ID or Passport (Required if not already submitted)
A clear front and back image of your National ID card, or

A valid passport (preferred internationally)

Must match your AirTM profile name

2. ✅ Proof of Address
Recent utility bill, bank statement, or mobile bill

Must show:

Your full name

Residential address

Issue date within the last 3 months

PDF or image format is fine

3. ✅ Proof of Freelance Income
To justify high transaction limits and show your account is used for freelance work, attach any of the following:

Document Type	Examples
✅ Client Invoices	Invoices issued to your international clients (PDF, screenshot, or export)
✅ Payment Screenshots	AirTM payment history, Fiverr/Upwork earnings, Payoneer transactions
✅ Contracts or Agreements	Freelance contracts with international clients
✅ Platform Profile	Screenshots of your freelancer profile on Fiverr, Upwork, Freelancer.com

4. ✅ Screenshot of Transaction History
Screenshot your AirTM transaction history showing consistent use

Optional: Export as CSV and highlight monthly usage

📌 How to Prepare the Files:
Ensure all files are high-quality scans or photos, not blurry.

Use PDF or JPG/PNG format.

Make sure the name and date are visible (especially for utility/bank docs).

Optional Bonus:
A brief typed document or letter summarizing your freelance work (who your clients are, which platforms you use, what type of work you do — writing, development, design, etc.)

Title it: Freelance Activity Summary - Gazi Shaplur Rahman.pdf

📨 Where to Upload:
Attach all files directly to the support ticket here:


👉 https://help.airtm.com/hc/en-us/requests/new


Dear AirTM Support Team,

My name is Gazi Shaplur Rahman, and my AirTM account is registered under the email address gazirakib400@gmail.com. I am a fully verified user and have been actively utilizing AirTM as my primary platform to receive legitimate freelance payments in USD.

I am currently engaged as a remote freelancer with Outlier.ai, and my earnings are disbursed on a weekly basis via Scale AI, Inc. AirTM has played a vital role in managing these international payments efficiently and securely.

To date, my account's lifetime transaction volume has reached approximately $10,000, and I understand that my current inflow/outflow limit is set at $25,000. Given my ongoing and consistent use of the platform for verifiable income, I am writing to formally request Enhanced Verification in order to remove this transaction cap and continue operating without limitations.

In support of my request, I have attached the following documents:

A copy of my valid passport as proof of identity

Screenshots of my Outlier.ai account and payout history via Scale AI, Inc.

A recent bank statement as proof of address

I kindly request that you review my application and consider increasing my transaction limits. Should you require any additional information or documentation, I am more than willing to provide it at your convenience.

Thank you for your time and support. I look forward to your positive response and to continuing my professional use of AirTM.

Sincerely,
Gazi Shaplur Rahman
gazirakib400@gmail.com

# Smart Agro Connect - Client

## Profile Picture Upload Setup

This application uses Cloudinary for profile picture uploads. To enable this feature:

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Create an upload preset in your Cloudinary console
3. Add the following environment variables to your `.env` file:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

## Image Assets

The application requires the following image assets:
- `public/images/logo-with-text.png` - Your application logo with text
- `public/images/farming-illustration.png` - A farming or agricultural illustration for the login/register pages

## Environment Setup

Copy the `.env.example` file to `.env` and update the values with your actual credentials:

```
# Firebase config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend API
VITE_SERVER_API_URL=your_server_api_url

# Cloudinary config
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset