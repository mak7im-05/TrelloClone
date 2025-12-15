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

const colors = ["red", "yellow", "blue"];

const getNameColor = (name: string): string => {
    return colors[hashName(name) % colors.length];
};

const ProfilePic: React.FC<ProfilePicProps> = ({ user, large = false }) => {
    if (!user) {
        return (
            <div className={`member member--blue${large ? " member--large" : ""}`}>
                U
            </div>
        );
    }

    return user.profile_pic ? (
        <div className={`member member--image${large ? " member--large" : ""}`}>
            <img src={user.profile_pic} alt={user.full_name} />
        </div>
    ) : (
        <div
            className={`member member--${getNameColor(user.full_name)}${
                large ? " member--large" : ""
            }`}
        >
            {user.full_name.substring(0, 1)}
        </div>
    );
};

export default ProfilePic;
