import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { materialColors } from "@/utils/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: (option: 'camera_photo' | 'camera_video' | 'gallery' | 'document') => void;
}

const { width } = Dimensions.get('window');

export default function AttachmentModal({ visible, onClose, onOptionSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {/* Barra indicadora visual */}
              <View style={styles.handle} />
              
              <Text style={styles.title}>Compartir contenido</Text>
              
              <View style={styles.grid}>
                <Option 
                    icon="camera" 
                    label="Cámara" 
                    color={materialColors.schemes.light.primary}
                    onPress={() => onOptionSelect('camera_photo')} 
                />
                <Option 
                    icon="videocam" 
                    label="Grabar Video" 
                    color={materialColors.schemes.light.tertiary}
                    onPress={() => onOptionSelect('camera_video')} 
                />
                <Option 
                    icon="images" 
                    label="Galería" 
                    color={materialColors.schemes.light.secondary}
                    onPress={() => onOptionSelect('gallery')} 
                />
                <Option 
                    icon="document-text" 
                    label="Archivo / Audio" 
                    color={materialColors.schemes.light.outline} 
                    onPress={() => onOptionSelect('document')} 
                />
              </View>

              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Subcomponente para cada botón de opción
const Option = ({ icon, label, color, onPress }: any) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}> 
            {/* '20' añade transparencia hex al color base para el fondo suave */}
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  content: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    // Sombra sutil para elevación
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 24, 
    color: materialColors.schemes.light.onSurface 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    width: '100%',
    marginBottom: 10
  },
  option: { 
    width: (width - 48) / 2 - 10, // Ancho dinámico para 2 columnas
    alignItems: 'center', 
    marginBottom: 24 
  },
  iconCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  label: { 
    fontSize: 14, 
    color: materialColors.schemes.light.onSurfaceVariant,
    fontWeight: '500'
  },
  cancelBtn: { 
    width: '100%',
    padding: 16, 
    alignItems: 'center', 
    backgroundColor: materialColors.schemes.light.surfaceContainerHigh, 
    borderRadius: 12 
  },
  cancelText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: materialColors.schemes.light.error 
  }
});