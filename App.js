import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const CURRENCY_RATES = {
  INR: 1,
  USD: 83.2,
  EUR: 88.5,
};

const TAB_LABELS = ['Summary', 'Trending', 'Explorer'];

const SORT_OPTIONS = [
  { key: 'rank', label: 'Rank' },
  { key: 'price_high', label: 'Price ↓' },
  { key: 'price_low', label: 'Price ↑' },
  { key: 'market_cap', label: 'Market Cap' },
  { key: 'change', label: '24h Change' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Summary');
  const [currency, setCurrency] = useState('INR');
  const [sortBy, setSortBy] = useState('rank');
  const [searchText, setSearchText] = useState('');
  const [coins, setCoins] = useState([]);
  const [trending, setTrending] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    setError('');
    try {
      const [marketResponse, globalResponse, trendingResponse] = await Promise.all([
        axios.get(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=80&page=1&sparkline=false&price_change_percentage=24h',
        ),
        axios.get('https://api.coingecko.com/api/v3/global'),
        axios.get('https://api.coingecko.com/api/v3/search/trending'),
      ]);

      const mappedCoins = marketResponse.data.map((item, index) => ({
        id: item.id || `${item.symbol}-${index}`,
        rank: item.market_cap_rank || index + 1,
        name: item.name || 'Unknown',
        symbol: (item.symbol || '').toUpperCase(),
        image: item.image,
        price: item.current_price || 0,
        marketCap: item.market_cap || 0,
        volume: item.total_volume || 0,
        change24h: item.price_change_percentage_24h || 0,
      }));

      setCoins(mappedCoins);
      setGlobalStats(globalResponse.data.data);
      setTrending(
        trendingResponse.data.coins.map((entry) => ({
          id: entry.item.id,
          name: entry.item.name,
          symbol: entry.item.symbol.toUpperCase(),
          image: entry.item.small,
          marketCapRank: entry.item.market_cap_rank,
        })),
      );
    } catch (err) {
      setError('Unable to load market data. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => {
    const rate = CURRENCY_RATES[currency] || 1;
    const symbol = CURRENCY_SYMBOLS[currency] || '?';
    return `${symbol}${(value / rate).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCompact = (value) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const filteredCoins = coins.filter((item) => {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;
    return item.name.toLowerCase().includes(query) || item.symbol.toLowerCase().includes(query);
  });

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'market_cap') return b.marketCap - a.marketCap;
    if (sortBy === 'change') return b.change24h - a.change24h;
    return a.rank - b.rank;
  });

  const topGainers = [...coins]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 4);

  const topLosers = [...coins]
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 4);

  const priceColor = (change) => (change >= 0 ? '#4ADE80' : '#FB7185');

  const renderCoinItem = ({ item }) => (
    <View style={styles.rowCard}>
      <View style={styles.rowCardLeft}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
        {item.image ? <Image source={{ uri: item.image }} style={styles.coinImage} /> : null}
        <View>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowSubtitle}>{item.symbol}</Text>
        </View>
      </View>
      <View style={styles.rowCardRight}>
        <Text style={styles.rowPrice}>{formatPrice(item.price)}</Text>
        <Text style={[styles.rowChange, { color: priceColor(item.change24h) }]}>
          {item.change24h.toFixed(2)}%
        </Text>
      </View>
    </View>
  );

  const renderTrendingItem = ({ item }) => (
    <View style={styles.trendingCard}>
      <View style={styles.trendingRow}>
        {item.image ? <Image source={{ uri: item.image }} style={styles.trendingImage} /> : null}
        <View>
          <Text style={styles.trendingTitle}>{item.name}</Text>
          <Text style={styles.trendingSubtitle}>#{item.marketCapRank || 'N/A'}</Text>
        </View>
      </View>
      <Text style={styles.trendingSymbol}>{item.symbol}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#5B8CFF" />
          <Text style={styles.loadingText}>Loading new market insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingScreen}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={loadMarketData}>
            <Text style={styles.reloadButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dominant = globalStats?.market_cap_percentage?.btc ? `${globalStats.market_cap_percentage.btc.toFixed(1)}% BTC` : '-';
  const marketCap = globalStats?.total_market_cap?.inr ? formatCompact(globalStats.total_market_cap.inr) : '-';
  const volume24h = globalStats?.total_volume?.inr ? formatCompact(globalStats.total_volume.inr) : '-';
  const marketChange = globalStats?.market_cap_change_percentage_24h_usd
    ? `${globalStats.market_cap_change_percentage_24h_usd.toFixed(2)}%`
    : '-';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PulseX</Text>
            <Text style={styles.subtitle}>Your premium crypto pulseboard.</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={loadMarketData}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {TAB_LABELS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Global Cap</Text>
            <Text style={styles.metricValue}>{marketCap}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>24h Volume</Text>
            <Text style={styles.metricValue}>{volume24h}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>BTC Dominance</Text>
            <Text style={styles.metricValue}>{dominant}</Text>
          </View>
        </View>

        <View style={styles.currencyRow}>
          {Object.keys(CURRENCY_SYMBOLS).map((code) => (
            <TouchableOpacity
              key={code}
              onPress={() => setCurrency(code)}
              style={[styles.currencyChip, currency === code && styles.currencyChipActive]}
            >
              <Text style={[styles.currencyChipText, currency === code && styles.currencyChipTextActive]}>
                {code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Summary' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily pulse</Text>
              <Text style={styles.sectionSubtitle}>Top movers and market sentiment in one view.</Text>
            </View>

            <View style={styles.highlightsRow}>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightLabel}>24h Market Trend</Text>
                <Text style={styles.highlightValue}>{marketChange}</Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightLabel}>Tracked coins</Text>
                <Text style={styles.highlightValue}>{coins.length}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Top gainers</Text>
            <FlatList
              data={topGainers}
              keyExtractor={(item) => item.id}
              renderItem={renderCoinItem}
              scrollEnabled={false}
            />

            <Text style={styles.sectionLabel}>Top losers</Text>
            <FlatList
              data={topLosers}
              keyExtractor={(item) => item.id}
              renderItem={renderCoinItem}
              scrollEnabled={false}
            />
          </>
        )}

        {activeTab === 'Trending' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending now</Text>
              <Text style={styles.sectionSubtitle}>Cryptocurrencies that are currently gaining attention.</Text>
            </View>

            <FlatList
              data={trending}
              keyExtractor={(item) => item.id}
              renderItem={renderTrendingItem}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No trending coins found.</Text>}
            />
          </>
        )}

        {activeTab === 'Explorer' && (
          <>
            <View style={styles.searchRow}>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search coins or symbols"
                placeholderTextColor="#7587B8"
                style={styles.searchInput}
              />
            </View>

            <View style={styles.sortRow}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSortBy(option.key)}
                  style={[styles.sortButton, sortBy === option.key && styles.sortButtonActive]}
                >
                  <Text style={[styles.sortText, sortBy === option.key && styles.sortTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              data={sortedCoins}
              keyExtractor={(item) => item.id}
              renderItem={renderCoinItem}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No coins match your search.</Text>}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1331',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    color: '#F8FBFF',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: '#9BB3E1',
    marginTop: 8,
    fontSize: 14,
    maxWidth: '80%',
  },
  refreshButton: {
    backgroundColor: '#4F7BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#121B43',
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#1F49FF',
  },
  tabText: {
    color: '#B3C2E7',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    marginRight: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#101B43',
    borderWidth: 1,
    borderColor: '#1F2B66',
  },
  metricLabel: {
    color: '#7E96CC',
    fontSize: 12,
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  currencyRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  currencyChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2B66',
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#101A3F',
  },
  currencyChipActive: {
    backgroundColor: '#304BFF',
    borderColor: '#304BFF',
  },
  currencyChipText: {
    color: '#B3C2E7',
    fontWeight: '700',
  },
  currencyChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#8CA5D5',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },
  highlightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  highlightCard: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#121C4A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2B66',
  },
  highlightLabel: {
    color: '#7E96CC',
    fontSize: 12,
    marginBottom: 10,
  },
  highlightValue: {
    color: '#F8FBFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111B40',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2B66',
  },
  rowCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#1F2B66',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#ADC5FF',
    fontWeight: '700',
  },
  coinImage: {
    width: 34,
    height: 34,
    borderRadius: 999,
    marginRight: 12,
  },
  rowTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: '#8D9FC9',
    marginTop: 2,
    fontSize: 12,
  },
  rowCardRight: {
    alignItems: 'flex-end',
  },
  rowPrice: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  rowChange: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  trendingCard: {
    backgroundColor: '#111B40',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2B66',
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingImage: {
    width: 38,
    height: 38,
    borderRadius: 999,
    marginRight: 12,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  trendingSubtitle: {
    color: '#8D9FC9',
    fontSize: 12,
    marginTop: 4,
  },
  trendingSymbol: {
    color: '#5B8BFF',
    fontWeight: '700',
  },
  searchRow: {
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#121D45',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1F2B66',
  },
  sortRow: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#121D45',
    borderWidth: 1,
    borderColor: '#1F2B66',
    marginRight: 10,
    marginBottom: 10,
  },
  sortButtonActive: {
    backgroundColor: '#385BFF',
    borderColor: '#385BFF',
  },
  sortText: {
    color: '#B3C2E7',
    fontWeight: '700',
    fontSize: 12,
  },
  sortTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#8D9FC9',
    textAlign: 'center',
    marginTop: 24,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#B3C2E7',
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF8DAA',
    fontSize: 16,
    marginBottom: 18,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#4F7BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
