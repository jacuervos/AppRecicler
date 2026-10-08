import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {colors} from '../../utils/constants.tsx';

interface IUploadArchive {
    sheetRef: React.RefObject<BottomSheetModal>;
    handleTakeImage: (value: 'photo' | 'gallery') => void;
}

export const ChangeImage = ({
                                sheetRef,
                                handleTakeImage,
}: IUploadArchive) => {
    const snapPoints = useMemo(() => ['30%'], []);


    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            snapPoints={snapPoints}
            enablePanDownToClose={true}>
            <BottomSheetView style={styles.card}>
                <View>
                    <Text style={styles.title}>Selecciona por donde vas a subir la imagen</Text>
                    <View style={styles.containerTake}>
                        <Pressable style={styles.item} onPress={() => handleTakeImage('photo')}>
                            <FontAwesome name={'camera'} size={30} />
                            <Text>Tomar foto</Text>
                        </Pressable>
                        <Pressable style={styles.item} onPress={() => handleTakeImage('gallery')}>
                            <FontAwesome name={'file-image-o'} size={30} />
                            <Text>Subir imagen</Text>
                        </Pressable>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    containerTake: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '80%',
    },
    item: {
        marginTop: 20,
        alignContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});
