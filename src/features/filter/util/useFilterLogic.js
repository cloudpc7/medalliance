// 🔥 Production Ready
// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../redux/slices/filter.slice'; 

/**
 * useFilterLogic
 * 
 * Custom hook that powers the expanded filter options list (FilterOptions component).
 * 
 * Functionality:
 * - Maps the currently selected filter category (e.g., "Degrees", "Occupation") to its data source, current Redux value, and update action
 * - Provides the list of available options, the currently selected value, and a `selectOption` handler
 * - When an option is selected, it dispatches the appropriate Redux action and closes the expanded menu
 * - Supports both static lists (e.g., Profile Type, Online) and dynamic data from the school slice
 * 
 * Purpose:
 * Centralizes the logic for connecting UI filter categories to their Redux state and actions, keeping FilterOptions clean and reusable.
 */

export const useFilterLogic = () => {
  
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const filters = useSelector((state) => state.filters);
  const school = useSelector((state) => state.school);
  const { activeRequests } = useSelector((state) => state.loading);
  
  // --- Derived State Variables ---
  const loadingState = activeRequests > 0;
  const selection = filters.selectedFilter?.toLowerCase();

  // 2. The Configuration Map
  // Logic: 'UI Category Label': { data: Source, action: ReduxAction, currentValue: FilterValue }
  const filterConfig = {
    'degrees': { 
      data: school.degrees, 
      action: actions.setDegree, 
      currentValue: filters.degree 
    },
    'profile type': { 
      data: ['Any', 'Professor', 'Student'], 
      action: actions.setProfileType, 
      currentValue: filters.profileType 
    },
    'online': { 
      data: ['Any', 'Online', 'Offline'], 
      action: actions.setOnlineStatus, 
      currentValue: filters.onlineStatus 
    },
    'colleges': { 
      data: school.colleges, 
      action: actions.setCollege, 
      currentValue: filters.college 
    },
    'occupation': { 
      data: school.occupations, 
      action: actions.setOccupation, 
      currentValue: filters.occupation 
    },
    'contact method': { 
      data: school.formats, 
      action: actions.setFormat, 
      currentValue: filters.format 
    },
    'medical programs': { 
      data: school.programs, 
      action: actions.setProgram, 
      currentValue: filters.program 
    },
    'quote': {
        data: ['Any', 'Has Quote'],
        action: actions.setQuote,
        currentValue: filters.quote
    }
  };

  // 3. Extract the active configuration based on what category is open
  const activeConfig = filterConfig[selection] || { data: [], action: null, currentValue: 'any' };

  /**
   * selectOption
   * Dispatches the selection to Redux and closes the menu
   */
  const selectOption = (option) => {
    const optionStr = String(option);
    const optionLower = optionStr.toLowerCase();

    if (activeConfig.action) {
      dispatch(activeConfig.action(optionLower));
    }
    
    // Toggle the option menu closed after selection
    dispatch(actions.toggleOption(filters.selectedFilter));
  };

  return {
    options: activeConfig.data || [],
    currentValue: activeConfig.currentValue,
    selectOption,
    selectedCategory: filters.selectedFilter,
    isLoading: loadingState, 
  };
};