import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ToastAndroid,
  Platform,
  PanResponder,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  INACTIVITY_INTERVAL,
  formatIndian,
  getBalance,
  showToast,
} from "../Api/common";
import { useFocusEffect } from "@react-navigation/native";

const data = [
  { label: "NEFT", value: "1" },
  { label: "RTGS", value: "2" },
  { label: "UPI", value: "3" },
];

const AmtTransfer = ({ navigation }) => {
  const [value, setValue] = useState(null);
  const [transferAmt, setTransferAmt] = useState(0);
  const [balance, set_balance] = useState(-1);
  const [name, setName] = useState("");
  React.useEffect(() => {
    startTimer();
    const fetchBalance = async () => {
      try {
        const y = await AsyncStorage.getItem("userDetails");
        const x = JSON.parse(y);
        if (x) {
          set_balance(x.savingAccount);
          setName(x.fullName);
        } else set_balance("Loading");
      } catch (error) {
        console.log(error);
      }
    };
    fetchBalance();
  }, []);
  React.useEffect(() => {
    console.log(balance);
  }, [balance]);
  React.useEffect(() => {
    if (balance && transferAmt) {
      console.log(parseInt(transferAmt), parseInt(balance));
      if (parseInt(transferAmt) > parseInt(balance)) {
        if (Platform.OS === "android") {
          ToastAndroid.showWithGravityAndOffset(
            "Transfer amount cannot exceed balance",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        } else {
          alert("Username and Password do not match");
        }
        inputTextRef.current.blur();
        setTransferAmt(0);
      }
    }
  }, [transferAmt]);
  const LogOut = () => {
    AsyncStorage.removeItem("login", () => {
      AsyncStorage.removeItem("balance").then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      });
    });
  };
  const startTimer = () => {
    inactivityTimer.current = setTimeout(() => {
      //showToast("Your current session was timed-out and you have been logged out. Please login again to continue.");
      Alert.alert('Session Timeout', 'Your current session was timed-out and you have been logged out. Please login again to continue.', [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
      console.log("Amount Transfer");
      LogOut();
    }, INACTIVITY_INTERVAL);
  };
  const inactivityTimer = React.useRef(null);
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        handleActivity();
      },
      onPanResponderMove: (evt, gestureState) => {
        handleActivity();
      },
    })
  ).current;

  const handleActivity = () => {
    clearInactivityTimer();
    startTimer();
  };

  const clearInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
  };
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        clearInactivityTimer();
      };
    }, [])
  );
  const inputTextRef = React.useRef(null);
  return (
    <View
      // {...panResponder.panHandlers}
      style={{ backgroundColor: "#f1f1f1", height: "100%" }}
    >
      <StatusBar animated={true} backgroundColor="#FF1715" style="light" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            handleActivity();
            navigation.navigate("Payment");
          }}
          style={{ width: 40, height: 30, backgroundColor: "white" }}
        >
          <Image
            style={{
              width: 20,
              height: 20,
              marginTop: 5,
              backgroundColor: "white",
            }}
            source={require("../assets/back-arrow.png")}
          ></Image>
        </TouchableOpacity>
        <Text style={{ fontSize: 18 }}>Amount Transfer</Text>
      </View>
      <View style={styles.MainCard}>
        <View style={{ flexDirection: "row", width: "100%" }}>
          <Text
            style={{
              width: "60%",
              fontSize: 18,
              color: "#5a5a5a",
              fontWeight: "500",
            }}
          >
            {name}
          </Text>
          <View style={{ width: "40%", flexDirection: "row-reverse" }}>
            <TouchableOpacity
              onPress={() => {
                handleActivity();
                navigation.navigate("Home");
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#FF1715" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", width: "100%", marginTop: 15 }}>
          <Text style={{ fontSize: 14, color: "#5a5a5a" }}>Account :</Text>
          <Text style={{ marginLeft: 8, fontSize: 14, color: "#5a5a5a" }}>
            897526221562
          </Text>
        </View>
      </View>

      <View style={styles.StatementCard}>
        <Text
          style={{
            width: "100%",
            fontSize: 18,
            color: "#5a5a5a",
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          Amount
        </Text>
        <View>
          <TextInput
            ref={inputTextRef}
            style={styles.InputAmt}
            value={transferAmt.toString()}
            onChangeText={setTransferAmt}
            placeholder="Enter Amount"
            keyboardType="numeric"
          />
          <Text style={styles.AmountText}>{formatIndian(balance)} INR</Text>
          <Text style={styles.AmountText1}>Your reference (optional)</Text>
          <Text style={styles.AmountText1}>
            Your reference will appere on your statements.
          </Text>
        </View>
      </View>

      <View style={styles.StatementCard1}>
        <Text
          style={{
            width: "100%",
            fontSize: 18,
            color: "#5a5a5a",
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          Transfer type
        </Text>
        <View>
          <Dropdown
            style={styles.dropdown}
            data={data}
            maxHeight={300}
            iconStyle={styles.iconStyle}
            labelField="label"
            valueField="value"
            placeholder="NEFT"
            value={value}
            onChange={(item) => {
              handleActivity();
              setValue(item.value);
            }}
          />
          <View style={styles.AmountText2}>
            <Image
              style={{ width: 14, height: 14, margin: 2 }}
              source={require("../assets/link.png")}
            ></Image>
            <Text style={{ marginLeft: 5 }}> View Terms & Conditions</Text>
          </View>
          <View style={styles.AmountText3}>
            <Image
              style={{ width: 16, height: 16, margin: 2 }}
              source={require("../assets/check1.png")}
            ></Image>
            <Text style={{ marginLeft: 5 }}>
              I have read and agree to the Terms & Conditions
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  MainCard: {
    backgroundColor: "#fff",
    padding: 18,
    marginLeft: 6,
    marginRight: 6,
    marginTop: 8,
    borderRadius: 5,
    borderColor: "#E9E9E9",
    borderWidth: 1,
  },
  StatementCard: {
    backgroundColor: "#fff",
    padding: 18,
    margin: 6,
    borderRadius: 5,
    borderColor: "#E9E9E9",
    borderWidth: 1,
  },
  StatementCard1: {
    backgroundColor: "#fff",
    padding: 18,
    margin: 6,
    marginTop: 0,
    borderRadius: 5,
    borderColor: "#E9E9E9",
    borderWidth: 1,
  },
  AmountText: {
    color: "#5A5A5A",
    fontSize: 13,
    marginBottom: 30,
  },
  AmountText1: {
    color: "#5A5A5A",
    fontSize: 15,
    paddingBottom: 8,
  },
  AmountText2: {
    color: "#5A5A5A",
    fontSize: 15,
    padding: 8,
    textAlignVertical: "center",
    alignSelf: "center",
    flexDirection: "row",
  },
  AmountText3: {
    color: "#5A5A5A",
    fontSize: 15,
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    textAlignVertical: "center",
    alignSelf: "center",
    flexDirection: "row",
  },
  header: {
    alignItems: "center",
    textAlignVertical: "center",
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 18,
    marginTop: 38,
    flexDirection: "row",
    width: "100%",
  },
  InputAmt: {
    width: "100%",
    fontSize: 18,
    padding: 5,
    borderBottomColor: "#EAEAEA",
    borderBottomWidth: 1,
    marginTop: 5,
    marginBottom: 7,
  },
  dropdown: {
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    width: "100%",
    marginBottom: 20,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 30,
    height: 30,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default AmtTransfer;
