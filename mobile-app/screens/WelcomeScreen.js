import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons name="shield-plus" size={28} color="#E53935" />
        </View>

        <Text style={styles.logoText}>
          Health<Text style={{ color: "#E53935" }}>Pass</Text>
        </Text>
      </View>

      {/* Heading */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Your Health,{'\n'}Our Priority
        </Text>

        <Text style={styles.subtitle}>
          Book consultations, manage memberships and track your health easily.
        </Text>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/welcome-doctor.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.primaryText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.secondaryText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          By continuing you agree to our{" "}
          <Text style={styles.link}>Terms & Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    justifyContent: "space-between"
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 20
  },

  logoBox: {
    backgroundColor: "#FDECEA",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8
  },

  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333"
  },

  textContainer: {
    alignItems: "center",
    marginTop: 10
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#111"
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 22
  },

  imageContainer: {
    alignItems: "center",
    marginVertical: 20
  },

  image: {
    width: 400,
    height: 300
  },

  buttonContainer: {
    marginBottom: 20
  },

  primaryButton: {
    backgroundColor: "#E53935",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },

  primaryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600"
  },

  secondaryButton: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },

  secondaryText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "600"
  },

  loginText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginTop: 4
  },

  signin: {
    color: "#E53935",
    fontWeight: "600"
  },

  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 10
  },

  link: {
    color: "#E53935"
  }

});