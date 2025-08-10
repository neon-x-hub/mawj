import React, { useState } from 'react';
import { t } from '@/app/i18n';
import { Card, Chip } from '@heroui/react';
import ButtonWithPopover from '../buttons/AddButtonWithPopover';

export default function GenericCard({
    id,
    title = { value: '', onEdit: () => { } },
    description = { value: '', onEdit: () => { } },
    previews = [],
    tags = [],
    optionsContent,
    onPress,
}) {
    const hasPreviews = previews.length > 0;

    // 🔹 Local state for inline editing
    const [editingField, setEditingField] = useState(null); // "title" | "description" | null
    const [editText, setEditText] = useState('');

    const startEditing = (field, initialValue) => {
        setEditingField(field);
        setEditText(initialValue);
    };

    const commitEdit = async () => {
        if (editingField === 'title') await title.onEdit(editText);
        if (editingField === 'description') await description.onEdit(editText);
        setEditingField(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.stopPropagation()
            commitEdit()
        };
        if (e.key === 'Space' || e.code === 'Space') {
            e.preventDefault();
            e.stopPropagation();
            setEditText(editText + ' ');
        }
        if (e.key === 'Escape') setEditingField(null);
    };

    return (
        <Card
            className="bg-white r30 h-[200px] relative p-4 flex flex-col justify-between w-full max-w-md overflow-hidden shadow-md cursor-pointer"
            isPressable
            onPress={() => onPress()}
        >
            {/* ✅ Preview Section */}
            <div className="flex">
                {hasPreviews ? (
                    previews.length === 1 ? (
                        // Single preview, full width, no extra placeholders
                        <div className="w-full px-1">
                            <RenderPreview src={previews[0]} index={0} fullWidth />
                        </div>
                    ) : (
                        // Two previews side by side
                        previews.slice(0, 2).map((src, i) => (
                            <RenderPreview key={i} src={src} index={i} />
                        ))
                    )
                ) : (
                    // No previews, show two placeholders
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="w-1/2 px-1">
                            <div className="w-full h-[180px] bg-gray-200 rounded-xl" />
                        </div>
                    ))
                )}
            </div>

            {/* ✅ Card Content */}
            <div className="absolute bottom-0 pr-5 pl-2 py-3 bg-white/50 backdrop-blur-md shadow-lg left-0 w-full flex justify-between items-center gap-4 z-10">
                <div className="text-right">
                    {/* 🔹 Editable Title */}
                    <div
                        className="font-bold text-lg text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {editingField === 'title' ? (
                            <input
                                type="text"
                                value={editText}
                                autoFocus
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                className="font-semibold text-lg bg-white px-1 border rounded w-full"
                            />
                        ) : (
                            <span
                                onDoubleClick={() => startEditing('title', title.value)}
                                className="cursor-pointer"
                                title="Double click to edit"
                            >
                                {title.value || 'Untitled'}
                            </span>
                        )}
                    </div>

                    {/* 🔹 Editable Description */}
                    <div
                        className="text-sm text-gray-500"
                        onClick={(e) => e.stopPropagation()}  // ✅ prevent card click
                    >
                        {editingField === 'description' ? (
                            <input
                                type="text"
                                value={editText}
                                autoFocus
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                className="text-sm bg-white px-1 border rounded w-full"
                            />
                        ) : (
                            <span
                                onDoubleClick={() => startEditing('description', description.value)}
                                className="cursor-pointer"
                                title="Double click to edit"
                            >
                                {description.value || t('common.no_description')}
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {tags.map((tag, index) => (
                                <Chip key={index} className="bg-gray-200 text-gray-600 text-xs" size="sm">
                                    {tag}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>

                {/* ✅ Options Menu via ButtonWithPopover */}
                <div className="flex-shrink-0">
                    <ButtonWithPopover
                        isOptions
                        iconUrl="/icons/feather/line/more-vertical.svg"
                        PopoverOptions={optionsContent}
                    />
                </div>
            </div>
        </Card>
    );
}

const RenderPreview = ({ src, index, fullWidth = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    if (!src) {
        return (
            <div className={fullWidth ? "w-full px-1" : "w-1/2 px-1"}>
                <div className="w-full h-[180px] bg-gray-300 rounded-xl" />
            </div>
        );
    }

    return (
        <div className={fullWidth ? "w-full px-1" : "w-1/2 px-1"}>
            <div className="relative w-full h-full rounded-xl overflow-hidden">
                {!isLoaded && (
                    <div className="w-full h-full inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-xl z-0" />
                )}
                <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className={`object-cover rounded-xl w-full h-full transition-opacity duration-300 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                />
            </div>
        </div>
    );
};
