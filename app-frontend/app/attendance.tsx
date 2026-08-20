import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, XCircle, Calendar } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const PRIMARY = '#6B5BFF';
const GREEN = '#22c55e';
const RED = '#ef4444';
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }
function getFirstDay(y: number, m: number) { return new Date(y, m - 1, 1).getDay(); }
const pad = (n: number) => String(n).padStart(2, '0');

export default function AttendanceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [history, setHistory] = useState<Record<string, 'P' | 'A'>>({});
  const [stats, setStats] = useState({ totalPresent: 0, totalAbsent: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await request(`/employee/attendance-history?year=${y}&month=${m}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || {});
        setStats({ totalPresent: data.totalPresent, totalAbsent: data.totalAbsent });
      }
    } catch { } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(year, month); }, [year, month]));

  const goPrev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const goNext = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const cells: { day: number | null; status: 'P' | 'A' | 'N'; isToday: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, status: 'N', isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${pad(month)}-${pad(d)}`;
    cells.push({ day: d, status: history[key] ?? 'N', isToday: key === todayStr });
  }

  const pct = (stats.totalPresent + stats.totalAbsent) > 0
    ? Math.round((stats.totalPresent / (stats.totalPresent + stats.totalAbsent)) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={{ backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Attendance Report</Text>
        </View>

        {/* Month summary chips */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: '#86efac', fontWeight: '800', fontSize: 22 }}>{stats.totalPresent}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>Present</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: '#fca5a5', fontWeight: '800', fontSize: 22 }}>{stats.totalAbsent}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>Absent</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 22 }}>{pct}%</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>Attendance</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Calendar Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border, shadowColor: theme.shadow, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>

          {/* Month Nav */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={goPrev} style={{ padding: 8, backgroundColor: theme.chipBg, borderRadius: 10 }}>
              <ChevronLeft size={20} color={theme.subtext} />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{monthName} {year}</Text>
            <TouchableOpacity onPress={goNext} style={{ padding: 8, backgroundColor: theme.chipBg, borderRadius: 10 }}>
              <ChevronRight size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DAYS.map((d, i) => (
              <Text key={i} style={{
                width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '700',
                color: i === 0 || i === 6 ? '#fca5a5' : '#94a3b8',
              }}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map((cell, idx) => {
                const isP = cell.status === 'P';
                const isA = cell.status === 'A';
                return (
                  <View key={idx} style={{ width: `${100 / 7}%`, height: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    {cell.day !== null && (
                      <View style={{
                        width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isP ? '#f0fdf4' : isA ? '#fef2f2' : cell.isToday ? '#eef2ff' : 'transparent',
                        borderWidth: isP || isA || cell.isToday ? 1.5 : 0,
                        borderColor: isP ? GREEN : isA ? RED : cell.isToday ? PRIMARY : 'transparent',
                      }}>
                        <Text style={{
                          fontSize: 13, fontWeight: isP || isA || cell.isToday ? '800' : '500',
                          color: isP ? GREEN : isA ? RED : cell.isToday ? PRIMARY : theme.subtext,
                        }}>{cell.day}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Legend */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
            {[{ color: GREEN, bg: '#f0fdf4', label: 'Present' }, { color: RED, bg: '#fef2f2', label: 'Absent' }, { color: PRIMARY, bg: '#eef2ff', label: 'Today' }].map(({ color, bg, label }) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: bg, borderWidth: 1.5, borderColor: color, marginRight: 5 }} />
                <Text style={{ fontSize: 12, color: theme.subtext, fontWeight: '500' }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontWeight: '700', color: theme.text, fontSize: 14 }}>Attendance Rate</Text>
            <Text style={{ fontWeight: '800', color: pct >= 80 ? GREEN : pct >= 60 ? ORANGE : RED, fontSize: 14 }}>
              {pct}%
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: theme.chipBg, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{
              height: '100%', width: `${pct}%`, borderRadius: 4,
              backgroundColor: pct >= 80 ? GREEN : pct >= 60 ? '#fbbf24' : RED,
            }} />
          </View>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 8 }}>
            {stats.totalPresent} present days out of {stats.totalPresent + stats.totalAbsent} working days
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ORANGE = '#f59e0b';