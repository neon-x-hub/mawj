// I18N
import { t, getLang } from '@/app/i18n'
// Design Tokens
import { colors } from '@/app/styles/designTokens'
// Components
import { Button } from "@heroui/react"
import MaskedIcon from "../icons/Icon"

export default function ActionButton({ label, onClick, endIconUrl, isPrimary = false, endIconSize = '25px' }) {
    return (
        <Button
            className="r30 h-[35px] px-8 font-normal min-w-18"
            variant={isPrimary ? 'solid' : 'bordered'}
            color="primary"
            style={{
                color: isPrimary ? '#fff' : colors.primary,
            }}
            startContent={
                getLang() === 'ar' && endIconUrl && (
                    <MaskedIcon
                        src={endIconUrl}
                        color={isPrimary ? '#fff' : colors.primary}
                        className={` flex-shrink-0`}
                        height={endIconSize}
                        width={endIconSize}
                    />
                )
            }
            endContent={
                getLang() !== 'ar' && endIconUrl && (
                    <MaskedIcon
                        src={endIconUrl}
                        color={isPrimary ? '#fff' : colors.primary}
                        className="flex-shrink-0"
                        height={endIconSize}
                        width={endIconSize}
                    />
                )
            }
            onPress={() => onClick()}
        >
            <span className='translate-y-[-2px] text-[20px]'>
                {label}
            </span>
        </Button>
    )
}
