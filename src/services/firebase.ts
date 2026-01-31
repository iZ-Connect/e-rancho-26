// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAUyZhCiC2S60g5EU0ckYOigD0UFbV8wTE",
    authDomain: "erancho-hgesm.firebaseapp.com",
    databaseURL: "https://erancho-hgesm-default-rtdb.firebaseio.com",
    projectId: "erancho-hgesm",
    storageBucket: "erancho-hgesm.firebasestorage.app",
    messagingSenderId: "595823040267",
    appId: "1:595823040267:web:be7ee81a9f82a1e447f40e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
