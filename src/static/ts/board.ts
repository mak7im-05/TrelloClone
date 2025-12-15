import type {Board} from "./mockData";

export const filterBoards = (
    boards?: Board[]
): [Board[], any[], Board[]] => {
    const starredBoards: Board[] = [];
    const userBoards: Board[] = [];
    const projectBoards: any[] = [];

    if (!boards) return [userBoards, projectBoards, starredBoards];

    for (const board of boards) {
        if ((board as any).owner?.title) {
            let project = projectBoards.find(
                (p) => p.title === (board as any).owner.title
            );
            if (!project) {
                projectBoards.push({
                    title: (board as any).owner.title,
                    id: (board as any).owner.id,
                    boards: [board],
                });
            } else {
                project.boards.push(board);
            }
        } else {
            userBoards.push(board);
        }

        if (board.is_starred) starredBoards.push(board);
    }

    return [userBoards, projectBoards, starredBoards];
};
