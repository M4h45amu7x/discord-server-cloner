export interface IEmoji {
    name: string
    roles: any[]
    id: string
    require_colons: boolean
    managed: boolean
    animated: boolean
    available: boolean
}

export interface ISticker {
    id: string
    name: string
    tags: string
    type: number
    format_type: number
    description: string
    asset: string
    available: boolean
    guild_id: string
}

export interface ITags {
    bot_id: string
    premium_subscriber?: any
}

export interface IRole {
    id: string
    name: string
    description?: any
    permissions: string
    position: number
    color: number
    hoist: boolean
    managed: boolean
    mentionable: boolean
    icon: string
    unicode_emoji?: any
    flags: number
    tags: ITags
}

export interface IServer {
    id: string
    name: string
    icon: string
    description?: any
    splash: string
    discovery_splash?: any
    features: string[]
    emojis: IEmoji[]
    stickers: ISticker[]
    banner?: any
    owner_id: string
    application_id?: any
    region: string
    afk_channel_id?: any
    afk_timeout: number
    system_channel_id: string
    widget_enabled: boolean
    widget_channel_id?: any
    verification_level: number
    roles: IRole[]
    default_message_notifications: number
    mfa_level: number
    explicit_content_filter: number
    max_presences?: any
    max_members: number
    max_stage_video_channel_users: number
    max_video_channel_users: number
    vanity_url_code?: any
    premium_tier: number
    premium_subscription_count: number
    system_channel_flags: number
    preferred_locale: string
    rules_channel_id: string
    safety_alerts_channel_id?: any
    public_updates_channel_id: string
    hub_type?: any
    premium_progress_bar_enabled: boolean
    nsfw: boolean
    nsfw_level: number
}
