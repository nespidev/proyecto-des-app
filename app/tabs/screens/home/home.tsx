import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "@/utils/globalStyles";
import MockCard from "@/components/MockCard";
import { materialColors } from "@/utils/colors";
import { TAB_ROUTES } from "@/utils/constants";
import SearchEntryCard from "@/components/SearchEntryCard";

const dataMockUp = [
  { id: "1", titulo: "Rutina de Fuerza" },
  { id: "2", titulo: "Dieta Keto" },
  { id: "3", titulo: "Tips de Yoga" },
];

export default function Home() {
  const navigation = useNavigation<any>();

  const handleNavigateToSearch = () => {
    navigation.navigate(TAB_ROUTES.BUSQUEDA_PERFILES);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Text style={globalStyles.title}>Hola de nuevo 👋</Text>
          <Text style={globalStyles.subtitle}>¿Listo para entrenar hoy?</Text>
        </View>

        <SearchEntryCard onPress={handleNavigateToSearch} />

        <Text style={styles.sectionTitle}>Tus accesos rápidos</Text>
        <MockCard titulo="Ver mi Rutina actual" />

        <Text style={styles.sectionTitle}>Novedades</Text>
        <FlatList
          data={dataMockUp}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MockCard style={styles.horizontalCard} titulo={item.titulo} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          nestedScrollEnabled
        />
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: materialColors.schemes.light.surface,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
    color: materialColors.schemes.light.onSurface,
  },
  horizontalList: {
    paddingBottom: 8,
    paddingRight: 16,
  },
  horizontalCard: {
    width: 200,

    marginRight: 12,
  },
});