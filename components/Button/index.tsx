import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { materialColors } from "../../utils/colors";

interface IProps {
  onPress: () => void;
  disabled?: boolean;
  title: string;
}

export default function Button(props: IProps) {
  const { onPress, disabled, title } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7} // feedback visual al presionar
    >
      <View style={[styles.container, disabled && styles.disabledContainer]}>
        <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: materialColors.schemes.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    minWidth: 200, 
    maxWidth: 300,
  },
  disabledContainer: {
    backgroundColor: materialColors.coreColors.neutral,
  },
  text: {
    color: materialColors.schemes.light.onPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledText: {
    color: materialColors.schemes.light.onSurfaceVariant,
  },
});
