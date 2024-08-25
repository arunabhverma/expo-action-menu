import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomInEasyDown,
  ZoomOutEasyDown,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { convertRgbToRgba } from "@/utils";
import { DATA } from "@/mock/DATA";
import Button from "@/components/CustomButton";

type Person = {
  id: string;
  name: string;
  image: string;
};

const IMAGE_WIDTH = 45;
const BUTTON_WIDTH = 50;
const HOVER_HEIGHT = IMAGE_WIDTH + 20;
const CARD_HEIGHT = DATA.length * IMAGE_WIDTH + 20 * DATA.length;
const SEGMENT_HEIGHT = (CARD_HEIGHT - HOVER_HEIGHT) / (DATA.length - 1);
const TIMING_CONFIG = { duration: 250, easing: Easing.out(Easing.ease) };

const RenderItem = ({
  item,
  index,
  hover,
  offset,
}: {
  item: Person;
  index: number;
  hover: SharedValue<boolean>;
  offset: SharedValue<number>;
}) => {
  const theme = useTheme();

  const animatedHoverStyle = useAnimatedStyle(() => {
    const itemPosition = index * SEGMENT_HEIGHT;
    const scaleInterpolate = interpolate(
      offset.value,
      [
        itemPosition - SEGMENT_HEIGHT,
        itemPosition,
        itemPosition + SEGMENT_HEIGHT,
      ],
      [1, 1.1, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        {
          scale: withTiming(hover.value ? scaleInterpolate : 1, {
            easing: Easing.out(Easing.ease),
            duration: 100,
          }),
        },
      ],
    };
  });
  return (
    <Animated.View style={[styles.cardItemContainer, animatedHoverStyle]}>
      <Image source={item.image} style={styles.itemImage} />
      <Text style={[{ color: theme.colors.text }, styles.itemText]}>
        {item.name}
      </Text>
    </Animated.View>
  );
};

const Main = () => {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const offset = useSharedValue<number>(CARD_HEIGHT - HOVER_HEIGHT);
  const extra = useSharedValue<number>(0);
  const pressed = useSharedValue<boolean>(false);
  const hover = useSharedValue<boolean>(false);

  const hapticOnSnap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useDerivedValue(() => {
    if (offset.value % 1 === 0) {
      runOnJS(hapticOnSnap)();
    }
  }, [offset.value]);

  const Pan = Gesture.Pan()
    .onBegin(() => {})
    .onChange((event) => {
      extra.value = event.translationY;
      if (-event.translationY < HOVER_HEIGHT) {
        let val = CARD_HEIGHT - HOVER_HEIGHT;
        offset.value = withTiming(val, TIMING_CONFIG);
      } else if (-event.translationY > CARD_HEIGHT) {
        offset.value = withTiming(0, TIMING_CONFIG);
      } else {
        hover.value = true;
        const rawOffset = CARD_HEIGHT + event.translationY;
        const snappedOffset =
          Math.round(rawOffset / SEGMENT_HEIGHT) * SEGMENT_HEIGHT;
        offset.value = withTiming(snappedOffset, TIMING_CONFIG);
      }
    })
    .onFinalize(() => {
      hover.value = false;
      pressed.value = false;
      offset.value = withDelay(200, withTiming(CARD_HEIGHT - HOVER_HEIGHT));
      extra.value = withTiming(0);
      runOnJS(setOpen)(false);
    });

  const animatedBarStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(hover.value ? 1 : 0),
      transform: [
        {
          translateY: offset.value,
        },
      ],
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const inputRange = [
      -2 * CARD_HEIGHT,
      -CARD_HEIGHT,
      -HOVER_HEIGHT,
      -HOVER_HEIGHT + CARD_HEIGHT,
    ];
    const scaleYVal = interpolate(
      extra.value,
      inputRange,
      [1.05, 1, 1, 1.05],
      Extrapolation.CLAMP
    );
    const scaleXVal = interpolate(
      extra.value,
      inputRange,
      [0.97, 1, 1, 0.97],
      Extrapolation.CLAMP
    );
    const origin = interpolate(
      extra.value,
      [-CARD_HEIGHT, -HOVER_HEIGHT],
      [
        (CARD_HEIGHT * (1 - scaleYVal)) / 2,
        -((CARD_HEIGHT * (1 - scaleYVal)) / 2),
      ],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      extra.value,
      inputRange,
      [-10, 1, 1, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { scaleY: scaleYVal },
        { scaleX: scaleXVal },
        { translateY: origin },
        { translateY: translateY },
      ],
    };
  });

  const AllGesture = Pan;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={{
          uri: "https://img.freepik.com/premium-vector/colorful-gradient-mesh-background-bright-colors-abstract-blurred-smooth-vector-illustration_84176-2229.jpg?semt=ais_hybrid",
        }}
        style={styles.container}
      >
        <GestureDetector gesture={AllGesture}>
          <View>
            {open && (
              <Animated.View
                entering={ZoomInEasyDown}
                exiting={ZoomOutEasyDown}
              >
                <Animated.View
                  style={[
                    {
                      backgroundColor: convertRgbToRgba(theme.colors.card, 0.5),
                    },
                    styles.cardContainer,
                    animatedCardStyle,
                  ]}
                >
                  <Animated.View
                    style={[
                      { backgroundColor: theme.colors.card },
                      styles.hoverStyle,
                      styles.normalShadow,
                      animatedBarStyle,
                    ]}
                  />
                  {DATA.map((item, index) => (
                    <RenderItem
                      key={item.id}
                      item={item}
                      index={index}
                      hover={hover}
                      offset={offset}
                    />
                  ))}
                </Animated.View>
              </Animated.View>
            )}
            <Button
              onPressIn={() => {
                setOpen(true);
                pressed.value = true;
                offset.value = CARD_HEIGHT - HOVER_HEIGHT;
              }}
            >
              <View
                style={[
                  { backgroundColor: theme.colors.card },
                  styles.buttonStyle,
                  styles.normalShadow,
                ]}
              >
                <Ionicons
                  name="share"
                  size={28}
                  color={
                    colorScheme === "light"
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(255,255,255,0.3)"
                  }
                />
              </View>
            </Button>
          </View>
        </GestureDetector>
      </ImageBackground>
    </GestureHandlerRootView>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column-reverse",
    paddingBottom: 250,
  },
  cardContainer: {
    width: 330,
    borderRadius: IMAGE_WIDTH / 2,
    position: "absolute",
    alignSelf: "center",
    bottom: BUTTON_WIDTH / 2,
  },
  normalShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  hoverStyle: {
    width: "110%",
    position: "absolute",
    alignSelf: "center",
    height: HOVER_HEIGHT,
    borderRadius: IMAGE_WIDTH / 2,
  },
  buttonStyle: {
    width: BUTTON_WIDTH,
    aspectRatio: 1,
    borderRadius: BUTTON_WIDTH / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  cardItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemImage: {
    width: IMAGE_WIDTH,
    aspectRatio: 1,
    borderRadius: IMAGE_WIDTH / 2,
  },
  itemText: { fontSize: 15 },
});
