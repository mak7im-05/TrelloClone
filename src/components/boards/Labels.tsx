import React from "react";
import {v4 as uuidv4} from "uuid";

interface Label {
    color: string;
    title?: string;
}

interface LabelsProps {
    labels: Label[];
}

const Labels: React.FC<LabelsProps> = ({labels}) => {
    if (labels.length === 0) return null;

    return (
        <div className="labels">
            {labels.map((label) => (
                <p
                    className="labels__label"
                    key={uuidv4()}
                    style={{color: `#${label.color}`}}
                >
                    ___
                </p>
            ))}
        </div>
    );
};

export default Labels;
