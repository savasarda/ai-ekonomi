importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase project config from Firebase Console
firebase.initializeApp({
  apiKey: "AIzaSyCx2WEEiI03tMOusNLKHvNgb156sfRkqZY",
  authDomain: "aiekonomi-ac075.firebaseapp.com",
  projectId: "aiekonomi-ac075",
  storageBucket: "aiekonomi-ac075.firebasestorage.app",
  messagingSenderId: "170944856580",
  appId: "1:170944856580:web:08003ffd863442abcaab51",
  measurementId: "G-E84EMSNZQ8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
