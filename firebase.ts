import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";

// Firebase configuration for Simone Studio Hair
const firebaseConfig = {
  apiKey: "AIzaSyCLX9AolA0lByIMrtZ1Lb5nP76sTW-8y2Q",
  authDomain: "studiohair-simone.firebaseapp.com",
  projectId: "studiohair-simone",
  storageBucket: "studiohair-simone.firebasestorage.app",
  messagingSenderId: "138220385140",
  appId: "1:138220385140:web:e7900dd12d957d3777f221"
};

// Initialize Firebase with the modular SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const getSalonInfo = async () => {
  const docRef = doc(db, "configuracoes", "infoSalao");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return {
    displayName: "Simone Studio Hair",
    logoUrl: "https://i.ibb.co/wh62vzvP/logo.png"
  };
};

export const saveClientData = async (uid: string, data: { displayName: string, email: string }) => {
  await setDoc(doc(db, "clients", uid), {
    displayName: data.displayName,
    email: data.email,
    fotoUrl: "https://i.ibb.co/HpCqCTGw/cliente.png",
    createdAt: serverTimestamp()
  });
};

export const getUserAppointments = async (uid: string) => {
  const appointmentsRef = collection(db, "appointments");
  // Removido orderBy para evitar erro de índice
  const q = query(
    appointmentsRef,
    where("clienteId", "==", uid)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => b.dataAgendamento.localeCompare(a.dataAgendamento));
};