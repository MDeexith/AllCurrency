import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff',
    },
    maincont: {
        alignItems: 'center',
    },
    text: {
        color: "#000",
        fontWeight: "bold",
    },
    headtext:{
        color: "#000",
        fontWeight: "bold",
        fontSize: 20,
    },
    infotext: {
        color: "#707070",
        fontWeight: "bold",
    },
    inputview: {
        margin: 5
    },
    input: {
        backgroundColor: "transparent",
        borderBottomColor: "black",
        borderBottomWidth: 2,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    dropdown: {
        backgroundColor: "#F0F0F0",
        borderColor: "#9DA3B4",
        borderWidth: 1,
        shadowColor: "#000",
        elevation: 5,
    },
    modal: {
        backgroundColor: "white",
        margin: 10,
        borderColor: "#9DA3B4",
        borderWidth: 1,
        borderRadius: 10,
        shadowColor: "#000",
        elevation: 5,
    },
    button: {
        backgroundColor: "#FFC107",
        borderRadius: 5,
        padding: 10,
        margin: 5,
        alignItems: "center",
        shadowColor: "#000",
        elevation: 5,
    },
    buttontext: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
    result: {
        flex:1,
        backgroundColor: "#FFDAB9",
        borderColor: "#FFA500",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        margin: 5,
        alignItems: "center",
        shadowColor: "#000",
        elevation: 5,
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
    usebtu: {
        backgroundColor: "#FFB6C1",
        borderRadius: 5,
        padding: 8,
        margin: 5,
        borderColor: "#FF1493",
        borderWidth: 1,
        alignItems: "center",
        shadowColor: "#000",
        elevation: 5,
    },
    searchtext: {
        color: "#000",
    },
    search:{
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
    }
});

export default styles;