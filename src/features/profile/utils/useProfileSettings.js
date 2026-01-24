// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, {  useMemo, useEffect } from 'react';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { fetchColleges, fetchFormats, fetchMentoringTypes, fetchSpecialties, fetchMedicalPrograms, fetchDegrees, fetchOccupations } from '../../../redux/slices/school.slice';

/**
 * useProfileSettings
 * 
 * A custom hook that centralizes data and configuration for the profile settings/edit screen.
 * 
 * Functionality:
 * - Provides a fixed DISPLAY_ORDER array defining field order, labels, and editability
 * - Selects current user profile data from Redux (state.profile.data)
 * - Automatically fetches all required lookup datasets (colleges, degrees, occupations, specialties, mentoring types, formats) on mount if not already loaded
 * - Exposes a getLookupData helper to retrieve the appropriate option list for picker fields based on field key
 * 
 * Purpose:
 * Encapsulates all profile settings logic and data fetching in one reusable hook, keeping ProfileSettingsForm clean and focused on rendering while ensuring consistent field ordering and data availability.
 */

export const useProfileSettings = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux Variables & State --- 
  const { data } = useSelector((state) => state.profile);
  const { colleges, programs, degrees, occupations, specialties, mentoringTypes, formats } = useSelector((state) => state.school);

  // --- Derived state Variables ---
  const DISPLAY_ORDER = [
      { key: 'Full Name', label: 'Full Name', editable: false },
      { key: 'College', label: 'College' },
      { key: 'degree', label: 'Degree Program' },
      { key: 'major_minor', label: 'Major/Minor' },
      { key: 'occupation', label: 'Occupation' },
      { key: 'department', label: 'Specialty' },
      { key: 'mentor', label: 'Mentoring Provided' },
      { key: 'curr_year', label: 'Current Year' },
      { key: 'formats', label: 'Formats' },
      { key: 'goals', label: 'Goals' },
      { key: 'quote', label: 'Quote' }
  ];
  
  // --- useEffects ---
  useEffect(() => {
      if (colleges.length === 0) dispatch(fetchColleges());
      if (programs.length === 0) dispatch(fetchMedicalPrograms());
      if (degrees.length === 0) dispatch(fetchDegrees());
      if (occupations.length === 0) dispatch(fetchOccupations());
      if (specialties.length === 0) dispatch(fetchSpecialties());
      if (mentoringTypes.length === 0) dispatch(fetchMentoringTypes());
      if (formats.length === 0) dispatch(fetchFormats());
    }, [dispatch]);

  
  // --- Derived State functions ---
  const getLookupData = (key) => {
      const dataMap = {
        College: colleges, degree: degrees, occupation: occupations, 
        department: specialties, mentor: mentoringTypes, formats: formats,
      };
      return dataMap[key] || null;
    };
    
  return {
    profileData: data,
    DISPLAY_ORDER,
    getLookupData,
  };
};