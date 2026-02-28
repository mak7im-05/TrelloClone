import React from "react";
import {Link} from "react-router-dom";

interface Project {
    id: string | number;
    title: string;
}

interface HomeSidebarProps {
    projects: Project[];
}

const NavItem: React.FC<{children: React.ReactNode; active?: boolean}> = ({children, active}) => (
    <li>
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
            ${active
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
        >
            {children}
        </div>
    </li>
);

const HomeSidebar: React.FC<HomeSidebarProps> = ({projects}) => {
    return (
        <aside className="w-64 shrink-0 hidden md:block">
            <nav className="sticky top-20">
                <ul className="space-y-1">
                    <NavItem active>
                        <i className="fab fa-trello w-4 text-center"/>
                        Boards
                    </NavItem>
                    <NavItem>
                        <i className="fal fa-ruler-triangle w-4 text-center"/>
                        Templates
                    </NavItem>
                    <NavItem>
                        <i className="fal fa-newspaper w-4 text-center"/>
                        Feed
                    </NavItem>
                </ul>

                {projects.length > 0 && (
                    <div className="mt-6">
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Workspaces
                        </p>
                        <ul className="space-y-1">
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <Link
                                        to={`/p/${project.id}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <i className="fal fa-users w-4 text-center"/>
                                        {project.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>
        </aside>
    );
};

export default HomeSidebar;
