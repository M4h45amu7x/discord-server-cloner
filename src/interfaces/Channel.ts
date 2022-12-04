export interface IPermissionOverwrite {
    id: string
    type: number
    allow: string
    deny: string
}

export interface IPermissionOverwrite2 {
    channelId: string
    id: string
    type: number
    allow: string
    deny: string
}

export interface IAvailableTag {
    id: string
    name: string
    emoji_id?: any
    emoji_name?: any
    moderated: boolean
}

export interface IChannel {
    id: string
    type: number
    name: string
    position: number
    flags: number
    parent_id: string
    guild_id: string
    permission_overwrites: IPermissionOverwrite[]
    last_message_id: string
    topic: string
    rate_limit_per_user?: number
    nsfw?: boolean
    last_pin_timestamp?: Date
    bitrate?: number
    user_limit?: number
    rtc_region?: any
    default_thread_rate_limit_per_user?: number
    default_auto_archive_duration?: number
    available_tags: IAvailableTag[]
    template: string
    default_reaction_emoji?: any
    default_sort_order?: any
    default_forum_layout?: number
}
