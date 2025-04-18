import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Dimensions, 
  Animated, 
  Platform,
  View,
  PanResponder,
  FlatList,
  Modal,
  Text
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Sensors from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { COLORS, SPACING, SHADOWS, ANIMATION, LAYOUT } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Enhanced mock data for the gallery and analysis
const MOCK_GALLERY = [
  { id: '1', image: require('@/assets/images/icon.png'), name: 'Downtown Stairs', type: 'stairs', score: 8, difficulty: 'Medium' },
  { id: '2', image: require('@/assets/images/react-logo.png'), name: 'Park Rail', type: 'rail', score: 9, difficulty: 'Hard' },
  { id: '3', image: require('@/assets/images/partial-react-logo.png'), name: 'Ledge Spot', type: 'ledge', score: 7, difficulty: 'Easy' },
  { id: '4', image: require('@/assets/images/icon.png'), name: 'School Handrail', type: 'rail', score: 10, difficulty: 'Hard' },
  { id: '5', image: require('@/assets/images/react-logo.png'), name: 'Plaza Gap', type: 'street', score: 6, difficulty: 'Medium' },
];

// Mock trick suggestions based on spot type
const TRICK_SUGGESTIONS = {
  stairs: ['Kickflip', 'Heelflip', 'Ollie', '50-50 Grind'],
  rail: ['Boardslide', 'Lipslide', '50-50', 'Noseslide'],
  ledge: ['Nosegrind', 'Crooked Grind', '5-0 Grind', 'Smith Grind'],
  park: ['Indy Grab', 'Method Air', 'Nose Grab', 'Tailgrab'],
  street: ['Tre Flip', 'Varial Flip', 'Hardflip', 'Pop Shuvit'],
};

// Mock surfaces data
const SURFACE_TYPES = ['Concrete', 'Wood', 'Metal', 'Brick', 'Asphalt'];

// Mock obstacles with measurements
const OBSTACLE_TYPES = {
  stairs: { height: '3-5 ft', width: '8 ft', length: '12 ft' },
  rail: { height: '2.5 ft', width: '0.1 ft', length: '10 ft' },
  ledge: { height: '1.5 ft', width: '1 ft', length: '15 ft' },
  gap: { distance: '6 ft', height: '2 ft' },
  bank: { angle: '35°', height: '4 ft', length: '12 ft' },
};

// Mock collections for organizing spots
const SPOT_COLLECTIONS = [
  { id: 'favorites', name: 'Favorites', count: 5, icon: 'star' },
  { id: 'to-skate', name: 'Want to Skate', count: 12, icon: 'flag' },
  { id: 'conquered', name: 'Conquered', count: 3, icon: 'trophy' },
];

// Mock weather data
const WEATHER_DATA = {
  current: { condition: 'Clear', temperature: '72°F', wind: '5 mph' },
  forecast: [
    { day: 'Today', condition: 'Clear', high: '75°F', low: '65°F', skateable: true },
    { day: 'Tomorrow', condition: 'Partly Cloudy', high: '72°F', low: '63°F', skateable: true },
    { day: 'Wed', condition: 'Rain', high: '68°F', low: '60°F', skateable: false },
  ]
};

// Enhanced AnalysisResult interface
interface AnalysisResult {
  skateabilityScore: number;
  spotType: string;
  suggestedTricks: string[];
  difficulty: string;
  surface?: string;
  obstacles?: {
    type: string;
    measurements: Record<string, string>;
  };
  landingSafety?: number;
  bestTimeToSkate?: string;
  similarSpots?: string[];
  weatherCondition?: string;
  technicalDetails?: {
    incline?: string;
    roughness?: string;
    crowdLevel?: string;
  };
}

// Mock analysis pages for swiping
const ANALYSIS_PAGES = ['Main', 'Technical', 'Weather', 'Similar Spots'];

export default function SpotAnalyzerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  
  // New state variables for enhanced features
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showAROverlay, setShowAROverlay] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showWeather, setShowWeather] = useState(false);
  const [showSimilarSpots, setShowSimilarSpots] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('All');
  const [showConfetti, setShowConfetti] = useState(false);
  const [multiAnglePhotos, setMultiAnglePhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  // Mock tilt effect using PanResponder (would use Sensors in real implementation)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      // Limit tilt to a small amount for subtle effect
      const maxTilt = 5;
      const xTilt = Math.max(Math.min(gesture.dx / 20, maxTilt), -maxTilt); 
      const yTilt = Math.max(Math.min(gesture.dy / 20, maxTilt), -maxTilt);
      
      setTilt({ 
        x: xTilt, 
        y: yTilt 
      });
    },
    onPanResponderRelease: () => {
      // Reset tilt when touch ends
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
      
      // Gradually return to neutral position
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setTimeout(() => setTilt({ x: 0, y: 0 }), 300);
    },
  });

  // Enhanced camera function with AR overlay
  const takePhoto = async () => {
    // Toggle AR mode for demonstration
    if (showAROverlay) {
      setShowAROverlay(false);
      return;
    }
    
    // Mocking camera behavior
    alert('Camera functionality is mocked. In a real app, this would open the camera with AR overlays.');
    
    // Show AR overlay
    setShowAROverlay(true);
    
    // Simulate getting an image after 2 seconds
    setTimeout(() => {
      setShowAROverlay(false);
      // Add to multi-angle collection
      setMultiAnglePhotos(prev => [...prev, 'mock-image-url']);
      analyzeSpot('mock-image-url');
    }, 2000);
  };

  // Enhanced gallery function
  const pickImage = async () => {
    // Mocking gallery behavior
    alert('Gallery functionality is mocked. In a real app, this would open the image picker.');
    
    // Show full gallery
    setShowFullGallery(true);
  };

  // Select image from gallery
  const selectFromGallery = (item: any) => {
    setShowFullGallery(false);
    analyzeSpot('mock-image-from-gallery');
  };

  // Enhanced AI analysis function
  const analyzeSpot = (imageUri: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setImage(imageUri);
    
    // Simulate AI analysis with a delay
    setTimeout(() => {
      // Mock analysis result
      const spotType = ['stairs', 'rail', 'ledge', 'gap', 'bank'][Math.floor(Math.random() * 5)];
      const mockResult: AnalysisResult = {
        skateabilityScore: Math.floor(Math.random() * 5) + 6, // 6-10 for demo
        spotType,
        suggestedTricks: TRICK_SUGGESTIONS[spotType as keyof typeof TRICK_SUGGESTIONS] || [],
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        surface: SURFACE_TYPES[Math.floor(Math.random() * SURFACE_TYPES.length)],
        obstacles: {
          type: spotType,
          measurements: OBSTACLE_TYPES[spotType as keyof typeof OBSTACLE_TYPES] || {},
        },
        landingSafety: Math.floor(Math.random() * 5) + 6, // 6-10 for demo
        bestTimeToSkate: ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)],
        weatherCondition: WEATHER_DATA.current.condition,
        technicalDetails: {
          incline: `${Math.floor(Math.random() * 10)}°`,
          roughness: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        },
      };
      
      setAnalysisResult(mockResult);
      setAnalyzing(false);
      
      // Animate the result in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Show confetti for high scores
      if (mockResult.skateabilityScore >= 9) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 2000);
  };

  // Save the spot to a collection
  const saveSpot = () => {
    alert('Spot saved to your collection!');
    setSelectedCollection('favorites');
  };

  // Share analysis results
  const shareAnalysis = () => {
    alert('Sharing functionality would be implemented here.');
  };

  // Toggle weather forecast
  const toggleWeather = () => {
    setShowWeather(!showWeather);
  };

  // Toggle similar spots
  const toggleSimilarSpots = () => {
    setShowSimilarSpots(!showSimilarSpots);
  };

  // Filter spots by difficulty
  const filterByDifficulty = (level: string) => {
    setSelectedSkillLevel(level);
  };

  // Change analysis page
  const changePage = (index: number) => {
    setCurrentPage(index);
  };

  // Get 3D style for tilting cards
  const get3DStyle = () => {
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${tilt.y}deg` },
        { rotateY: `${-tilt.x}deg` },
      ],
    };
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCircle} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
    </View>
  );

  // Circular progress component for scores
  const renderCircularProgress = (score: number, size = 120, strokeWidth = 12) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (score / 10) * circumference;
    
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(0, 0, 0, 0.1)"
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#59C9F0"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </Svg>
    );
  };

  // Render camera overlay with composition guides
  const renderCameraOverlay = () => (
    <View style={styles.cameraOverlay}>
      {/* Circular blue gradient in center */}
      <View style={styles.centerCircle}>
        <View style={styles.innerCircle} />
      </View>
      
      {/* Grid lines */}
      <View style={[styles.gridLineHorizontal, { top: '33%' }]} />
      <View style={[styles.gridLineHorizontal, { top: '66%' }]} />
      <View style={[styles.gridLineVertical, { left: '33%' }]} />
      <View style={[styles.gridLineVertical, { left: '66%' }]} />
      
      {/* AR Feature markers */}
      {showAROverlay && (
        <>
          <View style={[styles.arMarker, { top: '40%', left: '30%' }]}>
            <Text style={styles.arMarkerText}>Rail</Text>
          </View>
          <View style={[styles.arMarker, { bottom: '30%', right: '25%' }]}>
            <Text style={styles.arMarkerText}>Gap</Text>
          </View>
          <View style={[styles.arMarker, { top: '60%', left: '60%' }]}>
            <Text style={styles.arMarkerText}>Ledge</Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spot AI</Text>
        <Text style={styles.headerSubtitle}>Analyze any skate spot</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Camera Section */}
        <View style={styles.cameraSection}>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              {renderCameraOverlay()}
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewText}>Tap to analyze a spot</Text>
                {renderCameraOverlay()}
              </View>
            </View>
          )}
          
          {/* Enhanced Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.arButton} 
              onPress={() => setShowAROverlay(!showAROverlay)}
            >
              <Text style={styles.arButtonText}>AR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shutterButton} 
              onPress={takePhoto}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.galleryButton} 
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Collections Section */}
        <View style={styles.collectionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Collections</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionsScroll}>
            {SPOT_COLLECTIONS.map((collection) => (
              <TouchableOpacity 
                key={collection.id} 
                style={[
                  styles.collectionItem,
                  selectedCollection === collection.id && styles.selectedCollection
                ]}
                onPress={() => setSelectedCollection(collection.id)}
              >
                <FontAwesome5 
                  name={collection.icon} 
                  size={16} 
                  color={selectedCollection === collection.id ? "#59C9F0" : "#888888"} 
                  style={styles.collectionIcon}
                />
                <Text style={styles.collectionName}>{collection.name}</Text>
                <Text style={styles.collectionCount}>{collection.count} spots</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Past Analyzed Spots with Skill Level Filter */}
        <View style={styles.galleryContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Previously Analyzed</Text>
          </View>
          
          <View style={styles.skillFilterContainer}>
            {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
              <TouchableOpacity 
                key={level}
                style={[
                  styles.skillFilterButton,
                  selectedSkillLevel === level && styles.selectedSkillFilter
                ]}
                onPress={() => filterByDifficulty(level)}
              >
                <Text style={[
                  styles.skillFilterText,
                  selectedSkillLevel === level && styles.selectedSkillFilterText
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
            {MOCK_GALLERY
              .filter(item => selectedSkillLevel === 'All' || item.difficulty === selectedSkillLevel)
              .map((item) => (
                <TouchableOpacity key={item.id} style={styles.galleryItem} onPress={() => analyzeSpot('mock-image-url')}>
                  <Image source={item.image} style={styles.galleryImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                    style={styles.galleryGradient}
                  >
                    <Text style={styles.galleryItemName}>{item.name}</Text>
                    <View style={styles.galleryItemDetails}>
                      <Text style={styles.galleryItemType}>{item.type}</Text>
                      <View style={[
                        styles.difficultyBadge,
                        item.difficulty === 'Easy' ? styles.easyBadge :
                        item.difficulty === 'Medium' ? styles.mediumBadge :
                        styles.hardBadge
                      ]}>
                        <Text style={styles.difficultyText}>{item.difficulty}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper component for analysis details
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#59C9F0',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  scrollView: {
    flex: 1,
  },
  
  // Enhanced Camera Section
  cameraSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  previewContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
    zIndex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(216, 241, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  arMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(89, 201, 240, 0.8)',
    borderRadius: 12,
    padding: 5,
    paddingHorizontal: 8,
  },
  arMarkerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  arButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Collections
  collectionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  seeAllText: {
    color: '#59C9F0',
    fontSize: 14,
    fontWeight: '600',
  },
  collectionsScroll: {
    flexDirection: 'row',
  },
  collectionItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCollection: {
    borderWidth: 1,
    borderColor: '#59C9F0',
    backgroundColor: 'rgba(89, 201, 240, 0.05)',
  },
  collectionIcon: {
    marginBottom: 10,
  },
  collectionName: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
  collectionCount: {
    color: '#888888',
    fontSize: 14,
  },
  
  // Gallery section
  galleryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  skillFilterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  skillFilterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F2F2F2',
  },
  selectedSkillFilter: {
    backgroundColor: '#59C9F0',
  },
  skillFilterText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSkillFilterText: {
    color: '#FFFFFF',
  },
  galleryScroll: {
    flexDirection: 'row',
  },
  galleryItem: {
    width: 180,
    height: 120,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 10,
  },
  galleryItemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  galleryItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryItemType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  easyBadge: {
    backgroundColor: '#4CAF50',
  },
  mediumBadge: {
    backgroundColor: '#FFC107',
  },
  hardBadge: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Analysis Results Section
  analysisContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activePageDot: {
    backgroundColor: '#59C9F0',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  analysisHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  analysisContent: {
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#59C9F0',
  },
  
  // Skeleton Loading
  skeletonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  skeletonCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F2',
    marginBottom: 20,
  },
  skeletonLine: {
    height: 20,
    width: '80%',
    backgroundColor: '#F2F2F2',
    marginBottom: 10,
    borderRadius: 5,
  },
  
  // Detail items for analysis
  detailItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 100,
    fontWeight: '600',
    color: '#444444',
  },
  detailValue: {
    color: '#666666',
    flex: 1,
  },
}); 