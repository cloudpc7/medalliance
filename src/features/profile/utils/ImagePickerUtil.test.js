import { useImagePicker } from './ImagePickerUtil';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
  getMediaLibraryPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

describe('useImagePicker', () => {
  let fetchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    delete global.fetch;
  });

  it('throws if permission is denied even after request', async () => {
    ImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { pickImage } = useImagePicker();

    await expect(pickImage()).rejects.toThrow('Media library permission denied.');

    expect(ImagePicker.getMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns null when picker is cancelled', async () => {
    ImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { pickImage } = useImagePicker();

    const result = await pickImage();

    expect(result).toBeNull();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when file is too large (>5MB)', async () => {
    ImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    const bigSize = 6 * 1024 * 1024; // 6MB

    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///test.jpg',
          fileSize: bigSize,
        },
      ],
    });

    const { pickImage } = useImagePicker();

    await expect(pickImage()).rejects.toThrow('Image is too large. Max size is 5MB.');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when file extension is not jpg/jpeg/png', async () => {
    ImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///test.gif',
          fileSize: 1024,
        },
      ],
    });

    const { pickImage } = useImagePicker();

    await expect(pickImage()).rejects.toThrow(
      'Invalid file type. Only JPG and PNG are supported'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns a blob when selection is valid and permission becomes granted', async () => {
    ImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'undetermined',
    });

    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///valid-image.jpg',
          fileSize: 12345,
        },
      ],
    });

    const mockBlob = { mock: 'blob' };
    fetchMock.mockResolvedValue({
      blob: jest.fn().mockResolvedValue(mockBlob),
    });

    const { pickImage } = useImagePicker();

    const result = await pickImage();

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('file:///valid-image.jpg');
    expect(result).toBe(mockBlob);
  });
});
