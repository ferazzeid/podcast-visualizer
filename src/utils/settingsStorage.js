/**
 * Settings persistence using localStorage
 */

const STORAGE_KEY = 'podcast-visualizer-settings'
const PRESETS_KEY = 'podcast-visualizer-presets'

// Default settings
export const defaultSettings = {
  // Background
  backgroundColor: '#000000',
  backgroundImage: null,
  transparentBackground: false,
  
  // Visualization
  visualizerStyle: 'waveform-gentle',
  visualizerColor: '#8b5cf6',
  visualizerSecondaryColor: '#a855f7',
  visualizerSize: 100,
  visualizerPosition: 'center',
  sensitivity: 2, // gain: louder = higher range (0.5–4)
  smoothness: 0.7, // 0 = responsive/jittery, 1 = smooth/slow (reflects intonation)
  
  // Logo
  logo: null,
  logoPosition: 'top-left',
  logoSize: 80,
  
  // Photo/Avatar
  photo: null,
  photoPosition: 'center',
  photoSize: 150,
  photoCircular: true,
  
  // Text
  title: '',
  subtitle: '',
  textColor: '#ffffff',
  titleSize: 32,
  subtitleSize: 18,
  textPosition: 'bottom',
}

// Save settings to localStorage (excluding file objects)
export function saveSettings(settings) {
  const settingsToSave = { ...settings }
  
  // Remove file objects (can't be serialized)
  delete settingsToSave.backgroundImage
  delete settingsToSave.logo
  delete settingsToSave.photo
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave))
    return true
  } catch (err) {
    console.error('Failed to save settings:', err)
    return false
  }
}

// Load settings from localStorage
export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultSettings, ...parsed }
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
  return defaultSettings
}

// Save a named preset
export function savePreset(name, settings) {
  const presets = loadPresets()
  const settingsToSave = { ...settings }
  
  // Remove file objects
  delete settingsToSave.backgroundImage
  delete settingsToSave.logo
  delete settingsToSave.photo
  
  presets[name] = {
    ...settingsToSave,
    savedAt: new Date().toISOString()
  }
  
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    return true
  } catch (err) {
    console.error('Failed to save preset:', err)
    return false
  }
}

// Load all presets
export function loadPresets() {
  try {
    const saved = localStorage.getItem(PRESETS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (err) {
    console.error('Failed to load presets:', err)
  }
  return {}
}

// Delete a preset
export function deletePreset(name) {
  const presets = loadPresets()
  delete presets[name]
  
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    return true
  } catch (err) {
    console.error('Failed to delete preset:', err)
    return false
  }
}

// Built-in presets
export const builtInPresets = {
  'Minimal Dark': {
    backgroundColor: '#000000',
    visualizerStyle: 'minimal-calm',
    visualizerColor: '#8b5cf6',
    visualizerSecondaryColor: '#a855f7',
    visualizerSize: 80,
    visualizerPosition: 'center',
    textColor: '#ffffff',
  },
  'Professional Purple': {
    backgroundColor: '#0f0f0f',
    visualizerStyle: 'waveform-gentle',
    visualizerColor: '#8b5cf6',
    visualizerSecondaryColor: '#c084fc',
    visualizerSize: 100,
    visualizerPosition: 'bottom',
    textColor: '#ffffff',
  },
  'Calm Blue': {
    backgroundColor: '#0a0a0f',
    visualizerStyle: 'circular-breathe',
    visualizerColor: '#3b82f6',
    visualizerSecondaryColor: '#60a5fa',
    visualizerSize: 100,
    visualizerPosition: 'center',
    textColor: '#e2e8f0',
  },
  'Warm Sunset': {
    backgroundColor: '#1a0a0a',
    visualizerStyle: 'bars-smooth',
    visualizerColor: '#f97316',
    visualizerSecondaryColor: '#fb923c',
    visualizerSize: 90,
    visualizerPosition: 'bottom',
    textColor: '#fef3c7',
  }
}
