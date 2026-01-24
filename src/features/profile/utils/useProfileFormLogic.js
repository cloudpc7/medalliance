// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import { useState, useEffect, useRef, useCallback } from "react";
import {  Keyboard } from "react-native";

// --- Yup Libraries ---
import { reach } from "yup";

// --- Redux State Management ---
import { useDispatch, useSelector } from "react-redux";
import { setError, clearError } from '../../../redux/slices/error.slice';
// --- Redux Actions ---
import { updateProfileFieldRemote } from "../../../redux/slices/profile.slice";

// --- Custom Utilities & Schema ---
import { ValidationSchema } from "../forms/schema/ProfileValidation";

/**
 * useProfileFormLogic
 * Handles the state machine for profile editing with backend persistence.
 */
export const useProfileFormLogic = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux Variables & State --- 
  const data = useSelector((state) => state.profile.data);
  const { activeRequests } = useSelector((state) => state.loading);
  const isLoading = activeRequests > 0;
  
  // --- Local State ---
  const [activeFieldKey, setActiveFieldKey] = useState(null); 
  const [successMessage, setSuccessMessage] = useState(null);

  // --- Refs State ---
  const activeKeyRef = useRef(null);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    activeKeyRef.current = activeFieldKey;
  }, [activeFieldKey]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    }
  }, []);

  const commitSave = async (values, setErrors) => {
    const keyToSave = activeKeyRef.current;
    if (!activeFieldKey) return true;
    const newValue = values[keyToSave];

    if (data && data[keyToSave] === newValue) {
        return true; 
    }

    try {

      dispatch(clearError());
      await reach(ValidationSchema, activeFieldKey).validate(newValue);

      const valToSave = (activeFieldKey === "yearsExperience") 
        ? Number(newValue) 
        : newValue;

      const resultAction = await dispatch(updateProfileFieldRemote({ 
        key: activeFieldKey, 
        value: valToSave 
      }));

      if (updateProfileFieldRemote.fulfilled.match(resultAction)) {
        setSuccessMessage(`Changes saved!`);

        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = setTimeout(() => setSuccessMessage(null), 3000);
        return true;
      };

      return false;

    } catch (error) {
      
      if (error.name === "ValidationError") {
        setErrors({ [activeFieldKey]: error.message });
      } else {
        dispatch(setError(error.message || "Unable to save, Please try again."));
      }
      return false;
    }
  };
  
  // --- UseEffects ---
  useEffect(() => {
    const timer = setTimeout(Keyboard.dismiss, 100);
    return () => clearTimeout(timer)
  }, [activeFieldKey]);

  // --- Handlers ---

  const handleFieldPress = useCallback(async (key, values, setErrors) => {
    if (activeFieldKey === key) return;
    if (activeFieldKey !== null) {
      const success = await commitSave(values, setErrors);
      if (!success) return; 
    }
    setActiveFieldKey(key);
  }, [activeFieldKey, data]);

  const handleFieldBlur = useCallback(async (values, setErrors) => {
    if (activeFieldKey !== null) {
      const success = await commitSave(values, setErrors);
      if (success) {
        setActiveFieldKey(null);
      }
    }
  }, [activeFieldKey, data]);

  const handleSubmit = useCallback(async (values, { setErrors }) => {
    const success = await commitSave(values, setErrors);
    if (success) {
      setActiveFieldKey(null);
    }
  }, [activeFieldKey, data]);

  const handleCancel = useCallback((resetForm) => {
    resetForm({ values: data || {} });
    setActiveFieldKey(null);
    setSuccessMessage(null);
  }, [data]);

  return {
    activeFieldKey,
    successMessage,
    isSubmitting: isLoading,
    handleFieldPress,
    handleFieldBlur,
    handleSubmit,
    handleCancel,
    isEditMode: activeFieldKey !== null,
  };
};