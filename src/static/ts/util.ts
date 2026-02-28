import humanizeDuration from "humanize-duration";
import type {CSSProperties} from "react";

const humanizeOptions: humanizeDuration.Options = {
    largest: 1,
    round: true,
    spacer: "",
    language: "shortEn",
    languages: {
        shortEn: {
            y: () => "y",
            mo: () => "mo",
            w: () => "w",
            d: () => "d",
            h: () => "h",
            m: () => "m",
            s: () => "s",
            ms: () => "ms",
        },
    },
} as any;

export const timeSince = (createdAt: string | Date): string => {
    const ms = Date.now() - new Date(createdAt).getTime();
    return humanizeDuration(ms, humanizeOptions);
};

// ─── Board background helpers ────────────────────────────────────────────────

export type BackgroundOption =
    | [string, false]
    | [string, true, string];

export const getAddBoardStyle = (
    bg: string,
    img: boolean = true
): CSSProperties =>
    img
        ? {
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
        }
        : {backgroundColor: bg};

// ─── Header brightness detection ────────────────────────────────────────────

interface BoardLike {
    color?: string;
    image_url?: string;
}

const getColorBrightness = (hex: string): number => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 255;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return Math.round((r * 299 + g * 587 + b * 114) / 1000);
};

const getImageBrightness = (src: string, callback: (b: number) => void): void => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = src;
    img.style.display = "none";
    document.body.appendChild(img);
    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        callback(Math.floor(sum / (img.width * img.height)));
        document.body.removeChild(img);
    };
};

export const handleBackgroundBrightness =
    (board: BoardLike | null, setDark: (v: boolean) => void) =>
    () => {
        if (!board) return;
        if (board.color) {
            setDark(getColorBrightness(board.color) <= 125);
        } else if (board.image_url) {
            getImageBrightness(board.image_url, (b) => setDark(b <= 125));
        }
    };
