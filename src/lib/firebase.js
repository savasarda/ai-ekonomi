import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Replace with your actual Firebase project config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCx2WEEiI03tMOusNLKHvNgb156sfRkqZY",
  authDomain: "aiekonomi-ac075.firebaseapp.com",
  projectId: "aiekonomi-ac075",
  storageBucket: "aiekonomi-ac075.firebasestorage.app",
  messagingSenderId: "170944856580",
  appId: "1:170944856580:web:08003ffd863442abcaab51",
  measurementId: "G-E84EMSNZQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM Token
      // Note: You need to provide your public VAPID key from Firebase Console -> Project Settings -> Cloud Messaging
      const token = await getToken(messaging, { 
        vapidKey: 'BI8YzHrpHEO3-hdckuPNr67we-1ivtFp9z-Cfs1Rxz54cSSWVLSoY79JkOOfOlvUeC_PNVaU_PItEw8V2-xUrNo' 
      });
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
