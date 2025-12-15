import React, { useEffect, useCallback } from "react";

const useBlurSetState = (
    className: string,
    state: boolean,
    setState: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const handleClick = useCallback(
        (e: MouseEvent) => {
            const elem = document.querySelector(className);
            if (!elem) {
                setState(false);
                return;
            }
            if (!elem.contains(e.target as Node)) {
                setState(false);
            }
        },
        [className, setState]
    );

    useEffect(() => {
        if (state) {
            document.addEventListener("click", handleClick);
            return () => {
                document.removeEventListener("click", handleClick);
            };
        }
    }, [state, handleClick]);
};

export default useBlurSetState;
