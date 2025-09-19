// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMx6fxr5n5EA8zy1AOTKlbldyt3CEmxL8",
  authDomain: "syllabus-ai-4d341.firebaseapp.com",
  projectId: "syllabus-ai-4d341",
  storageBucket: "syllabus-ai-4d341.firebasestorage.app",
  messagingSenderId: "477406870225",
  appId: "1:477406870225:web:a858f6afcd5301aa1f63f0",
  measurementId: "G-QWP7P8FT8H"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Make auth and firestore services available globally
window.auth = firebase.auth();
window.db = firebase.firestore();

// Add better error handling for auth state changes
window.auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});
