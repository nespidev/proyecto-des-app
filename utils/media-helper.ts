import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from './supabase';

// Tipos de medios que aceptaremos en nuestra función
export type MediaType = 'Images' | 'Videos' | 'All';

interface PickOptions {
  mediaType?: MediaType;
  allowsEditing?: boolean;
  quality?: number;
}

/**
 * Abre la galería para seleccionar fotos o videos
 */
export const selectMediaFromGallery = async (options: PickOptions = {}) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Permiso denegado", "Necesitamos acceso a la galería.");
    return null;
  }

  // CORRECCIÓN: Mapeamos a array de strings ['images', 'videos']
  let mediaTypes: ImagePicker.MediaType[] = ['images'];
  
  if (options.mediaType === 'Videos') {
    mediaTypes = ['videos'];
  } else if (options.mediaType === 'All') {
    mediaTypes = ['images', 'videos'];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: mediaTypes, // Pasamos el array
    allowsEditing: options.allowsEditing ?? true,
    quality: options.quality ?? 0.5,
    // Importante: NO pedimos base64 aquí para soportar videos grandes
  });

  if (!result.canceled) {
    return result.assets[0]; // Retornamos el asset completo (uri, type, etc)
  }
  return null;
};

/**
 * Toma una foto con la cámara
 */
export const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.5,
    // Por defecto la cámara captura imágenes
  });

  if (!result.canceled) {
    return result.assets[0];
  }
  return null;
};

/**
 * Sube cualquier archivo (foto o video) a Supabase usando FormData
 * Esta forma es más robusta para archivos grandes que el base64.
 */
export const uploadFileToSupabase = async (
  bucketName: string,
  path: string,
  uri: string,
  fileType: string = 'image/jpeg' // ej: 'video/mp4'
): Promise<string | null> => {
  try {
    // 1. Crear un objeto FormData (como si fuera un formulario web)
    const formData = new FormData();
    
    // @ts-ignore: React Native espera estos campos específicos para subir archivos
    formData.append('file', {
      uri: uri,
      name: path.split('/').pop() || 'file', // Nombre del archivo
      type: fileType,
    });

    // 2. Subir usando el método estándar (más eficiente para videos)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, formData, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // 3. Obtener URL Pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return urlData.publicUrl;

  } catch (error: any) {
    console.error("Error subiendo archivo:", error.message);
    Alert.alert("Error", "No se pudo subir el archivo.");
    return null;
  }
};