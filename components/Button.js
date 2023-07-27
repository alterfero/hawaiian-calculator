import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";

export default ({ onPress, text, size, theme }) => {
    const buttonStyles = [styles.button];
    const textStyles = [styles.text];

    if (size === "double") {
        buttonStyles.push(styles.buttonDouble);
    }

    if (theme === "secondary") {
        buttonStyles.push(styles.buttonSecondary);
        textStyles.push(styles.textSecondary);
    } else if (theme === "accent") {
        buttonStyles.push(styles.buttonAccent);
        textStyles.push(styles.textTertiary);
    } else if (theme === "magic") {
        buttonStyles.push(styles.buttonMagic);
        textStyles.push(styles.textMagic);
    }

    return (
        <TouchableOpacity onPress={onPress} style={buttonStyles}>
            <Text style={textStyles} ellipsizeMode="tail" numberOfLines={1}>{text}</Text>
        </TouchableOpacity>
    );
};

// set dimmension
const screen = Dimensions.get("window");

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#586f7c',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        margin: 5,
    },
    text: {
        color: '#fff',
        fontSize: 24,
    },
    textSecondary: {
        color: '#2f4550',
    },
    textTertiary: {
        color: '#2f4550',
    },
    textMagic: {
        color: '#ffffff',
        fontSize: 18,
    },
    buttonDouble: {
        width: screen.width / 2 - 14,
        flex: 0,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#b5b596',
    },
    buttonMagic: {
        backgroundColor: '#94a591',
    },
    buttonAccent: {
        backgroundColor: '#fce1a0',
    },
});