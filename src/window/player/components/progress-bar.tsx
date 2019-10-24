import * as React from 'react'
import { bem, msToString } from 'src/utils'

import '../../index.less'

const styles = bem('progressbar')

interface Props {
    total: number
    startFrom: number
    active: boolean
    onClick: (perc: number) => void
}

interface State {
    position: number
    current: number
}

export class PlayerProgressBar extends React.Component<Props, State> {
    state: State = {
        position: -1,
        current: 0,
    }

    progressId: any

    componentDidMount() {
        this.componentWillReceiveProps(this.props)
    }

    componentWillReceiveProps(newProps: Props) {
        if (!newProps.active && this.progressId) {
            clearInterval(this.progressId)
        }
        if (
            newProps === this.props ||
            newProps.startFrom !== this.props.startFrom ||
            newProps.active !== this.props.active ||
            newProps.total !== this.props.total
        ) {
            this.setState({
                current: newProps.startFrom,
                position: Math.floor((newProps.startFrom / newProps.total) * 100),
            })
            newProps.active && this.forwardProgress()
        }
    }

    forwardProgress() {
        if (this.progressId) {
            clearInterval(this.progressId)
        }
        this.progressId = setInterval(() => {
            const newCurrent = this.state.current + 1000
            const newPosition = Math.floor((newCurrent / this.props.total) * 100)
            this.setState({ current: newCurrent, position: newPosition })
            if (newPosition >= 100) {
                clearInterval(this.progressId)
            }
            // ipcRenderer.send('DEBUG', 'TICK')
        }, 1000)
    }

    render() {
        const perc = Math.min(100, this.state.position)
        return (
            <div>
                <div className={styles()} onClick={this.onBarClick.bind(this)}>
                    <div className={styles('bar')} style={{ width: `${perc}%` }}></div>
                    <div className={styles('bulb')} />
                </div>
                <div className={styles('timer')}>
                    <div className={styles('timer_item')}>{msToString(this.state.current)}</div>
                    <div className={styles('timer_item', { right: true })}>{msToString(this.props.total)}</div>
                </div>
            </div>
        )
    }

    onBarClick(event: any) {
        try {
            let div = event.target
            if (event.target.className !== 'progressbar') {
                div = findAncestor(div, 'progressbar')
            }
            const drect = div.getBoundingClientRect()
            const perc = (event.nativeEvent.offsetX / (drect.right - drect.left)) * 100
            this.props.onClick(perc)
        } catch (e) {
            console.log(e)
        }
    }
}

function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el
}
