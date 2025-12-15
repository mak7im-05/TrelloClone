import React from "react";
import {Link} from "react-router-dom";
import {v4 as uuidv4} from "uuid";

interface Project {
    id: string | number;
    title: string;
}

interface HomeSidebarProps {
    projects: Project[];
}

const HomeSidebar: React.FC<HomeSidebarProps> = ({projects}) => {
    return (
        <div className="home-menu">
            <ul>
                <li>
                    <button className="btn btn--transparent btn--small btn--active">
                        <i className="fab fa-trello"></i> Boards
                    </button>
                </li>
                <li>
                    <button className="btn btn--transparent btn--small">
                        <i className="fal fa-ruler-triangle"></i> Templates
                    </button>
                </li>
                <li>
                    <button className="btn btn--transparent btn--small">
                        <i className="fal fa-newspaper"></i> Feed
                    </button>
                </li>
            </ul>

            <ul>
                {projects.map((project) => (
                    <li key={uuidv4()}>
                        <Link to={`/p/${project.id}`} className="btn btn--transparent btn--small">
                            <i className="fal fa-users"></i> {project.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HomeSidebar;
