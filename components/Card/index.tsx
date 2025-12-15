import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { materialColors } from "@/utils/colors";

type CardProps = {
  titulo?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  // imagePlaceholder?: boolean;
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
    marginBottom: 8
  },
  // imagePlaceholder: {
  //   width: "100%",
  //   height: 150,
  //   backgroundColor: colors.surfaceDim,
  //   borderRadius: 8,
  //   marginBottom: 12,
  // },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 8,
  },
});

export default Card;
