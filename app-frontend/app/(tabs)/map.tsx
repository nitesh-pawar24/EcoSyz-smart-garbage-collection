import { Maximize2, Minimize2, MapPin, Search, X, RefreshCw, CheckCircle2, Clock3 } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, Text, TextInput, TouchableOpacity, View,
  ActivityIndicator, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { request } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const PRIMARY = '#6B5BFF';
const GREEN = '#22c55e';

type BinItem = {
  _id: string; binCode: string; locationText: string;
  ward: string; type: string; geo: { lat: number; lng: number }; scanned: boolean;
};

function buildInitialLeafletHTML(lat: number, lng: number, isDark: boolean) {
  const tileDark = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>*{margin:0;padding:0;box-sizing:border-box}html,body,#map{width:100%;height:100%}</style>
  </head><body><div id="map"></div><script>
  var map=L.map('map').setView([${lat},${lng}],15);
  L.tileLayer('${tileDark}',{attribution:'© OSM',maxZoom:19}).addTo(map);
  var markerLayer = L.layerGroup().addTo(map);

  // Listen for messages from React Native to update markers
  document.addEventListener('message', function(e) {
    try {
      var data = JSON.parse(e.data);
      if (data.type === 'UPDATE_BINS') {
        markerLayer.clearLayers();
        data.bins.forEach(function(b) {
          var color = b.scanned ? 'green' : 'blue';
          var m = L.marker([b.geo.lat, b.geo.lng], {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + color + '.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34]
            })
          }).bindPopup('<b>' + b.binCode + '</b><br>' + b.locationText + (b.scanned ? '<br><span style="color:green">✓ Collected</span>' : ''));
          markerLayer.addLayer(m);
        });
      }
    } catch(err) {}
  });

  // Polyfill for iOS React Native WebView message passing
  window.addEventListener('message', function(e) {
    document.dispatchEvent(new MessageEvent('message', { data: e.data }));
  });

  </script></body></html>`;
}

function MapWebView({ bins, lat, lng, isDark }: { bins: BinItem[], lat: number, lng: number, isDark: boolean }) {
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  const webViewRef = React.useRef<WebView>(null);

  // Memoize the initial HTML so Webview doesn't reload.
  const initialHtml = React.useMemo(() => buildInitialLeafletHTML(lat, lng, isDark), [isDark]);

  useEffect(() => {
    if (ready && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'UPDATE_BINS', bins }));
    }
  }, [bins, ready]);

  return (
    <View style={{ flex: 1 }}>
      {!ready && (
        <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: theme.card }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: theme.primary, marginTop: 10, fontSize: 13, fontWeight: '600' }}>Loading map…</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: initialHtml }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        onLoad={() => setReady(true)}
      />
    </View>
  );
}

export default function MapScreen() {
  const { theme, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 15.2632, lng: 73.9676 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bins, setBins] = useState<BinItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      if (granted) {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        } catch { }
      }
    })();
  }, []);

  const fetchBins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request('/attendance/my-bins');
      if (res.ok) setBins(await res.json());
    } catch { } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchBins(); }, [fetchBins]));

  const filteredBins = bins.filter(b =>
    b.locationText.toLowerCase().includes(search.toLowerCase()) ||
    b.binCode.toLowerCase().includes(search.toLowerCase())
  );

  const collected = bins.filter(b => b.scanned).length;
  const pending = bins.filter(b => !b.scanned).length;

  const renderMap = () => {
    if (hasPermission === null) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.card }}>
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
    if (hasPermission === false) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.card }}>
        <MapPin size={36} color={theme.muted} />
        <Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 12 }}>Location permission required to view the map.</Text>
      </View>
    );
    return <MapWebView bins={bins} lat={userLocation.lat} lng={userLocation.lng} isDark={isDark} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* ── Header ─────────────────────────── */}
      <View style={{ backgroundColor: PRIMARY, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', letterSpacing: 1 }}>My Route Map</Text>
          <TouchableOpacity onPress={fetchBins} style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 10 }}>
            <RefreshCw size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Summary Chips */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { icon: CheckCircle2, iconColor: '#86efac', label: 'Collected', value: collected },
            { icon: Clock3, iconColor: '#fde68a', label: 'Pending', value: pending },
            { icon: MapPin, iconColor: 'rgba(255,255,255,0.8)', label: 'Total', value: bins.length },
          ].map(({ icon: Icon, iconColor, label, value }) => (
            <View key={label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Icon size={18} color={iconColor} />
              <View style={{ marginLeft: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{label}</Text>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Map Card ───────────────────────── */}
      <View style={{
        marginHorizontal: 16, marginTop: 16, borderRadius: 18, overflow: 'hidden',
        height: 220, borderWidth: 1, borderColor: theme.border,
        shadowColor: theme.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        marginBottom: 14,
        opacity: 0.99, // Fix for Android WebView disappearing bug when using overflow: hidden + border radius
      }}>
        {renderMap()}
        <TouchableOpacity
          onPress={() => setIsFullscreen(true)}
          style={{ position: 'absolute', top: 10, right: 10, backgroundColor: theme.card, borderRadius: 10, padding: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20 }}
        >
          <Maximize2 size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ── Search ─────────────────────────── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card,
        borderRadius: 14, marginHorizontal: 16, marginBottom: 12,
        paddingHorizontal: 14, height: 46,
        shadowColor: theme.shadow, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
        borderWidth: 1, borderColor: theme.border,
      }}>
        <Search size={17} color={theme.muted} />
        <TextInput
          style={{ flex: 1, marginLeft: 10, fontSize: 14, color: theme.text }}
          placeholder="Search bin code or location…"
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={16} color={theme.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Bin List Label ─────────────────── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.subtext }}>Near Duty Location</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[{ color: GREEN, label: 'Done' }, { color: theme.muted, label: 'Pending' }].map(({ color, label }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 4 }} />
              <Text style={{ fontSize: 11, color: theme.muted }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── List ───────────────────────────── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: theme.muted, marginTop: 10 }}>Loading bins…</Text>
        </View>
      ) : filteredBins.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <MapPin size={40} color={theme.border} />
          <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 12 }}>
            {bins.length === 0 ? 'No bins assigned to your ward.' : 'No bins match your search.'}
          </Text>
        </View>
      ) : (
        <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredBins.map((bin) => (
            <View key={bin._id} style={{
              flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 10,
              backgroundColor: bin.scanned ? (isDark ? '#052e16' : '#f0fdf4') : theme.card,
              borderWidth: 1, borderColor: bin.scanned ? '#86efac' : theme.border,
              shadowColor: theme.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
            }}>
              <View style={{
                width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14,
                backgroundColor: bin.scanned ? '#dcfce7' : theme.chipBg,
              }}>
                <MapPin size={20} color={bin.scanned ? GREEN : theme.muted} fill={bin.scanned ? '#dcfce7' : 'transparent'} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: theme.text, fontSize: 14 }} numberOfLines={1}>{bin.locationText}</Text>
                <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>{bin.binCode} · {bin.type} · Ward {bin.ward}</Text>
              </View>

              <View style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                backgroundColor: bin.scanned ? '#dcfce7' : theme.chipBg,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: bin.scanned ? GREEN : theme.muted }}>
                  {bin.scanned ? '✓ Done' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Fullscreen Map Modal */}
      <Modal visible={isFullscreen} animationType="slide" statusBarTranslucent onRequestClose={() => setIsFullscreen(false)}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: PRIMARY }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: 'white', letterSpacing: 1 }}>Full Map View</Text>
            <TouchableOpacity onPress={() => setIsFullscreen(false)} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
              <Minimize2 size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>{renderMap()}</View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}