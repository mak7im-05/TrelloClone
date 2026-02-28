import {useParams} from "react-router-dom";
import Board from "./Board";

const BoardPage = () => {
    const {boardId} = useParams<{ boardId: string }>();

    if (!boardId) return null;

    const id = parseInt(boardId);
    return <Board boardId={id}/>;
};

export default BoardPage;
