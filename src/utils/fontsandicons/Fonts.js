// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import { useFonts } from 'expo-font';

// --- Font Packages ---
import { AlfaSlabOne_400Regular } from '@expo-google-fonts/alfa-slab-one'; 
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { 
  LibreFranklin_700Bold, 
  LibreFranklin_500Medium, 
  LibreFranklin_400Regular 
} from '@expo-google-fonts/libre-franklin';
import { 
  Prompt_500Medium, 
  Prompt_400Regular 
} from '@expo-google-fonts/prompt';

// --- Expo Libraries and Modules ---
import { FontAwesome6 } from '@expo/vector-icons';

/**
 * useAppFonts
 * * A centralized hook for asynchronous asset loading.
 * * Maps specific font files to usable 'fontFamily' string names.
 * * Includes vector icon fonts to prevent "flash of unstyled content" (FOUC).
 * * @returns {boolean} fontsLoaded - True when all assets are ready for rendering.
 */
export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    // Display / Headings
    'AlfaSlabOne': AlfaSlabOne_400Regular,
    
    // Body / UI Text
    'Roboto': Roboto_400Regular,
    'LibreFranklin-Bold': LibreFranklin_700Bold,
    'LibreFranklin-Medium': LibreFranklin_500Medium,
    'LibreFranklin-Regular': LibreFranklin_400Regular,
    
    // Accents
    'Prompt-Medium': Prompt_500Medium,
    'Prompt-Regular': Prompt_400Regular,
    
    // Icons (Spreads the internal font map from FontAwesome)
    ...FontAwesome6.font,
  });
  
  return fontsLoaded;
};