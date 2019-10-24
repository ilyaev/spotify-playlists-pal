import * as React from 'react'
import { bem } from 'utils/index'
import '../../index.less'

const styles = bem('player')

interface Props {
    img: string
    onClick?: () => void
    width?: number
    green?: boolean
    flip?: boolean
    className?: string
}
export const SvgButton = (props: Props) => {
    return (
        <img
            src={`static/btn_${props.img}.svg`}
            width={props.width || 50}
            height={props.width || 50}
            className={
                styles('button', {
                    flip: props.flip ? true : false,
                    green: props.green || false,
                    noclick: props.onClick ? false : true,
                }) +
                ' ' +
                (props.className || '')
            }
            onClick={props.onClick ? () => props.onClick() : undefined}
        />
    )
}
