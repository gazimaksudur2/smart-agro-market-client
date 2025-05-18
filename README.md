# smart-agro-market
SmartAgroMarket is an AgroTech platform offering real-time price monitoring of daily commodities across regions. It helps wholesale buyers compare prices, make informed sourcing decisions, optimize purchasing strategies, and reduce costs. The app ensures competitive pricing and improves procurement efficiency in agriculture.



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