import React from "react";
import { View, Text, StyleSheet } from "react-native";

type MockCardProps = {
  titulo?: string;
};

const MockCard = ({ titulo }: MockCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder} />

      {titulo ? (
        <Text style={styles.title}>{titulo}</Text>
      ) : (
        <View style={[styles.textPlaceholder, { width: "70%" }]} />
      )}

      <View style={styles.textPlaceholder} />
      <View style={[styles.textPlaceholder, { width: "60%" }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textPlaceholder: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default MockCard;
