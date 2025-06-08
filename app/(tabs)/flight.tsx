import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { MapPin, Globe, Calendar, Plus, Plane, Package, DollarSign } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface PackageOption {
  id: number;
  name: string;
  weight: string;
  price: number;
}

interface PackageOptionItemProps {
  option: PackageOption;
  isSelected: boolean;
  showPrice?: boolean;
  onPress: (id: number) => void;
}

function PackageOptionItem({ option, isSelected, showPrice = false, onPress }: PackageOptionItemProps) {
  const scale = useSharedValue(1);
  
  const packageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePackagePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePackagePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.packageOption, isSelected && styles.selectedPackageOption, packageStyle]}
      onPressIn={handlePackagePressIn}
      onPressOut={handlePackagePressOut}
      onPress={() => onPress(option.id)}>
      <View style={styles.packageHeader}>
        <Text style={[styles.packageOptionText, isSelected && styles.selectedPackageOptionText]}>
          {option.name} ({option.weight})
        </Text>
        {showPrice && (
          <Text style={[styles.packagePrice, isSelected && styles.selectedPackageOptionText]}>
            ₹{option.price}
          </Text>
        )}
      </View>
      {showPrice && (
        <Text style={[styles.packageDescription, isSelected && styles.selectedPackageOptionText]}>
          Includes insurance and handling
        </Text>
      )}
    </AnimatedTouchableOpacity>
  );
}

export default function FlightScreen() {
  const [activeTab, setActiveTab] = useState<'offer' | 'request'>('offer');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [shipmentType, setShipmentType] = useState<'domestic' | 'international' | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    pickupCity: '',
    deliveryCity: '',
    deliveryCountry: '',
    requiredDate: '',
    description: '',
    budget: ''
  });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'offer' | 'request'>('offer');

  // Animation values
  const scrollY = useSharedValue(0);
  const addButtonScale = useSharedValue(1);
  const tabBarOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const offset = interpolate(
        event.contentOffset.y,
        [0, 50],
        [0, -10],
        'clamp'
      );
      tabBarOffset.value = offset;
    }
  });

  const tabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarOffset.value }],
    };
  });

  const addButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: addButtonScale.value },
      ],
    };
  });

  const handlePressIn = () => {
    addButtonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    addButtonScale.value = withSpring(1);
  };

  // Card entrance animation
  const cardAnimations = Array(2).fill(0).map(() => useSharedValue(0));

  const cardStyles = cardAnimations.map((animation, index) => 
    useAnimatedStyle(() => ({
      opacity: animation.value,
      transform: [
        { translateY: interpolate(animation.value, [0, 1], [50, 0]) },
        { scale: interpolate(animation.value, [0, 1], [0.9, 1]) }
      ]
    }))
  );

  // Start entrance animations
  useState(() => {
    cardAnimations.forEach((animation, index) => {
      animation.value = withDelay(
        index * 200,
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    });
  });

  const PACKAGE_OPTIONS: PackageOption[] = [
    { id: 1, name: 'Small', weight: '1-5kg', price: 2500 },
    { id: 2, name: 'Medium', weight: '5-10kg', price: 5000 },
    { id: 3, name: 'Large', weight: '10-20kg', price: 7500 }
  ];

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      setDate(selectedDate);
      setFormData(prev => ({
        ...prev,
        requiredDate: formattedDate
      }));
    }
  };

  const showDatepicker = (mode: 'offer' | 'request') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handlePackageSelect = (id: number) => {
    setSelectedPackage(id);
  };

  const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flight Courier</Text>
        <Text style={styles.headerSubtitle}>Connect with travelers for package delivery</Text>
      </View>

      <Animated.View style={[styles.tabContainer, tabBarStyle]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offer' && styles.activeTab]}
          onPress={() => setActiveTab('offer')}>
          <Plane size={20} color={activeTab === 'offer' ? '#0066cc' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'offer' && styles.activeTabText]}>
            Offer Space
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'request' && styles.activeTab]}
          onPress={() => setActiveTab('request')}>
          <Package size={20} color={activeTab === 'request' ? '#0066cc' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>
            Request Courier
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <AnimatedScrollView 
        style={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
        {activeTab === 'offer' ? (
          <>
            <AnimatedTouchableOpacity 
              style={[styles.addButton, addButtonStyle]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => setShowOfferModal(true)}>
              <Plus size={24} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Flight Details</Text>
            </AnimatedTouchableOpacity>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Active Flights</Text>
              
              <Animated.View style={[styles.flightCard, cardStyles[0]]}>
                <View style={styles.flightHeader}>
                  <View style={styles.route}>
                    <Text style={styles.city}>Mumbai</Text>
                    <Plane size={20} color="#0066cc" style={{ transform: [{ rotate: '90deg' }] }} />
                    <Text style={styles.city}>Delhi</Text>
                  </View>
                  <Text style={styles.date}>Mar 25, 2025</Text>
                </View>
                
                <View style={styles.flightDetails}>
                  <View style={styles.detailItem}>
                    <Package size={16} color="#666" />
                    <Text style={styles.detailText}>Available Space: 15kg</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Globe size={16} color="#666" />
                    <Text style={styles.detailText}>Domestic Flight</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewRequestsButton}>
                  <Text style={styles.viewRequestsText}>View Requests (3)</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[styles.flightCard, cardStyles[1]]}>
                <View style={styles.flightHeader}>
                  <View style={styles.route}>
                    <Text style={styles.city}>Delhi</Text>
                    <Plane size={20} color="#0066cc" style={{ transform: [{ rotate: '90deg' }] }} />
                    <Text style={styles.city}>Dubai</Text>
                  </View>
                  <Text style={styles.date}>Mar 28, 2025</Text>
                </View>
                
                <View style={styles.flightDetails}>
                  <View style={styles.detailItem}>
                    <Package size={16} color="#666" />
                    <Text style={styles.detailText}>Available Space: 10kg</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Globe size={16} color="#666" />
                    <Text style={styles.detailText}>International Flight</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewRequestsButton}>
                  <Text style={styles.viewRequestsText}>View Requests (1)</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>
        ) : (
          <>
            <AnimatedTouchableOpacity 
              style={[styles.addButton, addButtonStyle]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => setShowRequestModal(true)}>
              <Plus size={24} color="#ffffff" />
              <Text style={styles.addButtonText}>Request Courier Service</Text>
            </AnimatedTouchableOpacity>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Active Requests</Text>
              
              <Animated.View style={[styles.requestCard, cardStyles[0]]}>
                <View style={styles.requestHeader}>
                  <View style={styles.route}>
                    <Text style={styles.city}>Mumbai</Text>
                    <Package size={20} color="#0066cc" />
                    <Text style={styles.city}>Delhi</Text>
                  </View>
                  <Text style={styles.date}>Needed by Mar 30, 2025</Text>
                </View>
                
                <View style={styles.requestDetails}>
                  <View style={styles.detailItem}>
                    <Package size={16} color="#666" />
                    <Text style={styles.detailText}>Package Weight: 5kg</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <DollarSign size={16} color="#666" />
                    <Text style={styles.detailText}>Budget: ₹2,500</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewMatchesButton}>
                  <Text style={styles.viewMatchesText}>View Matches (2)</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>
        )}
      </AnimatedScrollView>

      <Modal
        isVisible={showOfferModal}
        onBackdropPress={() => setShowOfferModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Flight Details</Text>

          <View style={styles.shipmentTypeContainer}>
            <TouchableOpacity
              style={[
                styles.shipmentTypeButton,
                shipmentType === 'domestic' && styles.selectedShipmentType
              ]}
              onPress={() => setShipmentType('domestic')}>
              <MapPin 
                size={20} 
                color={shipmentType === 'domestic' ? '#ffffff' : '#666'} 
              />
              <Text style={[
                styles.shipmentTypeText,
                shipmentType === 'domestic' && styles.selectedShipmentTypeText
              ]}>
                Domestic
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.shipmentTypeButton,
                shipmentType === 'international' && styles.selectedShipmentType
              ]}
              onPress={() => setShipmentType('international')}>
              <Globe 
                size={20} 
                color={shipmentType === 'international' ? '#ffffff' : '#666'} 
              />
              <Text style={[
                styles.shipmentTypeText,
                shipmentType === 'international' && styles.selectedShipmentTypeText
              ]}>
                International
              </Text>
            </TouchableOpacity>
          </View>

          {shipmentType && (
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Departure City"
                  placeholderTextColor="#666"
                  value={formData.pickupCity}
                  onChangeText={(text) => setFormData({...formData, pickupCity: text})}
                />
              </View>

              {shipmentType === 'international' && (
                <View style={styles.inputContainer}>
                  <Globe size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Destination Country"
                    placeholderTextColor="#666"
                    value={formData.deliveryCountry}
                    onChangeText={(text) => setFormData({...formData, deliveryCountry: text})}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Destination City"
                  placeholderTextColor="#666"
                  value={formData.deliveryCity}
                  onChangeText={(text) => setFormData({...formData, deliveryCity: text})}
                />
              </View>

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => showDatepicker('offer')}>
                <Calendar size={20} color="#666" />
                <Text style={[styles.input, !formData.requiredDate && styles.placeholderText]}>
                  {formData.requiredDate || "Flight Date"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.packageSectionTitle}>Available Space</Text>
              {PACKAGE_OPTIONS.map(option => (
                <PackageOptionItem
                  key={option.id}
                  option={option}
                  isSelected={selectedPackage === option.id}
                  onPress={handlePackageSelect}
                />
              ))}
            </View>
          )}

          {shipmentType && (
            <TouchableOpacity
              style={[styles.submitButton, !selectedPackage && styles.submitButtonDisabled]}
              disabled={!selectedPackage}
              onPress={() => setShowOfferModal(false)}>
              <Text style={styles.submitButtonText}>Add Offer</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      <Modal
        isVisible={showRequestModal}
        onBackdropPress={() => setShowRequestModal(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Request Courier Service</Text>

          <View style={styles.shipmentTypeContainer}>
            <TouchableOpacity
              style={[
                styles.shipmentTypeButton,
                shipmentType === 'domestic' && styles.selectedShipmentType
              ]}
              onPress={() => setShipmentType('domestic')}>
              <MapPin 
                size={20} 
                color={shipmentType === 'domestic' ? '#ffffff' : '#666'} 
              />
              <Text style={[
                styles.shipmentTypeText,
                shipmentType === 'domestic' && styles.selectedShipmentTypeText
              ]}>
                Domestic
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.shipmentTypeButton,
                shipmentType === 'international' && styles.selectedShipmentType
              ]}
              onPress={() => setShipmentType('international')}>
              <Globe 
                size={20} 
                color={shipmentType === 'international' ? '#ffffff' : '#666'} 
              />
              <Text style={[
                styles.shipmentTypeText,
                shipmentType === 'international' && styles.selectedShipmentTypeText
              ]}>
                International
              </Text>
            </TouchableOpacity>
          </View>

          {shipmentType && (
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Pickup City"
                  placeholderTextColor="#666"
                  value={formData.pickupCity}
                  onChangeText={(text) => setFormData({...formData, pickupCity: text})}
                />
              </View>

              {shipmentType === 'international' && (
                <View style={styles.inputContainer}>
                  <Globe size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Destination Country"
                    placeholderTextColor="#666"
                    value={formData.deliveryCountry}
                    onChangeText={(text) => setFormData({...formData, deliveryCountry: text})}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Destination City"
                  placeholderTextColor="#666"
                  value={formData.deliveryCity}
                  onChangeText={(text) => setFormData({...formData, deliveryCity: text})}
                />
              </View>

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => showDatepicker('request')}>
                <Calendar size={20} color="#666" />
                <Text style={[styles.input, !formData.requiredDate && styles.placeholderText]}>
                  {formData.requiredDate || "Required by Date"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.packageSectionTitle}>Package Size</Text>
              {PACKAGE_OPTIONS.map(option => (
                <PackageOptionItem
                  key={option.id}
                  option={option}
                  isSelected={selectedPackage === option.id}
                  showPrice={true}
                  onPress={handlePackageSelect}
                />
              ))}

              <View style={styles.inputContainer}>
                <Package size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Item Description"
                  placeholderTextColor="#666"
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  multiline
                />
              </View>
            </View>
          )}

          {shipmentType && selectedPackage && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setShowRequestModal(false)}>
              <Text style={styles.submitButtonText}>
                Pay ₹{PACKAGE_OPTIONS.find(p => p.id === selectedPackage)?.price || 0}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {(showDatePicker || Platform.OS === 'ios') && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          style={styles.datePicker}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 12,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#e6f0ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066cc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  flightCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  city: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  flightDetails: {
    gap: 8,
    marginBottom: 16,
  },
  requestDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  viewRequestsButton: {
    backgroundColor: '#e6f0ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewRequestsText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  viewMatchesButton: {
    backgroundColor: '#e6f0ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMatchesText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shipmentTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  shipmentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedShipmentType: {
    backgroundColor: '#0066cc',
  },
  shipmentTypeText: {
    fontSize: 16,
    color: '#666',
  },
  selectedShipmentTypeText: {
    color: '#ffffff',
  },
  inputGroup: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  packageSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },
  packageOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  selectedPackageOption: {
    backgroundColor: '#0066cc',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageOptionText: {
    fontSize: 16,
    color: '#666',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedPackageOptionText: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#666',
  },
  datePicker: {
    backgroundColor: 'white',
    width: Platform.OS === 'ios' ? '100%' : 'auto',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
});