import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { colors } from "../theme";

type DrinkMarkProps = {
  tone?: "amber" | "teal" | "berry" | "paper" | "mint";
  size?: "tiny" | "small" | "medium" | "large" | "hero";
  variant?: "rocks" | "highball" | "martini" | "coupe" | "bottle" | "shaker" | "citrus";
  style?: ViewStyle;
};

const toneMap = {
  amber: colors.accent,
  teal: colors.teal,
  berry: colors.berry,
  paper: colors.paper,
  mint: colors.success,
} as const;

const fillMap = {
  amber: "#b86a13",
  teal: "#127964",
  berry: "#b44116",
  paper: "#9a7b3d",
  mint: "#2a7c42",
} as const;

const sizeMap = {
  tiny: { width: 30, height: 34 },
  small: { width: 50, height: 56 },
  medium: { width: 70, height: 78 },
  large: { width: 118, height: 124 },
  hero: { width: 290, height: 210 },
} as const;

export function DrinkMark({
  tone = "amber",
  size = "medium",
  variant = "rocks",
  style,
}: DrinkMarkProps) {
  const tint = toneMap[tone];
  const fill = fillMap[tone];
  const dimensions = sizeMap[size];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, dimensions, style]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 96 96" fill="none">
        {variant === "shaker" ? (
          <G stroke={tint} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M37 15h22l-4 12H41l-4-12Z" strokeWidth={3} />
            <Path d="M39 27h18l7 48c1 5-3 10-8 10H40c-5 0-9-5-8-10l7-48Z" strokeWidth={3} />
            <Path d="M34 45h28" strokeWidth={2.2} opacity={0.7} />
            <Path d="M32 76h32" strokeWidth={2.2} opacity={0.75} />
            <Path d="M44 6h8" strokeWidth={2.4} />
            <Path d="M46 6v9" strokeWidth={2.4} />
          </G>
        ) : null}

        {variant === "bottle" ? (
          <G stroke={tint} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M42 9h12v18l7 9v43c0 4-3 7-7 7H42c-4 0-7-3-7-7V36l7-9V9Z" strokeWidth={3} />
            <Path d="M40 42h16v25H40V42Z" strokeWidth={2.4} />
            <Path d="M42 25h12" strokeWidth={2.4} />
            <Path d="M45 15h6" strokeWidth={2.2} opacity={0.75} />
          </G>
        ) : null}

        {variant === "citrus" ? (
          <G stroke={tint} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 70C24 39 47 20 76 18C73 49 52 70 21 70Z" strokeWidth={3} />
            <Path d="M30 61 75 19" strokeWidth={2.6} />
            <Path d="M43 47 42 25" strokeWidth={2.1} opacity={0.8} />
            <Path d="M54 38 64 62" strokeWidth={2.1} opacity={0.8} />
            <Path d="M62 29 83 30" strokeWidth={2.1} opacity={0.8} />
          </G>
        ) : null}

        {variant === "highball" ? (
          <G strokeLinecap="round" strokeLinejoin="round">
            <Path
              d="M32 12h32l-4 73H36L32 12Z"
              stroke={colors.paper}
              strokeWidth={2.7}
              opacity={0.9}
            />
            <Path d="M36 52h24l-2 29H38l-2-29Z" fill={fill} opacity={0.72} />
            <Path d="M36 51c8 3 16-3 24 0" stroke={tint} strokeWidth={2.5} />
            <Path d="M45 21 56 77" stroke={tint} strokeWidth={2.2} opacity={0.75} />
            <Path d="M42 36c-7-3-11-9-12-17 9 1 15 5 18 13" stroke={colors.success} strokeWidth={2.1} />
            <Circle cx={53} cy={46} r={8} stroke={colors.tealDark} strokeWidth={2.1} opacity={0.9} />
          </G>
        ) : null}

        {variant === "martini" || variant === "coupe" ? (
          <G strokeLinecap="round" strokeLinejoin="round">
            {variant === "martini" ? (
              <>
                <Path d="M17 18h62L51 52H45L17 18Z" stroke={colors.paper} strokeWidth={2.7} />
                <Path d="M26 25h44L51 48H45L26 25Z" fill={fill} opacity={0.56} />
              </>
            ) : (
              <>
                <Path d="M20 29c4 19 15 25 28 25s24-6 28-25H20Z" stroke={colors.paper} strokeWidth={2.7} />
                <Path d="M27 35c4 10 11 14 21 14s18-4 21-14H27Z" fill={fill} opacity={0.58} />
              </>
            )}
            <Path d="M48 52v25" stroke={tint} strokeWidth={2.6} />
            <Path d="M31 80h34" stroke={tint} strokeWidth={2.6} />
            <Circle cx={65} cy={33} r={5} fill={colors.success} opacity={0.88} />
          </G>
        ) : null}

        {variant === "rocks" ? (
          <G strokeLinecap="round" strokeLinejoin="round">
            <Path
              d="M22 20h52L69 84H27L22 20Z"
              stroke={colors.paper}
              strokeWidth={2.8}
              opacity={0.9}
            />
            <Path d="M28 54h40l-2 25H30l-2-25Z" fill={fill} opacity={0.76} />
            <Path d="M27 53c12 4 27-3 42 0" stroke={tint} strokeWidth={2.7} />
            <Rect
              x={37}
              y={40}
              width={17}
              height={17}
              rx={3}
              stroke={colors.paper}
              strokeWidth={2}
              opacity={0.78}
              transform="rotate(-9 45.5 48.5)"
            />
            <Rect
              x={49}
              y={51}
              width={15}
              height={15}
              rx={3}
              stroke={colors.paper}
              strokeWidth={1.9}
              opacity={0.58}
              transform="rotate(12 56.5 58.5)"
            />
            <Path d="M64 18c8 3 12 9 12 18-8-2-14-8-16-15" stroke={colors.accent} strokeWidth={2.4} />
            <Line x1={67} y1={23} x2={75} y2={35} stroke={colors.accent} strokeWidth={1.7} opacity={0.8} />
          </G>
        ) : null}

        <Ellipse cx={49} cy={88} rx={30} ry={4} fill="#000" opacity={0.22} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
