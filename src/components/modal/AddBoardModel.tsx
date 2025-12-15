import React, {useEffect, useMemo, useRef, useState} from "react";
import {v4 as uuidv4} from "uuid";
import BoardBackground from "./BoardBackground";
import {type BackgroundOption, getAddBoardStyle} from "../../static/ts/util";
import {mockColors, mockImages} from "../../static/ts/mockData.ts";


interface Position {
    top: string;
    left: string;
}

interface AddBoardModalProps {
    setShowAddBoardModal: (value: boolean) => void;
    addBoard: (board: any) => void;
    project: number;
}

const getBackgroundModalPosition = (boardElem: HTMLDivElement | null): Position | null => {
    if (!boardElem) return null;
    const rect = boardElem.getBoundingClientRect();
    return {
        top: rect.y + "px",
        left: rect.x + rect.width - 200 + "px",
    };
};

const AddBoardModal: React.FC<AddBoardModalProps> = ({setShowAddBoardModal, addBoard, project}) => {
    const [selectedBackground, setSelectedBackground] = useState<number>(0);
    const [extraBackground, setExtraBackground] = useState<BackgroundOption | null>(null);
    const [title, setTitle] = useState<string>("");
    const [showBoardModal, setShowBoardModal] = useState<boolean>(false);
    const boardElem = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const blur = document.querySelector(".out-of-focus") as HTMLDivElement;
        if (!blur) return;
        blur.style.display = "block";
        const clickHandler = () => setShowAddBoardModal(false);
        blur.addEventListener("click", clickHandler);
        return () => {
            blur.style.display = "none";
            blur.removeEventListener("click", clickHandler);
        };
    }, []);

    const options: BackgroundOption[] = useMemo(() => {
        const baseOptions = [...mockColors, ...mockImages];
        if (extraBackground) baseOptions[0] = extraBackground;
        return baseOptions;
    }, [extraBackground]);

    useEffect(() => {
        if (selectedBackground !== 0) setExtraBackground(null);
    }, [selectedBackground]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bg = options[selectedBackground];
        const newBoard = {
            title,
            project: project !== 0 ? project : undefined,
            color: bg[1] ? undefined : bg[0].substring(1),
            image_url: bg[1] ? bg[2] : undefined,
            id: Date.now(),
        };
        addBoard(newBoard);
        setShowAddBoardModal(false);
    };

    return (
        <>
            {showBoardModal && (
                <BoardBackground
                    setShowBoardModal={setShowBoardModal}
                    extraBackground={extraBackground}
                    setExtraBackground={setExtraBackground}
                    setSelectedBackground={setSelectedBackground}
                    position={getBackgroundModalPosition(boardElem.current)}
                />
            )}

            <div className="addboard-modal">
                <form className="addboard-modal__left" onSubmit={onSubmit}>
                    <div className="addboard-modal__title-block"
                         style={getAddBoardStyle(options[selectedBackground][0], options[selectedBackground][1])}>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="addboard-modal__title"
                            placeholder="Add board title"
                        />
                        <button className="addboard-modal__exit" onClick={() => setShowAddBoardModal(false)}
                                type="button">
                            <i className="fal fa-times"></i>
                        </button>
                    </div>

                    <button
                        className={`addboard-modal__create btn ${title.trim() === "" ? "btn--disabled" : ""}`}
                        type={title.trim() === "" ? "button" : "submit"}
                        disabled={title.trim() === ""}
                    >
                        Create Board
                    </button>
                </form>

                <div className="addboard-modal__right" ref={boardElem}>
                    {options.map((option, index) => (
                        <button
                            onClick={() => setSelectedBackground(index)}
                            className={`addboard-modal__color-box${option[1] ? " color-box--img" : ""}`}
                            style={getAddBoardStyle(option[0], option[1])}
                            key={uuidv4()}
                        >
                            {selectedBackground === index && <i className="fal fa-check"></i>}
                        </button>
                    ))}

                    <button className="addboard-modal__color-box" onClick={() => setShowBoardModal(true)}>
                        <i className="fal fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddBoardModal;
