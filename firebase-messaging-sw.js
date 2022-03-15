
importScripts("./libs/firebase-app.js")
importScripts("./libs/firebase-messaging.js")

const firebaseConfig = {
    apiKey: "AIzaSyCo-n5y_cnjemJf0Nj0MEJ2ew-X0AvSjnY",
    authDomain: "masters-thesis-efd56.firebaseapp.com",
    projectId: "masters-thesis-efd56",
    storageBucket: "masters-thesis-efd56.appspot.com",
    messagingSenderId: "268824426727",
    appId: "1:268824426727:web:dfce25b5178c5190c10a42",
    measurementId: "G-SFTG5E0JWG"
  };
  
  // Initialize Firebase
  
  const firebaseApp = firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    //const notificationTitle = 'Background Message Title';
    //const notificationOptions = {
    //  body: 'Background Message body.',
    //  icon: '/firebase-logo.png'
    //};
  
    self.registration.showNotification(notificationTitle,
      notificationOptions);
  });