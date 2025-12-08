import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppTheme } from '@/theme';

const FAQ_DATA = [
  {
    question: 'Bagaimana cara memesan?',
    answer: 'Pilih produk yang Anda inginkan, masukkan ke keranjang, lalu lakukan checkout dan pembayaran sesuai instruksi.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima transfer bank, e-wallet (GoPay, OVO, Dana), dan pembayaran tunai saat pengiriman (COD).',
  },
  {
    question: 'Berapa lama pengiriman?',
    answer: 'Pengiriman biasanya memakan waktu 1-2 hari kerja tergantung lokasi Anda.',
  },
  {
    question: 'Apakah bisa membatalkan pesanan?',
    answer: 'Anda dapat membatalkan pesanan jika statusnya masih "Menunggu Pembayaran". Jika sudah diproses, silakan hubungi CS.',
  },
];

const FAQItem = ({ item }: { item: { question: string; answer: string } }) => {
  const [expanded, setExpanded] = React.useState(false);
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.faqItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.question, { color: theme.colors.text }]}>{item.question}</Text>
        {expanded ? (
          <ChevronUp size={20} color={theme.colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={theme.colors.textSecondary} />
        )}
      </View>
      {expanded && (
        <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );
};

export default function HelpScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bantuan & FAQ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sering Ditanyakan</Text>
        {FAQ_DATA.map((item, index) => (
          <FAQItem key={index} item={item} />
        ))}

        <View style={[styles.contactSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.contactTitle, { color: theme.colors.text }]}>Butuh bantuan lebih lanjut?</Text>
          <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
            Hubungi tim support kami melalui WhatsApp atau Email.
          </Text>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.contactButtonText}>Hubungi CS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 50, // Adjust for status bar
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
