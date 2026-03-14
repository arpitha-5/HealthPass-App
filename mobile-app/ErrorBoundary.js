import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('');
    console.error('========== FULL ERROR DETAILS ==========');
    console.error('ERROR MESSAGE:', error.toString());
    console.error('ERROR NAME:', error.name);
    console.error('');
    console.error('STACK TRACE:');
    console.error(error.stack);
    console.error('');
    console.error('COMPONENT STACK:');
    console.error(errorInfo.componentStack);
    console.error('');
    console.error('========================================');
    console.error('');
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error ? this.state.error.toString() : 'Unknown error';
      const errorName = this.state.error?.name || 'Error';
      
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>⚠️ Error Occurred</Text>
            <Text style={styles.errorName}>{errorName}</Text>
            <Text style={styles.message}>
              {errorMsg}
            </Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Stack Trace:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.stack || 'No stack trace available'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    maxHeight: 250,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#7F1D1D',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
