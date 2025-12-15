import humanizeDuration from "humanize-duration";

const options: humanizeDuration.Options = {
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
    const timeInMillis = Date.now() - new Date(createdAt).getTime();
    return humanizeDuration(timeInMillis, options);
};

export const modalBlurHandler =
    (setShowModal: (value: boolean) => void) =>
        () => {
            const blur = document.querySelector<HTMLDivElement>(".out-of-focus");
            if (!blur) return;

            const onClick = () => setShowModal(false);

            blur.style.display = "block";
            blur.addEventListener("click", onClick);

            return () => {
                blur.style.display = "none";
                blur.removeEventListener("click", onClick);
            };
        };

const getImageBrightness = (
    imageSrc: string,
    callback: (brightness: number) => void
): void => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.style.display = "none";

    document.body.appendChild(img);

    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let colorSum = 0;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            colorSum += avg;
        }

        const brightness = Math.floor(
            colorSum / (img.width * img.height)
        );

        callback(brightness);
        document.body.removeChild(img);
    };
};

const getColorBrightness = (hex: string): number => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 255;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return Math.round((r * 299 + g * 587 + b * 114) / 1000);
};

export interface Board {
    color?: string;
    image?: string;
    image_url?: string;
}

export const handleBackgroundBrightness =
    (
        board: Board,
        setIsBackgroundDark: (value: boolean) => void
    ) =>
        () => {
            if (!board) return;

            if (board.color) {
                setIsBackgroundDark(getColorBrightness(`#${board.color}`) <= 125);
            } else {
                const image = board.image || board.image_url;
                if (!image) return;

                getImageBrightness(image, (brightness) => {
                    setIsBackgroundDark(brightness <= 125);
                });
            }
        };

interface UnsplashPhoto {
    urls: {
        small: string;
        full: string;
    };
}

export type BackgroundOption =
    | [string, false]
    | [string, true, string];

const shuffleArray = <T>(array: T[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

export const convertUnsplashToOptions = (
    unsplashData?: UnsplashPhoto[]
): BackgroundOption[] => {
    if (!unsplashData) return [];
    return unsplashData.map(
        (entry): BackgroundOption => [
            entry.urls.small,
            true,
            entry.urls.full,
        ]
    );
};

export const getBoardBackgroundOptions = (
    unsplashData?: UnsplashPhoto[]
): BackgroundOption[] => {
    const res: BackgroundOption[] = [
        ["#4680FF", false],
        ["red", false],
        ["#FFB64D", false],
    ];

    res.push(...convertUnsplashToOptions(unsplashData));
    shuffleArray(res);

    return res.slice(0, Math.max(0, res.length - 5));
};

export const getAddBoardStyle = (
    bg: string,
    img: boolean = true
): React.CSSProperties =>
    img
        ? {
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
        }
        : {backgroundColor: bg};
