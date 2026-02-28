import React from "react";
import {type BackgroundOption, getAddBoardStyle} from "../../static/ts/util";
import {mockColors, mockImages} from "../../static/ts/mockData";

interface Position {
    top: string;
    left: string;
}

interface BoardBackgroundProps {
    position: Position | null;
    setShowBoardModal: (value: boolean) => void;
    extraBackground: BackgroundOption | null;
    setExtraBackground: (value: BackgroundOption | null) => void;
    setSelectedBackground: (value: number) => void;
}

const BoardBackground: React.FC<BoardBackgroundProps> = ({
    position,
    setShowBoardModal,
    extraBackground,
    setExtraBackground,
    setSelectedBackground,
}) => {
    if (!position) return null;

    const handleSelect = (option: BackgroundOption) => {
        setExtraBackground(option);
        setSelectedBackground(0);
    };

    return (
        <div
            className="fixed z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 w-56 p-3"
            style={position}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Board Background</p>
                <button
                    onClick={() => setShowBoardModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="fal fa-times"/>
                </button>
            </div>

            <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Photos</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {mockImages.map((imageOption, i) => {
                        const [bg, isImg] = imageOption;
                        const isSelected = extraBackground?.[0] === bg;
                        return (
                            <button
                                key={i}
                                className={`h-10 rounded-md relative overflow-hidden transition-transform hover:scale-105 ${
                                    isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                                }`}
                                style={getAddBoardStyle(bg, isImg)}
                                onClick={() => handleSelect(imageOption)}
                                type="button"
                            >
                                {isSelected && (
                                    <i className="fal fa-check text-white text-xs absolute inset-0 flex items-center justify-center"/>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</p>
                <div className="grid grid-cols-4 gap-1.5">
                    {mockColors.map((colorOption, i) => {
                        const [bg, isImg] = colorOption;
                        const isSelected = extraBackground?.[0] === bg;
                        return (
                            <button
                                key={i}
                                className={`h-8 rounded-md relative transition-transform hover:scale-105 ${
                                    isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                                }`}
                                style={getAddBoardStyle(bg, isImg)}
                                onClick={() => handleSelect(colorOption)}
                                type="button"
                            >
                                {isSelected && (
                                    <i className="fal fa-check text-white text-xs absolute inset-0 flex items-center justify-center"/>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BoardBackground;
