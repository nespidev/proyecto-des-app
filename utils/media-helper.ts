import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { supabase } from './supabase';

export type MediaType = 'Images' | 'Videos' | 'All';

interface PickOptions {
  mediaType?: MediaType;
  allowsEditing?: boolean;
  quality?: number;
}

// --- GALERÍA ---
export const selectMediaFromGallery = async (options: PickOptions = {}) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Permiso denegado", "Necesitamos acceso a la galería.");
    return null;
  }

  let mediaTypes: ImagePicker.MediaType[] = ['images'];
  
  if (options.mediaType === 'Videos') {
    mediaTypes = ['videos'];
  } else if (options.mediaType === 'All') {
    mediaTypes = ['images', 'videos'];
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypes,
      allowsEditing: options.allowsEditing ?? true,
      quality: options.quality ?? 0.5,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
  } catch (e) {
    console.error("[media-helper] Error en selectMediaFromGallery:", e);
  }
  return null;
};

// --- CÁMARA (Con Logs) ---
export const takeMediaFromCamera = async (isVideo: boolean = false) => {
  console.log(`[media-helper] Solicitando cámara. isVideo=${isVideo}`);
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara.");
    return null;
  }

  const mediaTypes: ImagePicker.MediaType[] = isVideo ? ['videos'] : ['images'];

  try {
    console.log("[media-helper] Lanzando launchCameraAsync...");
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: mediaTypes,
      allowsEditing: false, 
      quality: 0.5,
    });

    console.log("[media-helper] Resultado cámara:", JSON.stringify(result, null, 2));

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("[media-helper] Asset válido encontrado:", result.assets[0].uri);
      return result.assets[0];
    } else {
      console.log("[media-helper] Cámara cancelada o sin assets.");
    }
  } catch (error) {
    console.error("[media-helper] Error crítico al abrir cámara:", error);
  }
  return null;
};

// --- DOCUMENTOS ---
export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'audio/*'], 
      copyToCacheDirectory: true,
      multiple: false
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      return {
        uri: file.uri,
        type: file.mimeType?.startsWith('audio') ? 'audio' : 'document', 
        mimeType: file.mimeType || 'application/octet-stream',
        fileName: file.name,
        fileSize: file.size
      };
    }
  } catch (error) {
    console.error("[media-helper] Error seleccionando documento:", error);
  }
  return null;
};

// --- SUBIDA A SUPABASE (Con Logs) ---
export const uploadFileToSupabase = async (
  bucketName: string,
  path: string,
  uri: string,
  fileType: string = 'image/jpeg'
): Promise<string | null> => {
  console.log(`[media-helper] Iniciando subida a Supabase. Path: ${path}, Type: ${fileType}`); // Para debuggear por que no funciona en el emulador
  
  try {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
      uri: uri,
      name: path.split('/').pop() || 'file',
      type: fileType,
    });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, formData, {
        // cacheControl: '3600', // Una hora
        cacheControl: '31536000', // Un año
        upsert: true,
      });

    if (error) {
        console.error("[media-helper] Error de Supabase al subir:", error);
        throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    console.log("[media-helper] Subida exitosa. URL Pública:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error: any) {
    console.error("[media-helper] Excepción subiendo archivo:", error.message);
    Alert.alert("Error", "No se pudo subir el archivo.");
    return null;
  }
};