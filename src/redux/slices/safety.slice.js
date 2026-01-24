// --- Redux Libraries & Modules ---
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { callSendSafetyReport } from '../../utils/apiUtilities/api';
export const  sendSafetyMessage = createAsyncThunk(
    'safety/sendSafetyMessage', async ({reportType, message},{ rejectWithValue}) => {
        try {

            if (!reportType || !message) {
                throw new Error('Report Type and message are required');
            };

            const result = await callSendSafetyReport({ reportType, message});
            
            return { success: true, message: 'Report submitted'};
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to send message.');
        };
    }
);

const initialState = {
    reportType: "",
    message: "",
    loading: false,
    error: null,
    status: "",
};

const safetySlice = createSlice({
    name: "safety",
    initialState,
    reducers: {

    },
    extraReducers:(builder) => {
        builder
        .addCase(sendSafetyMessage.pending, (state) => {
            state.loading = true;
            state.error = null;

        })
        .addCase(sendSafetyMessage.fulfilled, (state) => {
            state.loading = false;
            state.status = "Report submitted";
            state.reportType = "";
            state.message = "";
        })
        .addCase(sendSafetyMessage.rejected, (state,action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default safetySlice.reducer;