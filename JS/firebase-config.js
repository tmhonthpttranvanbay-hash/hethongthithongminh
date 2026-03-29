// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDZagxoVsRN80fHYRu3N3NSO57tfpmds-4",
    authDomain: "chamcode-b55f7.firebaseapp.com",
    databaseURL: "https://chamcode-b55f7-default-rtdb.firebaseio.com",
    projectId: "chamcode-b55f7",
    storageBucket: "chamcode-b55f7.firebasestorage.app",
    messagingSenderId: "543967582205",
    appId: "1:543967582205:web:9075e178c8df5a9c0f6b94",
    measurementId: "G-G9CRJ88G5Y"
};

// Khởi tạo Firebase nếu chưa có
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// QUAN TRỌNG: Gán vào window.db thay vì const db
window.db = firebase.database();
console.log("🔥 Firebase: Đã kết nối Database thành công!");