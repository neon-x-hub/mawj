'use client';

import React, { useState } from 'react';
import { t, getLang } from '@/app/i18n';
import { Card, CardHeader, CardFooter } from '@heroui/react';
import { Button } from '@heroui/react';
import MaskedIcon from '../icons/Icon';
import ChooseTemplateModal from '../modal/ChooseTemplateModal';
import { useProjects } from '../../context/projects/projectsContext';
import ButtonWithPopover from '../buttons/AddButtonWithPopover';
import ProjectTemplateOptions from '../menu/ProjectTemplateDirectOptions';
export default function HoverCard({
    imageSrc,
    title,
    subtitle,
    footerTitle,
    onEditClick,
    OptionsDropdown,
    project
}) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { updateProject } = useProjects();

    const handleChooseTemplate = async (template) => {
        console.log('✅ Template chosen:', template);
        try {
            await updateProject(project.id, { template: template.id });
            console.log('✅ Project updated successfully');
            window.location.reload();
        } catch (err) {
            console.error('❌ Failed to update project:', err);
            alert(t('errors.update_project_failed') || 'Failed to update project');
        }
    };


    return (
        <>
            <Card
                isFooterBlurred
                className="group relative w-full h-full col-span-12 sm:col-span-7 overflow-hidden r30"
            >
                {/* Show image only if it exists */}
                {imageSrc ? (
                    <>
                        <img
                            alt="Card background"
                            className="z-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                            src={imageSrc}
                        />
                        <img
                            alt="Card background"
                            className="absolute z-1 w-full h-full object-cover group-hover:scale-110 transition-transform duration-600 blur-lg opacity-0 group-hover:opacity-100"
                            src={imageSrc}
                        />
                    </>
                ) : (
                    // ✅ Fallback background when no image is provided
                    // When click a modal appears to choose a template from
                    <div
                        className="z-0 cursor-pointer w-full h-full flex flex-col items-center justify-center bg-gray-100"
                        onClick={() => setIsModalOpen(true)} // ✅ Open modal on click
                    >
                        <MaskedIcon
                            src="/Icons/haicon/line/paint-brush.svg"
                            color="#555"
                            height={55}
                            width={55}
                            className="mb-2"
                        />
                        <p className="text-gray-700 text-base font-medium">
                            {t('actions.add_template_to_start_your_project') || 'Add a template to start your project'}
                        </p>
                    </div>

                )}

                {/* Card Header (still shows title/subtitle if provided) */}
                <CardHeader className="absolute z-10 top-0 right-1 flex-col items-start mix-blend-exclusion">
                    {title && <h4 className="text-white/90 font-medium mb-1 text-xl">{title}</h4>}
                    {subtitle && <p className="text-tiny text-white/60 uppercase font-normal">{subtitle}</p>}
                </CardHeader>

                {/* Card Footer */}
                <CardFooter
                    className="absolute bottom-0 z-10 w-full backdrop-blur-md bg-white/80
                transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-full rounded-b-[30px]"
                >
                    <div className="flex items-center justify-between w-full">
                        {/* Left Section: Footer Title (only if not a template card) */}
                        {footerTitle}

                        {/* Right Section: Buttons */}
                        <div className="flex items-center gap-2 px-1">
                            {imageSrc && <Button
                                size="sm"
                                radius="full"
                                className="text-gray-800 font-medium text-[13px] bg-black/10 hover:bg-black/20"
                                onPress={onEditClick}
                                startContent={
                                    getLang() === 'ar' && (
                                        <MaskedIcon
                                            src="/Icons/coco/line/Edit-3.svg"
                                            color="#333"
                                            className="flex-shrink-0"
                                            height={17}
                                            width={17}
                                        />
                                    )
                                }
                                endContent={
                                    getLang() !== 'ar' && (
                                        <MaskedIcon
                                            src="/Icons/coco/line/Edit-3.svg"
                                            color="#333"
                                            className="flex-shrink-0"
                                            height={17}
                                            width={17}
                                        />
                                    )
                                }
                            >
                                {t('actions.edit')}
                            </Button>}

                            {imageSrc && OptionsDropdown && (
                                <ButtonWithPopover
                                    isOptions
                                    iconUrl="/icons/feather/line/more-vertical.svg"
                                    PopoverOptions={<ProjectTemplateOptions project={project} />}
                                />
                            )}
                        </div>
                    </div>
                </CardFooter>
            </Card>
            {/* ✅ Modal Integration */}
            <ChooseTemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onChoose={handleChooseTemplate}
                templateType={project.type}
            />

        </>
    );
}
