// components/LayerAccordionItem.js
import { AccordionItem } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import LayerPreview from '../preview/LayerPreview';

const LayerAccordionItem = ({
    layer,
    editingId,
    editField,
    editText,
    startEditing,
    commitEdit,
    setEditText,
    handleKeyDown,
    handlePropsChange
}) => {
    return (
        <AccordionItem
            aria-label={`Layer ${layer.id}`}
            subtitle={
                editingId === layer.id && editField === 'subtitle' ? (
                    <input
                        type="text"
                        value={editText}
                        autoFocus
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        className="text-sm text-default-500 bg-white px-1 border rounded w-full"
                    />
                ) : (
                    <span
                        onDoubleClick={() => startEditing(layer.id, 'subtitle', layer.subtitle || '')}
                        className="text-sm text-default-500 cursor-pointer"
                        title="Double click to edit"
                    >
                        {layer.subtitle || 'No subtitle'}
                    </span>
                )
            }
            title={
                editingId === layer.id && editField === 'title' ? (
                    <input
                        type="text"
                        value={editText}
                        autoFocus
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        className="font-semibold text-base bg-white px-1 border rounded w-full"
                    />
                ) : (
                    <span
                        onDoubleClick={() => startEditing(layer.id, 'title', layer.title || '')}
                        className="font-semibold cursor-pointer"
                        title="Double click to edit"
                    >
                        {layer.title || 'Untitled'}
                    </span>
                )
            }
            startContent={layer.icon && (
                <MaskedIcon
                    src={layer.icon}
                    color="black"
                    height="25px"
                    width="25px"
                />
            )}
            classNames={{ title: 'font-semibold' }}
        >
            <LayerPreview layer={layer} handlePropsChange={handlePropsChange} />
            {layer.renderPropertiesPanel((newProps) =>
                handlePropsChange(layer.id, newProps)
            )}
        </AccordionItem>
    );
};

export default LayerAccordionItem;
