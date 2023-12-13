import React, {useCallback, useEffect, useRef, useState} from "react";
import {SafeAreaView, StyleSheet, Text, View, Image, Pressable, StatusBar, Dimensions, ScrollView, NativeModules, TouchableOpacity} from "react-native";
import Button from "./components/Button";
import Row from "./components/Row";
import {floatNumberToAudio, floatNumberToWords, numberToAudio, numberToWords} from "./util/transcription";
import { useSound } from "./hooks/useSound";
import {ImageBackground} from "react-native-web";

const soundOn = require("./assets/soundOn.png");
const soundOff = require("./assets/soundOff.png");
const kaunalewa = require("./assets/kaunalewa_logo.png");

const windowWidth = Dimensions.get("screen").width;
const MAX_OPERATION_WIDTH = 40;

const largeFontSize = 32;
const smallFontSize = 22;

function evaluate(expression) {
  let e = "";
  expression.forEach( item => {
    e += item;
  })
  console.log("Evaluating expression ",e)
  try {
    let result = eval(e);
    return result.toString();
  } catch (error) {
    console.log(error);
    return 'Invalid expression';
  }
}

export default function App() {

  const operators = ["+", "-", "/", "*"]
  const [modalHelperVisible, setModalHelperVisible] = useState(false);
  const [displayState, setDisplayState] = useState("0");
  const [operationState, setOperationState] = useState([]);
  const [currentNumber, setCurrentNumber] = useState("");
  const [lastResult, setLastResult] = useState("");
  const [magic, setMagic] = useState("");
  const [numberWritten, setNumberWritten] = useState("");
  const [isAudio, setIsAudio] = useState(false)
  const {playSound, playSounds} = useSound();

  function handleTap(type, value) {
    let currentOps = [];

    if (lastResult !== "") {
      console.log("\n\n    RESET in handleTap")
      setCurrentNumber("");
      setOperationState([]);
      setLastResult("");
      setNumberWritten("");
    }
    if (type==="clear") {
      setCurrentNumber("");
      setOperationState([]);
      setLastResult("");
      setNumberWritten("");
    }
    if (type==="back") {
      setCurrentNumber("");
    }
    if (type==="magic") {
      if (magic !== "") {
        setCurrentNumber(magic);
      }
    }
    if (type==="equal") {
      currentOps = operationState;
      if (currentNumber.length > 0) {
        currentOps.push(currentNumber);
        let result = evaluate(operationState).toString();
        setLastResult(result);
        setMagic(result)
        setCurrentNumber("");

        if (isAudio) {
          console.log("Playing ",floatNumberToAudio(result))
          playSounds(floatNumberToAudio(result));
        }
      }
    }
    if (type==="number") {
      let new_number = currentNumber + value;
      setCurrentNumber(new_number);
    }
    if (type==="operator") {
      // you can't begin with an operator, and two operators in a row are not allowed
      console.log("Operator start, current ops ",operationState)
      console.log("lastResult  ",lastResult)
      let currentOps = operationState;
      // if lastResult not "", an evaluation has just been done, local reset is needed and nothing done.
      if (lastResult.length > 0) {
        currentOps = [];
        setOperationState([]);
        setLastResult("");
        setCurrentNumber("");
        setNumberWritten("");
      }
      else {
        if (currentNumber.length > 0) {
          currentOps.push(currentNumber);
          currentOps.push(value);
          setOperationState(currentOps);
          setCurrentNumber("");
          console.log("currentOps ", currentOps);
        } else {
          currentOps.pop();
          currentOps.push(value);
          setOperationState(currentOps);
        }
      }
    }
  }

// DISPLAY UPDATE
  useEffect( () => {
    let display = "";
    operationState.forEach(
        item => {
          if (operators.includes(item)) {
            if (item === "*") {
              item = "x"
            }
            if (item === "-") {
              item = "−"
            }
            display += " " + item;
          }
          else {
          display += " " + (Math.round(parseFloat(item)*100)/100).toLocaleString()
          }
        }
    )
    if (lastResult !== "") {
    display += " = " + (Math.round(parseFloat(lastResult)*100)/100).toLocaleString();
      setNumberWritten(floatNumberToWords(lastResult));
    }
    setDisplayState( display + " ")
      },
  [operationState, currentNumber, lastResult]
  )

  const [fontSize, setFontSize] = useState();
  const viewRef = useRef(null);
  const textRef = useRef(null);

  const handleTextLayout = () => {
      const textCurrent = textRef.current;
      const viewCurrent = viewRef.current;

      if (fontSize !== smallFontSize && textCurrent && viewCurrent) {
          viewCurrent.measure((_x, _y, _width, viewHeight) => {
              textCurrent.measureLayout(viewCurrent, (__x, __y, __width, textHeight) => {
                  setFontSize(textHeight / viewHeight < 0.5 ? largeFontSize : smallFontSize);
              });
          });
      }
  };

  useEffect(() => {
      setFontSize(undefined);
  }, [numberWritten]);

  const [operationsScrollEnabled, setOperationsScrollEnabled] = useState(false);
  const operationScrollRef = useRef(null);
  const [operationFontSize, setOperationFontSize] = useState(largeFontSize);
  const operationViewRef = useRef(null);
  const operationTextRef = useRef(null);

  const handleOperationTextLayout = () => {
      const textCurrent = operationTextRef.current;
      const viewCurrent = operationViewRef.current;

      if (textCurrent && viewCurrent) {
          viewCurrent.measure((_x, _y, viewWidth, _height) => {
              textCurrent.measureLayout(viewCurrent, (__x, __y, textWidth, _height) => {
                  setOperationFontSize(textWidth / viewWidth < 0.9 ? largeFontSize : smallFontSize);
              });
          });
      }
  };

  const scrollToEnd = useCallback(() => {
      if (operationScrollRef.current) {
          operationScrollRef.current.scrollToEnd({ animated: true });
      }
  }, [operationScrollRef]);

  const onContentSizeChange = useCallback(
      (contentWidth) => {
          setOperationsScrollEnabled(contentWidth > windowWidth - MAX_OPERATION_WIDTH);
          scrollToEnd();
      },
      [scrollToEnd]
  );


  
 return (
          <SafeAreaView style={_containers.main}>
            <View ref={viewRef} style={[_containers.words, numberWritten ? _containers.wordsActive : null]}>
              <View>
                <View>
                  <TouchableOpacity
                      style={styles.small_button}
                      onPress={() => setIsAudio(!isAudio)}>
                    {isAudio ? <Image source={soundOn} style={styles.buttonIcon} />
                        : <Image source={soundOff} style={styles.buttonIcon}/>}
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView>
                <Text style={[styles.text, {fontSize}]}>{fontSize && numberWritten}</Text>

                {/* ghost text to calculate font size, no font flickering */}
                <Text
                    ref={textRef}
                    onTextLayout={handleTextLayout}
                    style={[styles.text, { fontSize: largeFontSize, position: 'absolute', opacity: 0 }]}
                >
                    {numberWritten}
                </Text>
              </ScrollView>
             <View style={[styles.pointer, numberWritten ? styles.pointerActive : null]} />
            </View>
    
            <View ref={operationViewRef} style={_containers.operations}>
              <ScrollView ref={operationScrollRef} horizontal={true} scrollEnabled={operationsScrollEnabled} onContentSizeChange={onContentSizeChange} >
                  <Text style={[styles.value, { fontSize: operationFontSize }]} onLayout={handleOperationTextLayout}>
                    {displayState}
                  </Text>
                  <Text style={[styles.value, styles.current, { fontSize: operationFontSize }]}>
                    {currentNumber.toLocaleString()}
                  </Text>

                  {/* ghost text to calculate font size */}
                  <View ref={operationTextRef} style={{ position: 'absolute', opacity: 0 }}>
                      <Text style={[styles.value, { fontSize: largeFontSize }]}>{displayState}</Text>
                      <Text onTextLayout={handleOperationTextLayout} style={[styles.value, styles.current, { fontSize: largeFontSize }]}>
                          {currentNumber ? currentNumber.toLocaleString() : ''}
                      </Text>
                  </View>
              </ScrollView>
            </View>

            <View style={_containers.keyboard}>
              <Row>
                <Button
                    text="C"
                    theme="secondary"
                    onPress={() => handleTap("clear")}
                />
                <Button
                    text="◄"
                    theme="secondary"
                    onPress={() => handleTap("back")}
                />
                <Button
                    text={(Math.round(magic*100)/100).toString()}
                    theme="magic"
                    onPress={() => handleTap("magic")}
                />
                <Button
                    text="/"
                    theme="accent"
                    onPress={() => handleTap("operator", "/")}
                />
              </Row>
              {/* Number */}
              <Row>
                <Button text="7" onPress={() => handleTap("number", 7)} />
                <Button text="8" onPress={() => handleTap("number", 8)} />
                <Button text="9" onPress={() => handleTap("number", 9)} />
                <Button
                    text="x"
                    theme="accent"
                    onPress={() => handleTap("operator", "*")}
                />
              </Row>
              <Row>
                <Button text="4" onPress={() => handleTap("number", 4)} />
                <Button text="5" onPress={() => handleTap("number", 5)} />
                <Button text="6" onPress={() => handleTap("number", 6)} />
                <Button
                    text="-"
                    theme="accent"
                    onPress={() => handleTap("operator", "-")}
                />
              </Row>
              <Row>
                <Button text="1" onPress={() => handleTap("number", 1)} />
                <Button text="2" onPress={() => handleTap("number", 2)} />
                <Button text="3" onPress={() => handleTap("number", 3)} />
                <Button
                    text="+"
                    theme="accent"
                    onPress={() => handleTap("operator", "+")}
                />
              </Row>
              <Row>
                <Button text="0" onPress={() => handleTap("number", 0)} />
                <Button text="." onPress={() => handleTap("number", ".")} />
                <Button
                    text="="
                    theme="primary"
                    onPress={() => handleTap("equal", "=")}
                    size="double"
                />
              </Row>
            </View>

            <View style={_containers.config}>
              <View style={_containers.configButtons}>
                <Image source={kaunalewa} style={{height:50, resizeMode:"contain"}}/>
              </View>
            </View>
          </SafeAreaView>
    );
}


const _containers = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#47523D",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 4,
  },
  words: {
    height: '20%',
    padding: 12,
    margin: 24,
    borderRadius: 12,
    borderBottomEndRadius: 4,
    backgroundColor: '#c7c7c9',
  },
  wordsActive: {
      backgroundColor: '#f4f4f9',
  },
  operations: {
    marginTop: 4,
    margin: 16,
    height: 60,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: '#8a9892',
    elevation: 2,
  },
  inputs: {},
  keyboard: {
    flex: 1,
  },
  config: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexDirection: 'row',
    marginVertical: 4,
    borderTopWidth: 0,
    borderColor: '#586f7c',
  },
  configButtons: {
      flexDirection: 'row',
  },
  });

  const styles = StyleSheet.create({
    pointer: {
      width: 40,
      height: 40,
      backgroundColor: '#c7c7c9',
      position: 'absolute',
      bottom: 0,
      right: 0,
      transform: [{ translateY: 10 }, { translateX: -20 }, { rotate: '45deg' }],
  },
  pointerActive: {
      backgroundColor: '#f4f4f9',
  },
    value: {
      color: "#f4f4f9",
      textAlign: "right",
      textAlignVertical: 'center'
    },
    current: {
      textDecorationLine: "underline"
    },
    text: {
      color: "#2f4550",
      textAlign: "left",
      marginRight: 20,
      marginBottom: 10,
    },
    small_button : {
      width: 48,
      height: 24,
      borderRadius: 20,
      backgroundColor:"#2f4550",
      borderWidth: 1,
      borderColor: "#586f7c",
      padding: 10,
      marginVertical: 4,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      flexDirection: "row",
    },
    buttonIcon : {
      width: 16,
      height: 16
    }
  });

