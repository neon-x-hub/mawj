
import { t } from "@/app/i18n";
import { Tabs, Tab } from "@heroui/react";
import ButtonWithPopover from "@/app/components/core/buttons/AddButtonWithPopover";
import LayersTab from "@/app/components/features/templates/edit_page/LayersTab";
import MaskedIcon from "@/app/components/core/icons/Icon";
import { DEFAULT_CONTENT_x2 } from "@/app/components/shared/constants/placeholders";
import AddLayerOptions from "./panel/layer_control/AddLayerOptions";


const EditorSidebarPanel = ({ layers }) => (
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
                >
                    <Tab key="metadata" title={
                        <div className="flex items-center gap-1">
                            <MaskedIcon
                                src={'/icons/coco/line/Info.svg'}
                                color="currentColor"
                                height="18px"
                                width="18px"
                            />
                            {t('common.metadata')}
                        </div>
                    }>
                        {DEFAULT_CONTENT_x2}
                    </Tab>
                    <Tab key="layers" title={
                        <div className="flex items-center px-0 justify-between gap-1">
                            <MaskedIcon
                                src={'/icons/coco/line/Note.svg'}
                                color="currentColor"
                                height="18px"
                                width="18px"
                            />
                            {t('common.layers')}
                        </div>
                    }>
                        <LayersTab templateLayers={layers} />
                    </Tab>
                </Tabs>
            </div>
        </div>
        <ButtonWithPopover
            onAction={() => { console.log('Add Clicked!') }}
            PopoverOptions={
                <AddLayerOptions />
            } />
    </div>
);

export default EditorSidebarPanel;
