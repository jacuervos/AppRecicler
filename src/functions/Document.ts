import {pick} from '@react-native-documents/picker';

export async function openDocument() {
  try {
    const url = await pick({
      type: ['application/pdf'],
    });
    if (url.length > 0) {
      return {
        url: url[0].uri ?? '',
        name: url[0].name ?? '',
        type: 'document',
        fileType: 'DOCUMENT',
      };
    }
  } catch (error) {
    console.log('Error document:', error);
  }
}
