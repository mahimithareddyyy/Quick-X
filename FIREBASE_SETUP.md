# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `quick-campus-cash`
4. Enable Google Analytics (optional)
5. Create the project

## 2. Enable Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save the configuration

## 3. Create Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location for your database
5. Click "Done"

## 4. Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init`
4. Select "Firestore" and "Hosting"
5. Deploy the rules: `firebase deploy --only firestore:rules`

## 5. Get Configuration Keys

1. In the Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web app
4. Register the app with a nickname
5. Copy the configuration object

## 6. Set Environment Variables

Create a `.env` file in your project root with:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 7. Enable Real-time Features

1. In Firestore Database, go to "Rules" tab
2. The rules are already configured in `firestore.rules`
3. Deploy them using: `firebase deploy --only firestore:rules`

## 8. Deploy the Application

1. Build the project: `npm run build`
2. Deploy to Firebase Hosting: `firebase deploy --only hosting`

## 9. Test the Application

1. Open the deployed URL
2. Create a test account
3. Test the exchange flow

## Security Notes

- The Firestore rules are configured to allow authenticated users to access their own data
- Exchange requests are public when active
- Messages are only accessible to matched users
- All writes require authentication

## Troubleshooting

- Make sure all environment variables are set correctly
- Check the browser console for any Firebase errors
- Verify that Firestore rules are deployed correctly
- Ensure Authentication is enabled in Firebase Console
