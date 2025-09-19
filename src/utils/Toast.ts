import Toast from 'react-native-toast-message';

export interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

class ToastService {
  static show(config: ToastConfig) {
    const { type, title, message, duration = 3000 } = config;
    
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
    });
  }

  static success(title: string, message?: string, duration?: number) {
    this.show({ type: 'success', title, message, duration });
  }

  static error(title: string, message?: string, duration?: number) {
    this.show({ type: 'error', title, message, duration });
  }

  static warning(title: string, message?: string, duration?: number) {
    this.show({ type: 'warning', title, message, duration });
  }

  static info(title: string, message?: string, duration?: number) {
    this.show({ type: 'info', title, message, duration });
  }

  static hide() {
    Toast.hide();
  }
}

export default ToastService;