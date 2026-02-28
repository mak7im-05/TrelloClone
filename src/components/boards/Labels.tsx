import React from "react";

interface Label {
    id: number;
    color: string;
    title?: string;
}

interface LabelsProps {
    labels: Label[];
}

const Labels: React.FC<LabelsProps> = ({labels}) => {
    if (labels.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mb-2">
            {labels.map((label) => (
                <span
                    key={label.id}
                    className="h-2 w-8 rounded-full inline-block"
                    style={{backgroundColor: `#${label.color}`}}
                    title={label.title}
                />
            ))}
        </div>
    );
};

export default Labels;
