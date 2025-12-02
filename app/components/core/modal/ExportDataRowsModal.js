'use client';
import { Input, Select, SelectItem } from "@heroui/react";
import { t } from "@/app/i18n";

function ExportDataRowsModal({ project, formData, handleInputChange }) {

    return (
        <form className="space-y-4 p-4">

            {/* Output Directory */}
            <div>
                <label htmlFor="exportFolder" className="block mb-1 font-medium">
                    {t('common.output_directory')}
                </label>
                <Input
                    id="exportFolder"
                    name="exportFolder"
                    value={formData.exportFolder || ""}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="Select folder path..."
                    style={{ direction: 'ltr' }}
                />
            </div>

            {/* Output Format */}
            <div>
                <label htmlFor="exportFormat" className="block mb-1 font-medium">
                    {t('common.output_format')}
                </label>

                <Select
                    id="exportFormat"
                    name="exportFormat"
                    selectedKeys={new Set([formData.exportFormat || "csv"])}
                    onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] || "csv";
                        handleInputChange({ target: { name: "exportFormat", value } });
                    }}
                >
                    <SelectItem key="csv">CSV</SelectItem>
                    <SelectItem key="json">JSON</SelectItem>
                </Select>
            </div>

        </form>
    );
}

export default ExportDataRowsModal;
