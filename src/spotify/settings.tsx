import * as React from 'react'
import {
    View,
    TextInput,
    Text,
    SegmentedControl,
    SegmentedControlItem,
    Label,
    Radio,
    Checkbox,
    Button,
    ProgressCircle,
} from 'react-desktop/macOs'
import { SETTINGS_STORAGE_KEY, SETTINGS_DEFAULTS } from '../utils/const'
import { Settings, SpotifyPlaylist, SpotifyMe } from '../utils/types'

interface Props {
    onApply: () => void
    onCancel: () => void
    playlists: SpotifyPlaylist[]
    me: SpotifyMe
}

interface State extends Settings {
    selected: string
    loaded: boolean
}

export class PageSettings extends React.Component<Props, State> {
    state: State = Object.assign({}, SETTINGS_DEFAULTS, {
        selected: 'settings',
        loaded: false,
        me: { id: '-1' },
    })

    componentDidMount() {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || JSON.stringify(SETTINGS_DEFAULTS)) as Settings
        this.setState(Object.assign(settings, { loaded: true }))
    }

    render() {
        return (
            <SegmentedControl box margin={'10px'}>
                {['settings', 'stats', 'about'].map(key => {
                    return (
                        <SegmentedControlItem
                            key={key}
                            title={key[0].toUpperCase() + key.slice(1)}
                            selected={this.state.selected === key}
                            onSelect={() => this.setState({ selected: key })}
                        >
                            {this.renderTab(key)}
                        </SegmentedControlItem>
                    )
                })}
            </SegmentedControl>
        )
    }

    renderSettings() {
        return this.state.loaded ? (
            <View horizontalAlignment="center" direction="column">
                <Label>Order Recent Playlists By</Label>
                <div style={{ paddingLeft: '50px', paddingTop: '5px' }}>
                    {[
                        { label: 'Play Count', value: 'play_count' },
                        { label: 'Last Played', value: 'time_added' },
                        { label: 'Name', value: 'name' },
                    ].map(item => this.renderRadio(item.label, 'order_recent_playlist', item.value))}
                </div>
                <Label marginTop={10}>Order Playlists/Albums</Label>
                <div style={{ paddingLeft: '50px', paddingTop: '5px' }}>
                    {[{ label: 'Name', value: 'name' }, { label: 'Time Added', value: 'time_added' }].map(item =>
                        this.renderRadio(item.label, 'order_playlists', item.value)
                    )}
                </div>
                <Label marginTop={10}>Recent Playlists Maximum items</Label>
                <TextInput
                    marginLeft={50}
                    marginTop={5}
                    width={200}
                    value={this.state.max_size}
                    onChange={e => this.setState({ max_size: e.target.value })}
                />
                <Label marginTop={10}>Playlist to add playing tracks</Label>
                <select
                    style={{ height: '25px', width: '200px', marginLeft: '50px', marginTop: '5px', borderRadius: '0px!important' }}
                    value={this.state.playlist || ''}
                    onChange={event => {
                        this.setState({ playlist: event.target.value || '' })
                    }}
                >
                    {[]
                        .concat([{ owner: { id: this.props.me.id }, name: '-- Not Selected --', uri: '', id: '' }])
                        .concat(this.props.playlists.filter(one => (one.owner.id === this.props.me.id ? true : false)))
                        .map((one, index) => (
                            <option value={one.id} key={'pl' + index} label={one.name} />
                        ))}
                </select>
                <div style={{ paddingTop: '5px' }}>
                    <Checkbox
                        label={'Lunch at login'}
                        defaultChecked={this.state.lunch_at_login}
                        onChange={e => this.setState({ lunch_at_login: e.target.checked || false })}
                    />
                </div>
                <div style={{ display: 'flex', width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                    <Button color={'gray'} marginRight={10} onClick={this.onApply.bind(this)}>
                        Apply
                    </Button>
                    <Button color={'gray'} onClick={() => this.props.onCancel()}>
                        Cancel
                    </Button>
                </div>
            </View>
        ) : (
            <ProgressCircle size={25} />
        )
    }

    onApply() {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.state))
        this.props.onApply()
    }

    onRadioChange(e) {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    renderRadio(label: string, name: keyof State, value: string) {
        return (
            <Radio
                label={label}
                name={name}
                defaultValue={value}
                onChange={this.onRadioChange.bind(this)}
                key={value}
                defaultChecked={this.state[name] === value}
            />
        )
    }

    renderTab(key: string) {
        switch (key) {
            case 'settings':
                return this.renderSettings()
            default:
                return <Text>{key}</Text>
        }
    }
}
