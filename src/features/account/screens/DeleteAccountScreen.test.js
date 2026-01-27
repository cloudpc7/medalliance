import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import DeleteAccountScreen from './DeleteAccountScreen';

// 1. Import spies from global
import { __mockRouter } from '../../../../global.mocks'; 
import * as accountSlice from '../../../redux/slices/accountSlice';
import * as errorSlice from '../../../redux/slices/error.slice';

// 2. Mock specific Redux actions
jest.mock('../../../redux/slices/accountSlice', () => ({
  deleteAccount: jest.fn(),
}));

jest.mock('../../../redux/slices/error.slice', () => ({
  clearError: jest.fn(() => ({ type: 'error/clearError' })),
}));

// 3. Define controlled state
const mockState = {
  auth: { user: { uid: 'test-uid' } },
  loading: { activeRequests: 0 },
  error: { message: null },
};

describe('DeleteAccountScreen', () => {
  let dispatch;

  beforeEach(() => {
    // Smart mock for dispatch to handle .unwrap() logic
    dispatch = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true })
    });
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) => selector(mockState));
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  it('renders the screen structure and the delete button', () => {
    render(<DeleteAccountScreen />);
    
    // We check for the unique screen title and the specific button ID
    expect(screen.getByText('Account Settings')).toBeTruthy();
    expect(screen.getByTestId('confirm-delete-button')).toBeTruthy();
    expect(screen.getByText('Danger zone')).toBeTruthy();
  });

  it('navigates to sign-in on successful account deletion', async () => {
    render(<DeleteAccountScreen />);
    const deleteBtn = screen.getByTestId('confirm-delete-button');

    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    // Verifies the thunk was dispatched and navigation followed
    expect(dispatch).toHaveBeenCalledWith(accountSlice.deleteAccount());
    expect(__mockRouter.mockReplace).toHaveBeenCalledWith('/sign-in');
  });

  it('navigates back when cancel is pressed', () => {
    render(<DeleteAccountScreen />);
    const cancelBtn = screen.getByTestId('cancel-delete-button');
    
    fireEvent.press(cancelBtn);
    
    expect(__mockRouter.mockBack).toHaveBeenCalled();
  });

  it('shows loading overlay when activeRequests > 0', () => {
    useSelector.mockImplementation((selector) => selector({
      ...mockState,
      loading: { activeRequests: 1 }
    }));

    render(<DeleteAccountScreen />);
    expect(screen.getByText('Permanently removing account...')).toBeTruthy();
  });

  it('clears the global error state on unmount', () => {
    const { unmount } = render(<DeleteAccountScreen />);
    
    // Trigger the useEffect cleanup
    unmount();

    // Verify the cleanup action was dispatched
    expect(dispatch).toHaveBeenCalledWith(errorSlice.clearError());
  });
});