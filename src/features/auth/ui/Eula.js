// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, Linking, StyleSheet, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { setChecked } from '../../../redux/slices/auth.slice';
import { setError } from '../../../redux/slices/error.slice';

// End User License Agreement 
const Eula = () => {
    // Redux State Variables
    const dispatch = useDispatch();
    const { checked } = useSelector((state) => state.auth);

    // Link routing to external Eula agreement
    const openEulaLink = async () => {
        try {
            await Linking.openURL('https://cloudpc7.github.io/medjourneyeula/');
        } catch (error) {
            dispatch(setError(error?.message || 'Unable to open link.'));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Pressable
                    testID="eula-checkbox"
                    onPress={() => dispatch(setChecked(!checked))}
                    style={styles.checkboxBtn}
                    accessibilityRole="checkbox"
                    accessibilityLabel="Agree to End User License Agreement"
                    accessibilityState={{ checked }}
                >
                    <FontAwesome6
                        name={checked ? "square-check" : "square"}
                        size={28}
                        color={checked ? "#ba1220" : "#d1d1d1"}
                    />
                </Pressable>
                <View style={styles.textColumn}>
                    <Text style={styles.text}>I agree to the</Text>
                    <Text 
                        testID="eula-link"
                        style={styles.link} 
                        onPress={openEulaLink}
                    >
                        End User License Agreement (EULA)
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // --- Layout and structure ---
    container: {
        marginVertical: 15,
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center', 
    },

    // --- Buttons & Actions ---
    checkboxBtn: {
        marginRight: 15,
    },

    // --- Typography --- 
    textColumn: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text: {
        fontFamily: 'LibreFranklin-Medium',
        fontSize: 16,
        color: '#fff',
    },

    // --- Link --- 
    link: {
        fontFamily: 'LibreFranklin-Medium',
        fontSize: 16,
        color: '#ba1220',
        textDecorationLine: 'underline',
        marginTop: 2,
    },
});

export default Eula;