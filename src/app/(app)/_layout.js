// 🔥 Production Ready
import React from 'react';
import { Stack } from 'expo-router';

const AppLayout = () => {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="account" />
            <Stack.Screen name="profile-upload"/>
            <Stack.Screen name="profile-settings"/>
            <Stack.Screen name="search" />
            <Stack.Screen name="delete-account" />
            <Stack.Screen name="messaging" />
            <Stack.Screen name="chat" />
        </Stack>
    );
};

export default AppLayout;