import React, { useState } from 'react';

import ActionsDropdown from '../menu/OptionMenu';
import { Card, Chip } from '@heroui/react';
export default function GenericCard({ title, description, previews = [], tags = [], options = { actions: [], danger: [] } }) {

    return (
        <Card
            className="bg-white r30 h-[200px] relative p-4 flex flex-col justify-between w-full max-w-md overflow-hidden shadow-md cursor-pointer"
            isHoverable
        >
            {/* Preview Images */}
            <div className="flex">
                {Array.from({ length: 2 }).map((_, i) => <RenderPreview key={i} src={previews[i]} index={i} />)}
            </div>

            {/* Card Content */}
            <div className=" absolute bottom-0 pr-5 pl-2 py-3 bg-white shadow-lg left-0 w-full flex justify-between items-center gap-4 z-10">


                {/* Text Content */}
                <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">{title}</div>
                    <div className="text-sm text-gray-500">{description}</div>
                    {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    className="bg-gray-200 text-gray-600 text-xs"
                                    size='sm'
                                >
                                    {tag}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>

                {/* Options Menu */}
                <div className="flex-shrink-0">
                    <ActionsDropdown
                        actions={options.actions}
                        danger={options.danger}
                        icon="/icons/feather/line/more-vertical.svg"
                        color="#000"
                        iconSize={15}
                        IconClassName="cursor-pointer w-6 h-6"
                    />

                </div>
            </div>
        </Card>
    );
}


const RenderPreview = ({ src, index }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="w-1/2 px-1">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
                {!isLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-xl z-0" />
                )}
                {src ? (
                    <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className={`object-cover rounded-xl w-full h-full transition-opacity duration-300 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsLoaded(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 rounded-xl" />
                )}
            </div>
        </div>
    );
};
