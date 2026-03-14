import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/index';
import hospitalService from '../services/hospitalService';

const { width, height } = Dimensions.get('window');

const HospitalMapScreen = ({ route, navigation }) => {
  const mapRef = useRef(null);
  const routeHospital = route.params?.hospital;

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(routeHospital || null);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 17.3850, // Default to Hyderabad (per example)
    longitude: 78.4867,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    initMap();
  }, []);

  const initMap = async () => {
    try {
      setLoading(true);
      const loc = await hospitalService.getUserLocation();
      setUserLocation(loc);

      let initialRegion = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      if (routeHospital) {
        initialRegion = {
          ...initialRegion,
          latitude: routeHospital.latitude,
          longitude: routeHospital.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
      }

      setRegion(initialRegion);

      // Fetch hospitals
      const results = await hospitalService.fetchNearbyHospitals(loc.latitude, loc.longitude);
      setHospitals(results);
    } catch (error) {
      console.log('Error initializing map:', error);
    } finally {
      setLoading(false);
    }
  };

  const onMarkerPress = (hospital) => {
    setSelectedHospital(hospital);
    setRegion({
      ...region,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
    });

    // Animate to marker
    mapRef.current?.animateToRegion({
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  };

  const renderHospitalCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.hCard,
        selectedHospital?.id === item.id && styles.selectedHCard
      ]}
      activeOpacity={0.9}
      onPress={() => onMarkerPress(item)}
    >
      <View style={styles.hRow}>
        <View style={[styles.hIconBox, { backgroundColor: item.isOpen ? '#FEE2E2' : '#F1F5F9' }]}>
          <MaterialCommunityIcons
            name="hospital-building"
            size={24}
            color={item.isOpen ? Colors.primary : '#94A3B8'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.hType}>{item.vicinity}</Text>
          <View style={styles.hMeta}>
            <Text style={styles.hDist}>{item.distance} km away</Text>
            <Text style={styles.hRating}>⭐ {item.rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.directionBtn}
        onPress={() => {
          // Open external maps if needed, but for now just console log
          console.log(`Navigating to ${item.name}`);
        }}
      >
        <Feather name="navigation" size={16} color="#fff" />
        <Text style={styles.directionText}>Directions</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            title={hospital.name}
            description={hospital.vicinity}
            onPress={() => setSelectedHospital(hospital)}
          >
            <View style={[
              styles.customMarker,
              selectedHospital?.id === hospital.id && styles.selectedMarker
            ]}>
              <MaterialCommunityIcons
                name="hospital"
                size={selectedHospital?.id === hospital.id ? 24 : 18}
                color="#fff"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Header Overlay */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Hospitals Near You</Text>
          </View>
        </View>

        {/* Bottom Carousel */}
        <View style={styles.carouselContainer}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
            </View>
          ) : (
            <FlatList
              data={hospitals}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderHospitalCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              snapToInterval={width - 60}
              decelerationRate="fast"
            />
          )}
        </View>

        {/* My Location FAB */}
        {!loading && (
          <TouchableOpacity
            style={styles.locationFab}
            onPress={() => {
              if (userLocation) {
                mapRef.current?.animateToRegion({
                  ...userLocation,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }, 1000);
              }
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.md,
  },
  headerTitleContainer: {
    flex: 1, marginLeft: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 10, paddingHorizontal: 20,
    ...Shadows.md,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  customMarker: {
    backgroundColor: Colors.primary,
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    ...Shadows.sm,
  },
  selectedMarker: {
    backgroundColor: '#1E293B',
    transform: [{ scale: 1.2 }],
    zIndex: 10,
  },

  carouselContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0, right: 0,
  },
  hCard: {
    width: width - 80,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginRight: 20,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  selectedHCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  hRow: { flexDirection: 'row', gap: 12 },
  hIconBox: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  hName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  hType: { fontSize: 13, color: '#64748B', marginTop: 2 },
  hMeta: { flexDirection: 'row', gap: 10, marginTop: 10 },
  hDist: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  hRating: { fontSize: 12, color: '#64748B' },
  directionBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginTop: 15,
    paddingVertical: 10,
    gap: 8,
  },
  directionText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  loadingBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 40,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    ...Shadows.md,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  locationFab: {
    position: 'absolute',
    bottom: 230,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
});

export default HospitalMapScreen;
