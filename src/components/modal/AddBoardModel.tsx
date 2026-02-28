import React, {useEffect, useMemo, useRef, useState} from "react";
import BoardBackground from "./BoardBackground";
import {type BackgroundOption, getAddBoardStyle} from "../../static/ts/util";
import {mockColors, mockImages} from "../../static/ts/mockData.ts";
import type {Board} from "../../static/ts/mockData.ts";

interface AddBoardModalProps {
    setShowAddBoardModal: (value: boolean) => void;
    addBoard: (board: Board) => void;
    project: number;
}

const getBackgroundModalPosition = (boardElem: HTMLDivElement | null) => {
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

    // Close when clicking outside
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowAddBoardModal(false);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [setShowAddBoardModal]);

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
        const newBoard: Board = {
            title,
            is_starred: false,
            ...(project !== 0 && {project} as any),
            ...(bg[1] ? {image_url: bg[2]} : {color: bg[0]}),
            id: Date.now(),
        };
        addBoard(newBoard);
        setShowAddBoardModal(false);
    };

    const selectedBg = options[selectedBackground];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
                onClick={() => setShowAddBoardModal(false)}
            >
                <div
                    className="bg-white rounded-xl shadow-2xl w-[360px] overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Preview with title input */}
                    <div
                        className="relative h-28 flex items-end pb-3 px-3"
                        style={getAddBoardStyle(selectedBg[0], selectedBg[1])}
                    >
                        <div className="absolute inset-0 bg-black/20"/>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Board title"
                            className="relative z-10 w-full bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            autoFocus
                        />
                        <button
                            className="absolute top-2 right-2 z-10 text-white/80 hover:text-white transition-colors"
                            onClick={() => setShowAddBoardModal(false)}
                            type="button"
                        >
                            <i className="fal fa-times text-lg"/>
                        </button>
                    </div>

                    {/* Background picker */}
                    <div className="p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Background</p>
                        <div className="flex flex-wrap gap-2" ref={boardElem}>
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedBackground(index)}
                                    className={`w-10 h-7 rounded-md relative overflow-hidden transition-transform hover:scale-105 ${
                                        selectedBackground === index ? "ring-2 ring-blue-500 ring-offset-1" : ""
                                    }`}
                                    style={getAddBoardStyle(option[0], option[1])}
                                    type="button"
                                >
                                    {selectedBackground === index && (
                                        <i className="fal fa-check text-white text-xs absolute inset-0 flex items-center justify-center drop-shadow"/>
                                    )}
                                </button>
                            ))}
                            <button
                                className="w-10 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                                onClick={() => setShowBoardModal(true)}
                                type="button"
                            >
                                <i className="fal fa-ellipsis-h text-sm"/>
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="px-3 pb-3">
                        <button
                            type="submit"
                            disabled={title.trim() === ""}
                            onClick={onSubmit as any}
                            className="w-full py-2 bg-[#0052cc] hover:bg-[#0065ff] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            Create Board
                        </button>
                    </div>
                </div>
            </div>

            {showBoardModal && (
                <BoardBackground
                    setShowBoardModal={setShowBoardModal}
                    extraBackground={extraBackground}
                    setExtraBackground={setExtraBackground}
                    setSelectedBackground={setSelectedBackground}
                    position={getBackgroundModalPosition(boardElem.current)}
                />
            )}
        </>
    );
};

export default AddBoardModal;
