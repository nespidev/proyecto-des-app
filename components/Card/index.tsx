import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { materialColors } from "@/utils/colors";

type CardProps = {
  titulo?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  imagePlaceholder?: boolean;
};

const colors = materialColors.schemes.light;

const Card = ({ titulo, style, children}: CardProps) => {
  return (
    <View style={[styles.card, style]}>
      { titulo && <Text style={styles.title}>{titulo}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: colors.surfaceDim,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 8,
  },
});

export default Card;
