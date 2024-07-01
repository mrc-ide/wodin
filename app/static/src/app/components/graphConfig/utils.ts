import * as Color from "color";

export const fadeColor = (color: string) => {
    return Color(color).desaturate(0.6).fade(0.4).rgb().string();
};