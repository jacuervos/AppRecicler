import {
  CameraOptions,
  ImageLibraryOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

export async function openCamera() {
  const options: CameraOptions = {
    mediaType: 'photo',
    saveToPhotos: false,
    quality: 0.8,
    cameraType: 'back',
  };
  try {
    const result = await launchCamera(options);
    if (result?.assets) {
      return {
        url: result.assets[0].uri ?? '',
        name: result.assets[0].fileName ?? '',
        type: 'photo',
        fileType: 'IMAGE',
      };
    }
  } catch (error) {
    console.log('Error camera image:', error);
  }
}

export async function openGallery() {
  const options: ImageLibraryOptions = {
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 1,
  };
  try {
    const result = await launchImageLibrary(options);
    if (result?.assets) {
      return {
        url: result.assets[0].uri ?? '',
        name: result.assets[0].fileName ?? '',
        type: 'photo',
        fileType: 'IMAGE',
      };
    }
  } catch (error) {
    console.log('Error gallery image:', error);
  }
}
