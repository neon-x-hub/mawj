'use client';

import { useState } from "react";
import { t } from "@/app/i18n";
import { Tabs, Tab } from "@heroui/react";
import ButtonWithPopover from "@/app/components/core/buttons/AddButtonWithPopover";
import LayersTab from "@/app/components/features/templates/edit_page/LayersTab";
import MaskedIcon from "@/app/components/core/icons/Icon";
import AddLayerOptions from "./panel/layer_control/AddLayerOptions";
import ModifiersTab from "./ModifiersTab";
import AddModifierOptions from "./panel/layer_control/AddModifierOptions";

const TemplateMetadata = ({ template }) => {
    if (!template) {
        return <p className="text-gray-500">{t('messages.error.no_template_found')}</p>;
    }

    return (
        <div className="flex flex-col gap-3 text-base text-gray-700 p-2">
            <div>
                <span className="font-semibold">{t('common.name')}:</span> {template.name || t('common.untitled')}
            </div>
            <div>
                <span className="font-semibold">{t('common.type')}:</span> {t(`common.template_types.${template.type}`) || 'N/A'}
            </div>
            <div>
                <span className="font-semibold">{t('common.base_layers')}:</span> {template.baseLayers?.length || 0}
            </div>
            <div>
                <span className="font-semibold">{t('common.layers')}:</span> {template.layers?.length || 0}
            </div>
            {template.baseLayers.length > 0 && (
                <div>
                    <span className="font-semibold">{t('common.dimensions')}:</span> {template.baseLayers[0]?.width} × {template.baseLayers[0]?.height}
                </div>
            )}
            <div>
                <span className="font-semibold">{t('common.created_at')}:</span> {new Date(template.createdAt).toLocaleString()}
            </div>
            <div>
                <span className="font-semibold">{t('common.updated_at')}:</span> {new Date(template.updatedAt).toLocaleString()}
            </div>
            {template.description && (
                <div>
                    <span className="font-semibold">{t('common.description')}:</span> {template.description}
                </div>
            )}
        </div>
    );
};

const EditorSidebarPanel = ({ template }) => {

    const [selectedTab, setSelectedTab] = useState('metadata');

    return (
        <div className="absolute top-1/2 right-[30px] transform -translate-y-1/2 w-[400px] h-[calc(100%-60px)] rounded-xl bg-white/40 shadow-xl backdrop-blur-md">
            <div className='relative w-full h-full overflow-x-hidden scrollbar-hide'>
                <div className="flex w-full flex-col h-full p-3">
                    <Tabs
                        aria-label="Options"
                        color='primary'
                        classNames={{
                            tabList: 'bg-gray-300',
                            tabContent: 'text-black group-data-[selected=true]:text-white font-medium',
                        }}
                        onSelectionChange={setSelectedTab}
                        selectedKey={selectedTab}
                    >
                        <Tab
                            key="metadata"
                            title={
                                <div className="flex items-center gap-1">
                                    <MaskedIcon
                                        src={'/icons/coco/line/Info.svg'}
                                        color="currentColor"
                                        height="18px"
                                        width="18px"
                                    />
                                    {t('common.metadata')}
                                </div>
                            }
                        >
                            {/* ✅ Render Metadata */}
                            <TemplateMetadata template={template} />
                        </Tab>

                        <Tab
                            key="layers"
                            title={
                                <div className="flex items-center px-0 justify-between gap-1">
                                    <MaskedIcon
                                        src={'/icons/coco/line/Note.svg'}
                                        color="currentColor"
                                        height="18px"
                                        width="18px"
                                    />
                                    {t('common.layers')}
                                </div>
                            }
                        >
                            <LayersTab />
                        </Tab>
                        <Tab
                            key="modifiers"
                            title={
                                <div className="flex items-center px-0 justify-between gap-1">
                                    <MaskedIcon
                                        src={'/icons/coco/line/Modifiers.svg'}
                                        color="currentColor"
                                        height="18px"
                                        width="18px"
                                    />
                                    {t('common.modifiers')}
                                </div>
                            }
                        >
                            <ModifiersTab />
                        </Tab>
                    </Tabs>
                </div>
            </div>

            {selectedTab !== 'metadata' && (
                <ButtonWithPopover
                    PopoverOptions={() => {
                        switch (selectedTab) {
                            case 'layers':
                                return <AddLayerOptions />;
                            case 'modifiers':
                                return <AddModifierOptions />;
                            default:
                                return "No options available";
                        }
                    }}
                />
            )}

        </div>
    )
};

export default EditorSidebarPanel;
