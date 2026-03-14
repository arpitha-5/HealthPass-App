import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";

const PRIMARY = "#E53935";

const DoctorProfileScreen = ({ route, navigation }) => {

    const { doctor } = route.params;

    return (

        <SafeAreaView style={styles.container}>

            <View style={styles.profile}>

                <Avatar name={doctor.name} size={90} />

                <Text style={styles.name}>{doctor.name}</Text>

                <Text style={styles.spec}>{doctor.specialization}</Text>

                <Text style={styles.rating}>⭐ {doctor.rating}</Text>

            </View>

            <View style={styles.info}>

                <Text style={styles.label}>Experience</Text>
                <Text>{doctor.experience} years</Text>

                <Text style={styles.label}>Consultation Fee</Text>
                <Text>₹{doctor.fee}</Text>

                <Text style={styles.label}>About</Text>
                <Text>{doctor.about || "Experienced healthcare professional."}</Text>

            </View>

            <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => navigation.navigate("BookAppointment", { doctor })}
            >

                <Text style={styles.bookText}>Book Appointment</Text>

            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default DoctorProfileScreen;

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: "#fff" },

    profile: {
        alignItems: "center",
        marginTop: 30
    },

    name: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 12
    },

    spec: {
        color: "#64748B",
        marginTop: 4
    },

    rating: {
        marginTop: 4
    },

    info: {
        marginTop: 30,
        paddingHorizontal: 20
    },

    label: {
        marginTop: 14,
        fontWeight: "600"
    },

    bookBtn: {
        backgroundColor: PRIMARY,
        margin: 20,
        padding: 16,
        borderRadius: 14,
        alignItems: "center"
    },

    bookText: {
        color: "#fff",
        fontWeight: "700"
    }

});