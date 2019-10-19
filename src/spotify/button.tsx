import * as React from 'react'
import { bem } from '../utils/index'
import './index.less'

const styles = bem('player')

interface Props {
    img: string
    onClick?: () => void
    flip?: boolean
}
export const SvgButton = (props: Props) => {
    return (
        <img
            src={`static/btn_${props.img}.svg`}
            width={50}
            height={50}
            className={styles('button', { flip: props.flip ? true : false })}
            onClick={props.onClick ? () => props.onClick() : undefined}
        />
    )
}
