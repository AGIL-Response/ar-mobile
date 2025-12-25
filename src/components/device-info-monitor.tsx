/**
 * Device Info Monitor Component
 * Handles WebView for network speed testing and communicates with the store
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useDeviceInfoStore } from '@/stores/device-info';

export function DeviceInfoMonitor() {
  const webViewRef = useRef<WebView>(null);
  const { actions, networkSpeedConfig } = useDeviceInfoStore();

  // Function to trigger network speed check
  const checkNetworkSpeed = useCallback(() => {
    const state = useDeviceInfoStore.getState();
    
    if (!webViewRef.current) {
      return;
    }

    if (state.isCheckingNetworkSpeed) {
      return; // Already checking
    }

    actions.setCheckingNetworkSpeed(true);

    const runTest = `
      try {
        if (typeof window.test === 'function') {
          window.test();
        } else {
          setTimeout(() => {
            if (typeof window.test === 'function') {
              window.test();
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({ error: 'Speed test function not ready' }));
            }
          }, 2000);
        }
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
      }
    `;

    webViewRef.current.injectJavaScript(runTest);
  }, [actions]);

  // Generate webView source from store config
  const webViewSource = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Network Speed Test</title>
      </head>
      <body>
        <script type="module">
          import FastSpeedtest from 'https://cdn.jsdelivr.net/npm/fast-speedtest-api@0.3.2/+esm';
          try {
            const speedtest = new FastSpeedtest({
              token: "${networkSpeedConfig.token}",
              verbose: false,
              timeout: ${networkSpeedConfig.timeout},
              https: ${networkSpeedConfig.https},
              urlCount: ${networkSpeedConfig.urlCount},
              bufferSize: ${networkSpeedConfig.bufferSize},
              unit: (rawSpeed) => rawSpeed, // Get raw speed in Bps
            });
            window.test = () => {
              speedtest.getSpeed().then(s => {
                const speedInMbps = (s * 8) / 1000000; // Convert Bps to Mbps
                window.ReactNativeWebView.postMessage(JSON.stringify({ speed: parseFloat(speedInMbps.toFixed(2)) }));
              }).catch(e => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
              });
            };
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
          }
        </script>
      </body>
      </html>
    `;
  }, [networkSpeedConfig]);

  useEffect(() => {
    // Set callback in store so interval can trigger it
    actions.setCheckNetworkSpeedCallback(checkNetworkSpeed);

    // Initialize store
    actions.initialize();

    // Initial network speed check after WebView is ready
    setTimeout(() => {
      checkNetworkSpeed();
    }, 2000);

    return () => {
      // Cleanup
      actions.setCheckNetworkSpeedCallback(null);
      actions.stopNetworkSpeedMonitoring();
      actions.stopBatteryMonitoring();
    };
  }, [checkNetworkSpeed, actions]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.speed !== undefined) {
        console.log('✅ Network speed received:', data.speed, 'Mbps');
        actions.setNetworkSpeed(data.speed);
      } else if (data.error) {
        console.error('❌ Network speed error:', data.error);
        actions.setNetworkSpeedError(data.error);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      actions.setNetworkSpeedError('Failed to parse network speed result');
    }
  };

  return (
    <View style={styles.view}>
      <WebView
        source={{ html: webViewSource }}
        ref={webViewRef}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    width: 0,
    height: 0,
    opacity: 0,
    display: 'none',
    pointerEvents: 'none',
  },
});


