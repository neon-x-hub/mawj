'use client';
import { t } from "@/app/i18n";
import { Tabs, Tab } from "@heroui/react";
// Controls
import SizeControls from "./SizeControls";
import PositionControls from "./PositionControls";
import RotationSlider from "./RotationSlider";
import SkewControls from "./SkewControls";
import PanelSectionTitle from "../SectionTitle";

export default function TransformSection({ value, update }) {
    return (
        <section className="flex flex-col gap-4">
            <PanelSectionTitle
                title={t("layers.text.transformations")}
                iconSrc={"/icons/haicon/line/arrows-pointing-in-dual.svg"}
                iconOptions={{
                    height: "20px",
                    width: "20px",
                }}
            />

            <Tabs aria-label="transform-tabs" variant="underlined" defaultSelectedKey="position">

                <Tab key="position" title={t("layers.text.position")}>
                    <PositionControls value={value} update={update} />
                </Tab>

                <Tab key="size" title={t("layers.text.size")}>
                    <SizeControls value={value} update={update} />
                </Tab>

                <Tab key="rotation" title={t("layers.text.rotation")}>
                    <RotationSlider value={value.rotation} update={update} />
                </Tab>

                <Tab key="skew" title={t("layers.text.skew")}>
                    <SkewControls value={value} update={update} />
                </Tab>
            </Tabs>
        </section>
    );
}
