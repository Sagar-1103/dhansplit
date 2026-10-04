import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ThreeDCoinProps {
  size?: number;
  symbol?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function ThreeDCoin({
  size = 180,
  symbol = 'D',
  iconName,
}: ThreeDCoinProps) {
  const haloSize = Math.round(size * 1.3);
  const coinWidth = Math.round(size * 0.92);
  const coinHeight = Math.round(size * 0.92);

  return (
    <View style={[styles.container, { width: haloSize, height: haloSize }]}>
      {/* Outer ambient soft lavender/violet glow aura */}
      <LinearGradient
        colors={[
          'rgba(216, 180, 254, 0.45)',
          'rgba(233, 213, 255, 0.2)',
          'transparent',
        ]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ambientGlow,
          {
            width: haloSize,
            height: haloSize,
            borderRadius: haloSize / 2,
          },
        ]}
      />

      {/* 3D Extrusion Shadow & Depth (Simulating the 3D isometric angle from the screenshot) */}
      <View
        style={[
          styles.extrusionShadow,
          {
            width: coinWidth,
            height: coinHeight,
            borderRadius: coinWidth / 2,
            top: 10,
            left: 8,
          },
        ]}
      />

      {/* 3D Milled Metallic Rim Extrusion */}
      <View
        style={[
          styles.rimExtrusion,
          {
            width: coinWidth + 4,
            height: coinHeight + 4,
            borderRadius: (coinWidth + 4) / 2,
            top: 6,
            left: 5,
          },
        ]}
      >
        <LinearGradient
          colors={['#E5E7EB', '#9CA3AF', '#4B5563', '#374151', '#1F2937']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Ridge highlights along bottom edge */}
        <View style={styles.ridgeHighlight} />
      </View>

      {/* Coin Outer Chrome Bevel Border */}
      <View
        style={[
          styles.coinOuterBevel,
          {
            width: coinWidth,
            height: coinHeight,
            borderRadius: coinWidth / 2,
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#D1D5DB', '#6B7280', '#1F2937', '#111827']}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.85, y: 0.9 }}
          style={[styles.bevelGradient, { borderRadius: coinWidth / 2 }]}
        >
          {/* Inner Face of Coin: Rich Obsidian Dark Metallic */}
          <LinearGradient
            colors={['#2D2B38', '#1A1822', '#100F17', '#0C0B12']}
            start={{ x: 0.2, y: 0.1 }}
            end={{ x: 0.8, y: 0.9 }}
            style={[
              styles.coinFace,
              {
                width: coinWidth - 12,
                height: coinHeight - 12,
                borderRadius: (coinWidth - 12) / 2,
              },
            ]}
          >
            {/* Subtle Inner Engraved Ring */}
            <View
              style={[
                styles.innerEngravedRing,
                {
                  width: coinWidth - 28,
                  height: coinHeight - 28,
                  borderRadius: (coinWidth - 28) / 2,
                },
              ]}
            >
              {/* Embossed Center Emblem */}
              {iconName ? (
                <Ionicons
                  name={iconName}
                  size={Math.round(size * 0.36)}
                  color="#F8FAFC"
                />
              ) : (
                <View style={styles.emblemContainer}>
                  {/* Stylized Modern Metallic Logo Mark matching the Folio F style */}
                  <Text
                    style={[
                      styles.symbolText,
                      {
                        fontSize: Math.round(size * 0.32),
                      },
                    ]}
                  >
                    {symbol}
                  </Text>
                </View>
              )}
            </View>

            {/* Specular Diagonal Reflection Sheen */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: (coinWidth - 12) / 2,
                  overflow: 'hidden',
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.15)',
                  'rgba(255, 255, 255, 0.03)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.65, y: 0.65 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </LinearGradient>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    alignSelf: 'center',
  },
  extrusionShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 12, 28, 0.35)',
    shadowColor: '#1A103C',
    shadowOffset: { width: 4, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  rimExtrusion: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  ridgeHighlight: {
    position: 'absolute',
    bottom: 2,
    right: 6,
    width: '60%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
  },
  coinOuterBevel: {
    padding: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  bevelGradient: {
    flex: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinFace: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  innerEngravedRing: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontWeight: '900',
    letterSpacing: -1.5,
    color: '#F8FAFC',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
});
