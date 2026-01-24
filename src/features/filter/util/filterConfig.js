// 🔥 Production Ready
/**
 * filterOptions
 * 
 * A static configuration array that defines the structure and categories for the app's filter panel.
 * 
 * Functionality:
 * - Organizes filters into logical sections (e.g., Education, Profile Type, etc.)
 * - Each section has a unique `id`, display `label`, and an array of `filters` (strings)
 * - The `filters` array determines which filter buttons are rendered under each section
 * - Used by FilterComponent to build the collapsible filter UI
 * 
 * Purpose:
 * Centralizes filter category definitions in one place for easy maintenance and consistency across the filtering system.
 */

export const filterOptions = [
        {
            id: 'education',
            label: 'Education',
            filters: ['Degrees', 'Medical Programs', 'Colleges']
        },
        {
            id: 'profile',
            label: 'Profile Type',
            filters: ['Profile Type', 'Occupation'],
        },
        {
            id: 'communication',
            label: 'Communication',
            filters: ['Contact Method'],
        },
        {
            id: 'availability',
            label: 'Availability',
            filters: ['Online'],
        },
        {
            id: 'preferences',
            label: 'Prefrences',
            filters: ['Quote'],
        }
    ];