// Design Tokens
import { colors } from "@/app/styles/designTokens"
// Components
import MaskedIcon from "../core/icons/Icon"


export default function SectionHeadTitle({ iconUrl, title }) {
    return (
        <div className="flex items-center gap-2 my-2">
            <MaskedIcon
                src={iconUrl}
                color={colors.primary}
                className="flex-shrink-0 mx-2"
                height="40px"
                width="40px"
            />
            <h2 className="text-[40px] font-semibold">{title}</h2>
        </div>
    )
}
