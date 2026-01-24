import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../config/firebaseConfig";

const FIREBASE_FUNCTIONS_REGION = "us-west2";
const functions = getFunctions(app, FIREBASE_FUNCTIONS_REGION);

const callableCache = new Map();

export const getCallable = (name) => {
    if(!callableCache.has(name)) {
        callableCache.set(name, httpsCallable(functions, name));
    }
    return callableCache.get(name);
};