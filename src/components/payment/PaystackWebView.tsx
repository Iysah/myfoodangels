import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing } from '../../styles/globalStyles';
import { X } from 'lucide-react-native';

interface PaystackWebViewProps {
  visible: boolean;
  authorizationUrl: string | null;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

const PaystackWebView: React.FC<PaystackWebViewProps> = ({
  visible,
  authorizationUrl,
  onSuccess,
  onCancel,
  onError,
}) => {
  const onNavigationStateChange = (state: any) => {
    const { url } = state;
    if (!url) return;

    // Success check: Paystack typical success indicators
    if (url.includes('https://standard.paystack.co/close') || url.includes('callback') || url.includes('success')) {
      // Extract reference from URL if possible, otherwise we might need to rely on the one passed to the component if managed externally
      // For now, let's assume the parent knows the reference or we extract it
      const urlObj = new URL(url);
      const reference = urlObj.searchParams.get('reference') || urlObj.searchParams.get('trxref');
      
      if (reference) {
        onSuccess(reference);
      } else {
        // Fallback or trigger generic success if reference is not in URL but it's a success page
        onSuccess(''); 
      }
    }
    
    // Cancel check
    if (url.includes('cancel')) {
      onCancel();
    }
  };

  if (!authorizationUrl && visible) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.errorOverlay}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>Invalid payment session.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Secure Payment</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <X size={24} color={Colors.label} />
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: authorizationUrl || '' }}
          onNavigationStateChange={onNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.label,
  },
  cancelButton: {
    padding: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default PaystackWebView;
