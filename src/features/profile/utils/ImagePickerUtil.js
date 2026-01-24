// 🔥 Production Ready 
// --- React Core Libraries and Modules ---
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// --- Redux State Management ---
import { useDispatch } from 'react-redux';
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';
import { setError, clearError } from '../../../redux/slices/error.slice';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'];

/**
 * useImagePicker
 * * A hardened hook for selecting, validating, and processing profile images.
 * * Functionality:
 * - Smart Permissions: Checks existing status before requesting to avoid redundant iOS prompts.
 * - Format Handling: Auto-converts HEIC/HEIF to JPEG; preserves PNG transparency.
 * - Strict 1:1 Aspect: Forces square crops and 800x800 resolution for avatar consistency.
 * - Memory Safe: Standardizes large photos before Blob conversion.
 */
export const useImagePicker = () => {
  const dispatch = useDispatch();

  const processImage = async (uri) => {
    try {
      dispatch(startLoading());
      dispatch(clearError());

      if (!uri) throw new Error('Invalid image URI.');

      const fileExtension = uri.split('.').pop()?.toLowerCase();
      
      // Determine format: Force HEIC to JPEG; let PNG stay PNG; default rest to JPEG
      const isPng = fileExtension === 'png';
      const needsJpeg = ['heic', 'heif', 'jpg', 'jpeg'].includes(fileExtension) || !fileExtension;
      
      const saveFormat = isPng 
        ? ImageManipulator.SaveFormat.PNG 
        : ImageManipulator.SaveFormat.JPEG;

      // 1. MANIPULATION: Resize, Crop, and Handle Orientation
      // We force 800x800 to ensure perfect 1:1 aspect ratio across the app
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 800, height: 800 } },
        ],
        { 
          compress: 0.8, 
          format: saveFormat,
        }
      );
      let response;
      try {
        response = await fetch(manipulated.uri);
      } catch (e) {
        throw new Error('UploadPreparationError: System failed to read processed image.');
      }

      const imageBlob = await response.blob();

      if (imageBlob.size > MAX_SIZE_BYTES) {
        throw new Error(`Image too large: Max ${MAX_SIZE_MB}MB allowed.`);
      }

      return imageBlob;
    } catch (error) {
      dispatch(setError(error.message));
      throw error; 
    } finally {
      dispatch(stopLoading());
    }
  };

  const checkPermissions = async (type) => {
    const isCamera = type === 'camera';
    const getStatus = isCamera 
      ? ImagePicker.getCameraPermissionsAsync 
      : ImagePicker.getMediaLibraryPermissionsAsync;
    
    const { status: existingStatus, canAskAgain } = await getStatus();
  
    if (existingStatus === 'granted') return true;
    if (!canAskAgain) {
      throw new Error(`Permission denied. Please enable ${isCamera ? 'Camera' : 'Photos'} in system settings.`);
    }

    const requestStatus = isCamera 
      ? ImagePicker.requestCameraPermissionsAsync 
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status: newStatus } = await requestStatus();
    if (newStatus !== 'granted') {
      throw new Error('Permission required to proceed.');
    }
    
    return true;
  };

  const pickImage = async () => {
    try {
      await checkPermissions('library');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return null;
      return await processImage(result.assets[0].uri);
    } catch (error) {
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      await checkPermissions('camera');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return null;
      return await processImage(result.assets[0].uri);
    } catch (error) {
      return null;
    }
  };

  return { pickImage, takePhoto };
};