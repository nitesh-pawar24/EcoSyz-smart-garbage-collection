import React, { useState, useRef } from 'react';
import {
  Animated, ScrollView, Text, TextInput,
  TouchableOpacity, View, FlatList, Dimensions,
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen, Play, Search, Clock, ChevronRight,
  Trash2, Map, Smartphone, Lightbulb, Star, X,
} from 'lucide-react-native';
import { useTheme, Theme } from '../../context/ThemeContext';

const PRIMARY = '#6B5BFF';
const { width: SCREEN_W } = Dimensions.get('window');

// ── Data ────────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Getting Started', 'Best Practices', 'Waste Management', 'App Navigation'];

type Tutorial = {
  id: number; title: string; category: string; duration: string;
  description: string; gradient: [string, string]; icon: any;
  iconColor: string; featured?: boolean; level: string;
};

const TUTORIALS: Tutorial[] = [
  {
    id: 1,
    title: 'How to Scan a Bin QR Code',
    category: 'Getting Started',
    duration: '5:30',
    description: 'Master the QR scanning flow, including tips for bad lighting and damaged codes.',
    gradient: ['#4f46e5', '#818cf8'],
    icon: Smartphone, iconColor: '#ffffff',
    featured: true, level: 'Beginner',
  },
  {
    id: 2,
    title: 'Reporting Bin Issues Correctly',
    category: 'Best Practices',
    duration: '3:45',
    description: 'Learn how to write clear issue reports that get resolved faster.',
    gradient: ['#059669', '#34d399'],
    icon: BookOpen, iconColor: '#ffffff',
    featured: true, level: 'Beginner',
  },
  {
    id: 3,
    title: 'Guide to Waste Segregation',
    category: 'Waste Management',
    duration: '8:12',
    description: 'Detailed guide on dry, wet, hazardous & recyclable waste categories.',
    gradient: ['#d97706', '#fbbf24'],
    icon: Trash2, iconColor: '#ffffff',
    level: 'Intermediate',
  },
  {
    id: 4,
    title: 'Using the Map & Location Features',
    category: 'App Navigation',
    duration: '4:00',
    description: 'Navigate your ward assignments, bin locations and live route on the map.',
    gradient: ['#0284c7', '#38bdf8'],
    icon: Map, iconColor: '#ffffff',
    level: 'Beginner',
  },
  {
    id: 5,
    title: 'Pro Tips for Faster Collections',
    category: 'Best Practices',
    duration: '6:20',
    description: 'Expert strategies to complete your daily route 30% faster.',
    gradient: ['#7c3aed', '#c084fc'],
    icon: Lightbulb, iconColor: '#ffffff',
    level: 'Advanced',
  },
];

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: '#dcfce7', text: '#166534' },
  Intermediate: { bg: '#fef9c3', text: '#854d0e' },
  Advanced: { bg: '#fce7f3', text: '#9d174d' },
};

// ── Featured Card (horizontal scroll) ───────────────────────────────────────
function FeaturedCard({ item, onPress, theme }: { item: Tutorial; onPress: () => void; theme: Theme }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        width: SCREEN_W - 80,
        marginRight: 14, borderRadius: 20, overflow: 'hidden',
        shadowColor: item.gradient[0], shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
      }}>
        {/* Gradient banner */}
        <View style={{ height: 150, backgroundColor: item.gradient[0], justifyContent: 'space-between', padding: 18 }}>
          {/* Top row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 14 }}>
              <item.icon size={24} color={item.iconColor} />
            </View>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>{item.duration}</Text>
            </View>
          </View>
          {/* Play button centre */}
          <View style={{ alignItems: 'center', marginTop: -20 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: 'rgba(255,255,255,0.9)',
              justifyContent: 'center', alignItems: 'center',
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
            }}>
              <Play size={22} color={item.gradient[0]} fill={item.gradient[0]} style={{ marginLeft: 3 }} />
            </View>
          </View>
          {/* Level badge bottom */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>{item.level}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={{ backgroundColor: theme.card, padding: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text, lineHeight: 20, marginBottom: 4 }}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 18 }} numberOfLines={2}>{item.description}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={{ backgroundColor: `${PRIMARY}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginRight: 8 }}>
              <Text style={{ color: PRIMARY, fontSize: 11, fontWeight: '700' }}>{item.category}</Text>
            </View>
            <Clock size={12} color={theme.muted} />
            <Text style={{ color: theme.muted, fontSize: 12, marginLeft: 4 }}>{item.duration}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── List Row Card ────────────────────────────────────────────────────────────
function TutorialRow({ item, onPress, theme }: { item: Tutorial; onPress: () => void; theme: Theme }) {
  const levelCfg = LEVEL_COLORS[item.level] ?? LEVEL_COLORS.Beginner;
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.card, borderRadius: 18, padding: 14, marginBottom: 10,
        shadowColor: theme.shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
        borderWidth: 1, borderColor: theme.border,
      }}
    >
      {/* Icon box */}
      <View style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: item.gradient[0], justifyContent: 'center', alignItems: 'center', marginRight: 14,
      }}>
        <item.icon size={24} color="white" />
        {/* Mini play */}
        <View style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center',
          borderWidth: 1.5, borderColor: item.gradient[0],
        }}>
          <Play size={8} color={item.gradient[0]} fill={item.gradient[0]} style={{ marginLeft: 1 }} />
        </View>
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, lineHeight: 20, marginBottom: 4 }} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: levelCfg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
            <Text style={{ color: levelCfg.text, fontSize: 10, fontWeight: '700' }}>{item.level}</Text>
          </View>
          <Clock size={12} color={theme.muted} />
          <Text style={{ color: theme.muted, fontSize: 12 }}>{item.duration}</Text>
        </View>
      </View>

      <ChevronRight size={18} color={theme.border} style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function TutorialScreen() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const featured = TUTORIALS.filter(t => t.featured);

  const filtered = TUTORIALS.filter(t => {
    const matchCat = activeTab === 'All' || t.category === activeTab;
    const matchSearch = search.trim() === '' || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const showAlert = () => setAlertVisible(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>

      {/* ── Header ─────────────────────────────── */}
      <View style={{
        backgroundColor: PRIMARY,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        marginBottom: 16,
      }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 }}>Tutorials</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, marginBottom: 14 }}>
          {TUTORIALS.length} video guides to master the app
        </Text>

        {/* Search inside header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
          paddingHorizontal: 14, height: 44,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
        }}>
          <Search size={16} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={{ flex: 1, marginLeft: 10, fontSize: 14, color: 'white' }}
            placeholder="Search tutorials…"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Featured strip (only when no search / filter active) ─── */}
        {search.trim() === '' && activeTab === 'All' && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text, marginLeft: 6 }}>Featured</Text>
              </View>
              <Text style={{ fontSize: 12, color: theme.muted, fontWeight: '600' }}>Swipe →</Text>
            </View>
            <FlatList
              data={featured}
              horizontal
              keyExtractor={item => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => <FeaturedCard item={item} onPress={showAlert} theme={theme} />}
            />
          </View>
        )}

        {/* ── Category Filter Tabs ───────────────── */}
        <View style={{ marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {CATEGORIES.map(cat => {
              const active = cat === activeTab;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveTab(cat)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: active ? PRIMARY : theme.card,
                    borderWidth: 1.5, borderColor: active ? PRIMARY : theme.border,
                    shadowColor: active ? PRIMARY : theme.shadow,
                    shadowOpacity: active ? 0.2 : 0.03,
                    shadowRadius: active ? 8 : 4, elevation: active ? 3 : 1,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: active ? 'white' : theme.chipText }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Section label ─────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
            {activeTab === 'All' ? 'All Tutorials' : activeTab}
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>
            {filtered.length} {filtered.length === 1 ? 'video' : 'videos'}
          </Text>
        </View>

        {/* ── List ──────────────────────────────── */}
        <View style={{ paddingHorizontal: 20 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <BookOpen size={48} color={theme.border} />
              <Text style={{ color: theme.muted, marginTop: 14, fontSize: 15, fontWeight: '600' }}>No tutorials found</Text>
              <Text style={{ color: theme.border, fontSize: 13, marginTop: 4 }}>Try a different search or category</Text>
            </View>
          ) : (
            filtered.map(item => <TutorialRow key={item.id} item={item} onPress={showAlert} theme={theme} />)
          )}
        </View>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title="Coming Soon 🎬"
        message="Video playback will be available in the next update. Stay tuned!"
        type="info"
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}