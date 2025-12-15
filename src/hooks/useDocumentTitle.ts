import {useEffect, useRef} from "react";

const useDocumentTitle = (title: string, retainOnUnmount: boolean = false): void => {
    const defaultTitle = useRef(document.title).current;

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        return () => {
            if (!retainOnUnmount) {
                document.title = defaultTitle;
            }
        };
    }, [retainOnUnmount, defaultTitle]);
};

export default useDocumentTitle;
