import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileCard from './ProfileCard';

describe('ProfileCard', () => {
  const baseImage = 'https://example.com/image.jpg';

  it('renders professor layout with profession, department, college and group', () => {
    const profile = {
      name: 'Dr. Jane Doe',
      accountType: 'professor',
      profession: 'Cardiologist',
      department: 'Cardiology',
      College: 'MedUniversity',
      group: 'Heart Lab',
    };

    const { getByText, getByTestId } = render(
      <ProfileCard profile={profile} imageUri={baseImage} />,
    );

    // Main overlay exists
    expect(getByTestId('profile-card-overlay')).toBeTruthy();

    // Name
    expect(getByText('Dr. Jane Doe')).toBeTruthy();

    // Combined profession + department
    expect(getByText(/Cardiologist · Cardiology/)).toBeTruthy();

    // College and group
    expect(getByText('MedUniversity')).toBeTruthy();
    expect(getByText('Heart Lab')).toBeTruthy();
  });

  it('renders student layout with degree, major and college', () => {
    const profile = {
      name: 'Alex Student',
      accountType: 'student',
      degree: 'MS2',
      major_minor: 'Neurology',
      College: 'Student Med School',
    };

    const { getByText } = render(
      <ProfileCard profile={profile} imageUri={baseImage} />,
    );

    expect(getByText('Alex Student')).toBeTruthy();
    expect(getByText(/MS2 · Neurology/)).toBeTruthy();
    expect(getByText('Student Med School')).toBeTruthy();
  });

  it('sets an accessible summary label for a professor profile', () => {
    const profile = {
      name: 'Accessibility Test',
      accountType: 'professor',
      department: 'Oncology',
      College: 'Onco Med',
    };

    const { getByTestId } = render(
      <ProfileCard profile={profile} imageUri={baseImage} />,
    );

    const overlay = getByTestId('profile-card-overlay');
    expect(overlay.props.accessibilityLabel).toBe(
      'Accessibility Test, professor in Oncology at Onco Med.',
    );
  });

  it('falls back in a11y summary when department/College are missing for professor', () => {
    const profile = {
      name: 'No Context User',
      accountType: 'professor',
      // department and College intentionally omitted
    };

    const { getByTestId } = render(
      <ProfileCard profile={profile} imageUri={baseImage} />,
    );

    const overlay = getByTestId('profile-card-overlay');
    expect(overlay.props.accessibilityLabel).toBe(
      'No Context User, professor in medical faculty at unknown school.',
    );
  });

  it('falls back for missing name using "Unknown" in a11y summary', () => {
    const profile = {
      // no name
      accountType: 'student',
      degree: 'MS1',
      College: 'Fallback Med',
    };

    const { getByTestId, getByText } = render(
      <ProfileCard profile={profile} imageUri={baseImage} />,
    );

    // UI should show "Unknown" as the name
    expect(getByText('Unknown')).toBeTruthy();

    const overlay = getByTestId('profile-card-overlay');
    expect(overlay.props.accessibilityLabel).toBe(
      'Unknown, MS1 at Fallback Med.',
    );
  });

  it('renders fallback image container when imageUri is empty', () => {
    const profile = {
      name: 'No Image User',
      accountType: 'student',
      degree: 'MS3',
      major_minor: 'Surgery',
      College: 'NoImage Med',
    };

    const { getByTestId, getByText } = render(
      <ProfileCard profile={profile} imageUri="" />,
    );

    // Fallback view still has an image wrapper testID
    expect(getByTestId('profile-card-image')).toBeTruthy();

    // Content still renders correctly
    expect(getByText('No Image User')).toBeTruthy();
    expect(getByText(/MS3 · Surgery/)).toBeTruthy();
    expect(getByText('NoImage Med')).toBeTruthy();
  });

  it('renders "View Full Profile" hint text', () => {
    const profile = {
      name: 'Hint User',
      accountType: 'student',
      degree: 'MS4',
      College: 'Hint Med School',
    };

    const { getByText } = render(
      <ProfileCard profile={profile} imageUri={baseImage} />,
    );

    // The hint text at the bottom of the card
    expect(getByText('View Full Profile')).toBeTruthy();
  });
});
