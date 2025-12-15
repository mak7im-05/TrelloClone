import React from "react";
import {v4 as uuidv4} from "uuid";
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

    return (
        <div style={position} className="label-modal--bg label-modal">
            <div className="label-modal__header">
                <p>Board Background</p>
                <button onClick={() => setShowBoardModal(false)}>
                    <i className="fal fa-times"></i>
                </button>
            </div>

            <div>
                <p className="label-modal__labels-head">Photos</p>
                <ul className="label-modal__create-block">
                    {mockImages.map((imageOption) => {
                        const [bg, isImg] = imageOption;
                        return (
                            <li
                                key={uuidv4()}
                                className={`label-modal__create-label ${
                                    extraBackground?.[0] === bg
                                        ? "label-modal__create-label--selected"
                                        : ""
                                }`}
                            >
                                <button
                                    style={getAddBoardStyle(bg, isImg)}
                                    onClick={() => {
                                        setExtraBackground(imageOption);
                                        setSelectedBackground(0);
                                    }}
                                >
                                    {extraBackground?.[0] === bg && <i className="fal fa-check"></i>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div>
                <p className="label-modal__labels-head">Colors</p>
                <ul className="label-modal__create-block">
                    {mockColors.map((colorOption) => {
                        const [bg, isImg] = colorOption;
                        return (
                            <li
                                key={uuidv4()}
                                className={`label-modal__create-label ${
                                    extraBackground?.[0] === bg
                                        ? "label-modal__create-label--selected"
                                        : ""
                                }`}
                            >
                                <button
                                    style={getAddBoardStyle(bg, isImg)}
                                    onClick={() => {
                                        setExtraBackground(colorOption);
                                        setSelectedBackground(0);
                                    }}
                                >
                                    {extraBackground?.[0] === bg && <i className="fal fa-check"></i>}
                                </button>
                            </li>
                        );
                    })}
                    <li className="label-modal__create-label" style={{display: "none"}}>
                        <button/>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default BoardBackground;
