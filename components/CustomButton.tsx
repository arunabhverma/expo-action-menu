import React, { useState } from "react";
import { Pressable, PressableProps, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const Button = (props: PressableProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: isPressed
            ? withTiming(0.5, { duration: 200 })
            : withTiming(1, { duration: 200 }),
        },
      ],
    };
  });

  const onTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <Pressable
      {...props}
      onTouchStart={() => {
        setIsPressed(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(onTouchEnd, 100);
      }}
      onTouchEnd={onTouchEnd}
    >
      <View>
        <Animated.View style={animatedStyle}>{props.children}</Animated.View>
      </View>
    </Pressable>
  );
};

export default Button;
