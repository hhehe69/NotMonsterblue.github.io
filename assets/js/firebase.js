// Firebase placeholder config — REPLACE with your project's config from Firebase console
// Steps to enable Firebase:
// 1) Create a Firebase project at https://console.firebase.google.com/
// 2) Add a Web App to the project and copy the config below into firebaseConfig
// 3) Enable Authentication -> Email/Password and Firestore Database (in test mode for dev)
// 4) Replace the placeholders in firebaseConfig and then your site will support real auth + comments.

// Example (replace the values):
const firebaseConfig = {
  apiKey: "AIzaSyDpiCczU2vMnszN9sIdPxg7xjP5uvoE5_k",
  authDomain: "notmonsterblue-portfolio.firebaseapp.com",
  projectId: "notmonsterblue-portfolio",
  storageBucket: "notmonsterblue-portfolio.firebasestorage.app",
  messagingSenderId: "686090565747",
  appId: "1:686090565747:web:85c6ffae18a3232dc55206"
};

// -------- DO NOT SHARE your private keys publicly in repos you don't control. --------
// If you publish to GitHub, it's okay to include the Firebase web config (it's public keys only).

async function initFirebase(){
  if(typeof firebase !== 'undefined' && window.firebaseApp) return;
  // load firebase scripts dynamically
  await loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js');
  if(window.firebaseApp) return;
  window.firebaseApp = firebase.initializeApp(firebaseConfig);
  window.firebaseAuth = firebase.auth();
  window.firebaseDB = firebase.firestore();
  // auth listener -> dispatch event
  firebase.auth().onAuthStateChanged(user => {
    const ev = new CustomEvent('authchanged', {detail: user ? {uid:user.uid, email:user.email} : null});
    window.dispatchEvent(ev);
  });
  // expose helper functions
  window.signup = async (email,password) => {
    const u = await firebase.auth().createUserWithEmailAndPassword(email,password);
    return u.user;
  };
  window.signin = async (email,password) => {
    const u = await firebase.auth().signInWithEmailAndPassword(email,password);
    return u.user;
  };
  window.signout = async ()=> await firebase.auth().signOut();
  window.postComment = async ({text,page}) => {
    const user = firebase.auth().currentUser;
    if(!user) throw new Error('not signed in');
    await firebase.firestore().collection('comments').add({
      text, page, author: user.email, uid: user.uid, created: Date.now()
    });
  };
  window.getComments = async (page) => {
    const snap = await firebase.firestore().collection('comments').where('page','==',page).orderBy('created','desc').limit(50).get();
    return snap.docs.map(d=>d.data());
  };
}

// dynamic script loader
function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }

// If firebaseConfig is still placeholder, do not init automatically.
if(firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('REPLACE')){
  initFirebase().catch(e=>console.warn('Firebase init failed',e));
} else {
  console.warn('Firebase not configured — replace firebaseConfig in assets/js/firebase.js with your project values to enable auth & comments.');
}
