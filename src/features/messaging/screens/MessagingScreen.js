// --- React Core Libraries and Modules ---
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ImageBackground, Pressable, Dimensions, Platform, Keyboard } from 'react-native';

// --- Expo Libraries and Modules ----
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';
import { fetchConnections, fetchUserGroups, fetchIncomingRequests, fetchOutgoingRequests, } from '../../../redux/slices/messaging.slice';
import { setLoading, setError } from '../../../redux/slices/messaging.slice';

// --- Custom UI Components ---
import GroupList from '../ui/GroupList';
import GroupCreation from '../ui/GroupCreation';
import Search from '../ui/Search';
import ConnectionsList from '../ui/ConnectionsList';
import Requests from '../ui/Requests'; 
import NavBar from '../../navbar/NavBar';
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

// --- Assets & Images ---
const splashScreen = require('../../../../assets/splashscreen2.png');

// --- Universal Constant Variables ---
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

/**
 * MessagingScreen
 * 
 * A full-screen, vertically paging messaging hub that organizes all communication features into five distinct sections:
 * 
 * 1. Welcome / Overview
 * 2. Direct Connections (1-on-1 chats)
 * 3. Connection Requests (incoming/outgoing)
 * 4. Groups (existing group chats)
 * 5. Create New Group
 * 
 * Functionality:
 * - Uses paging-enabled vertical scrolling (one section = one full screen)
 * - Fetches connections and groups on mount
 * - Integrates Search bar at the top and persistent NavBar at the bottom
 * - Automatically re-scrolls to current section when search is cleared
 * 
 * Purpose:
 * Serves as the central messaging dashboard, giving users a clean, guided flow to manage direct messages, requests, and group chats.
 */


const MessagingScreen = () => {
    // --- Hooks ---
    const dispatch = useDispatch();

    // --- Redux Variables and State ---
    const { search, groupData, connectionsData, incomingRequests, loading, error } = useSelector(state => state.messaging);

    // --- Derived State ---
    const scrollRef = useRef(null);
    const [currentSection, setCurrentSection] = useState(0);
    const maxSectionIndex = 4;
    const prevSearchRef = useRef(search);

    // -- Scrolling section function
    const scrollToSection = (index) => {
        scrollRef.current?.scrollTo({
            y: index * screenHeight,
            animated: true,
        });
        setCurrentSection(index);
    };

    // -- Handler Functions ---
    const handleScrollNext = () => {
        if (currentSection < maxSectionIndex) {
            scrollToSection(currentSection + 1);
        }
    };

    const handleScrollPrev = () => {
        if (currentSection > 0) {
            scrollToSection(currentSection - 1);
        }
    };

    const handleScrollEnd = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const pageIndex = Math.round(offsetY / screenHeight);
        const clampedIndex = Math.max(0, Math.min(pageIndex, maxSectionIndex));
        setCurrentSection(clampedIndex);
    };

    useEffect(() => {
        if (prevSearchRef.current && !search) {
            setTimeout(() => {
                scrollToSection(currentSection);
            }, 100);
        }
        prevSearchRef.current = search;
    }, [search, currentSection]);

    useEffect(() => {
        const fetchData = groupData.length === 0 && connectionsData.length === 0 && incomingRequests.length === 0 && !loading && !error;
        if(fetchData) {
            const loadData = async () => {
                try {
                    dispatch(setError(null));
                    await Promise.all([
                        dispatch(fetchConnections()).unwrap(),
                        dispatch(fetchIncomingRequests()).unwrap(),
                        dispatch(fetchUserGroups()).unwrap(),
                    ])
                    
                } catch (error) {
                    dispatch(setError('Failed to retrieve info.'));
                } finally {
                    dispatch(setLoading(false));
                    
                }
            }
            loadData();
        }
    },[dispatch]);

    if (loading) {
        return (
          <ImageBackground
            style={styles.spinnerContainer}
            source={splashScreen}
            resizeMode='contain'
            accessible={true}
            accessibilityLabel="Loading account settings"
          >
            <Text style={styles.loadingText}>Loading...</Text>
          </ImageBackground>
        );
      };

    return (
        <SafeAreaView style={styles.root}>
            {error && <ErrorBanner style={styles.error}>{error}</ErrorBanner>}
            <Search />
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                pagingEnabled={true}
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => Keyboard.dismiss()}
                onMomentumScrollEnd={handleScrollEnd}
                decelerationRate="fast"
            >
                {/* Section 0: Welcome */}
                <View style={styles.section}>
                    <View style={styles.centeredContainer}>
                        <Text style={styles.mainTitle}>Med Alliance Connections</Text>
                        <Text style={styles.subTitle}>Direct Messages • Group Chats • Create</Text>
                        
                        <Pressable style={styles.centerFabButtonWrapper} onPress={handleScrollNext}>
                            <BlurView intensity={40} tint="dark" style={styles.centerBlur}>
                                <LinearGradient
                                    colors={['rgba(18,109,166,0.75)', 'rgba(30,198,217,0.75)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.centerGradient}
                                >
                                    <FontAwesome6 name="angles-down" size={32} color="#FFFFFF" />
                                </LinearGradient>
                            </BlurView>
                        </Pressable>
                    </View>
                </View>

                {/* Section 1: Direct Connections */}
                <View style={styles.section}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.sectionTitle}>Direct Connections</Text>
                        <ConnectionsList />
                    </View>
                </View>

                {/* Section 2: Connection Requests */}
                <View style={styles.section}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.sectionTitle}>Connection Requests</Text>
                        <Requests />
                    </View>
                </View>

                {/* Section 3: Groups */}
                <View style={styles.section}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.sectionTitle}>Groups</Text>
                        <ScrollView style={styles.groupListScroll} showsVerticalScrollIndicator={true}>
                            <GroupList />
                        </ScrollView>
                    </View>
                </View>

                {/* Section 4: Create Group */}
                <View style={styles.section}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.sectionTitle}>Create a New Group</Text>
                        <GroupCreation />
                    </View>
                </View>
            </ScrollView>

            {/* Floating Navigation Arrows */}
            {currentSection > 0 && (
                <View style={styles.fabContainer}>
                    {currentSection < maxSectionIndex && (
                        <Pressable style={styles.navButtonWrapper} onPress={handleScrollNext}>
                            <BlurView intensity={40} tint="dark" style={styles.navBlur}>
                                <LinearGradient
                                    colors={['rgba(18,109,166,0.75)', 'rgba(30,198,217,0.75)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.navGradient}
                                >
                                    <FontAwesome6 name="angles-down" size={28} color="#FFFFFF" />
                                </LinearGradient>
                            </BlurView>
                        </Pressable>
                    )}
                    {currentSection > 0 && (
                        <Pressable style={styles.navButtonWrapper} onPress={handleScrollPrev}>
                            <BlurView intensity={40} tint="dark" style={styles.navBlur}>
                                <LinearGradient
                                    colors={['rgba(18,109,166,0.75)', 'rgba(30,198,217,0.75)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.navGradient}
                                >
                                    <FontAwesome6 name="angles-up" size={28} color="#FFFFFF" />
                                </LinearGradient>
                            </BlurView>
                        </Pressable>
                    )}
                </View>
            )}

            <NavBar />
        </SafeAreaView>
    );
};

export default MessagingScreen;

const styles = StyleSheet.create({
    // --- Layout and structure ---
    root: {
        flex: 1,
        backgroundColor: '#F5F9FC',
    },

    // --- Scrolling Container ---
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 0,
    },

    // --- Section Layouts ---
    section: {
        height: screenHeight,
        width: screenWidth,
        backgroundColor: '#F5F9FC',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    centeredContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    // --- Header / Title ---
    mainTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#126DA6',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    subTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#557788',
        textAlign: 'center',
        marginBottom: 50,
    },

    // --- Content Container ---
    contentContainer: {
        width: '100%',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 220,
        alignItems: 'center',
        flex: 1,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#126DA6',
        marginBottom: 32,
        textAlign: 'center',
    },

    // --- Group Scrolling View ---
    groupListScroll: {
        flex: 1,
        width: '100%',
    },

    // Buttons & Actions ---
    centerFabButtonWrapper: { 
        marginTop: 20 
    },
    centerBlur: { 
        width: 70, 
        height: 70, 
        borderRadius: 35, 
        overflow: 'hidden', 
        backgroundColor: 'rgba(255,255,255,0.05)' 
    },
    centerGradient: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 35, 
        borderWidth: 1.2, 
        borderColor: 'rgba(255,255,255,0.18)' 
    },
    fabContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Platform.OS === 'ios' ? 140 : 160,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        flexDirection: 'row',
    },
    // --- Navigation Buttons and Actions ---
    navButtonWrapper: { 
        marginHorizontal: 16 
    },
    navBlur: { 
        width: 64, 
        height: 64, 
        borderRadius: 32, 
        overflow: 'hidden', 
        backgroundColor: 'rgba(255,255,255,0.05)' 
    },
    navGradient: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 32, 
        borderWidth: 1.2, 
        borderColor: 'rgba(255,255,255,0.18)' 
    },

    // --- Loading State ---
    spinnerContainer: { 
        flex: 1, 
        width: '100%', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    loadingText: { 
        color: '#0D0D0D',
        fontFamily: 'LibreFranklin-Bold',
        fontSize: 20,
        position: 'absolute',
        top: 80,
        alignSelf: 'center',
    },
});