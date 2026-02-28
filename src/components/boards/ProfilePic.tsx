import React from "react";

interface User {
    full_name: string;
    profile_pic?: string;
}

interface ProfilePicProps {
    user: User | null;
    large?: boolean;
}

const hashName = (str: string): number => {
    let res = 0;
    for (let i = 0; i < str.length; i++) {
        res += str.charCodeAt(i);
    }
    return res + 1;
};

const BG_COLORS = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
];

const getNameColor = (name: string): string =>
    BG_COLORS[hashName(name) % BG_COLORS.length];

const ProfilePic: React.FC<ProfilePicProps> = ({user, large = false}) => {
    const sizeClass = large
        ? "w-8 h-8 text-sm"
        : "w-7 h-7 text-xs";

    const base = `${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none`;

    if (!user) {
        return <div className={`${base} bg-blue-500`}>U</div>;
    }

    if (user.profile_pic) {
        return (
            <div className={`${base} overflow-hidden`}>
                <img
                    src={user.profile_pic}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className={`${base} ${getNameColor(user.full_name)}`}>
            {user.full_name.charAt(0).toUpperCase()}
        </div>
    );
};

export default ProfilePic;
