import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyDHcJO7_0ngx_33TQ_5fIoB5_JJyPVXsko",
  authDomain: "goall-30777.firebaseapp.com",
  projectId: "goall-30777",
  storageBucket: "goall-30777.firebasestorage.app",
  messagingSenderId: "549195954867",
  appId: "1:549195954867:web:6d60b4ef23398e63c34ec6",
  measurementId: "G-KJK46CL23G"

};



const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);