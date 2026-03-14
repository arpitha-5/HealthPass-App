import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import Avatar from "../components/Avatar";
import apiClient from "../services/apiService";

const PRIMARY = "#E53935";

const DoctorListScreen = ({ navigation }) => {

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await apiClient.get("/doctors");

            if (res.data.success) {
                setDoctors(res.data.doctors);
            }

        } catch (e) {
            console.log(e);
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={PRIMARY} />
            </View>
        );
    }

    return (

        <SafeAreaView style={styles.container}>

            <View style={styles.searchBox}>

                <Feather name="search" size={20} color="#64748B" />

                <TextInput
                    placeholder="Search doctor"
                    style={styles.input}
                    value={search}
                    onChangeText={setSearch}
                />

            </View>

            <FlatList
                data={doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))}
                keyExtractor={(item, i) => i.toString()}
                renderItem={({ item }) => (

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("DoctorProfile", { doctor: item })}
                    >

                        <Avatar name={item.name} size={50} />

                        <View style={styles.cardInfo}>

                            <Text style={styles.name}>{item.name}</Text>

                            <Text style={styles.spec}>{item.specialization}</Text>

                            <View style={styles.metaRow}>

                                <Text style={styles.rating}>⭐ {item.rating}</Text>

                                <Text style={styles.exp}>{item.experience} yrs</Text>

                            </View>

                        </View>

                        <TouchableOpacity style={styles.bookBtn}>
                            <Text style={styles.bookText}>Book</Text>
                        </TouchableOpacity>

                    </TouchableOpacity>

                )}
            />

        </SafeAreaView>
    );
};

export default DoctorListScreen;

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: "#fff" },

    loader: { flex: 1, justifyContent: "center", alignItems: "center" },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        margin: 20,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48
    },

    input: { flex: 1, marginLeft: 10 },

    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: "#fff",
        borderRadius: 14,
        elevation: 2
    },

    cardInfo: { flex: 1, marginLeft: 12 },

    name: { fontWeight: "600", fontSize: 15 },

    spec: { fontSize: 12, color: "#64748B" },

    metaRow: { flexDirection: "row", marginTop: 4 },

    rating: { fontSize: 12, marginRight: 10 },

    exp: { fontSize: 12, color: "#64748B" },

    bookBtn: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8
    },

    bookText: { color: "#fff", fontSize: 12 }

});