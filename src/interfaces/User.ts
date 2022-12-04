export interface IUser {
    id: string
    username: string
    avatar: string
    avatar_decoration?: any
    discriminator: string
    public_flags: number
    flags: number
    purchased_flags: number
    banner?: any
    banner_color: string
    accent_color: number
    bio: string
    locale: string
    nsfw_allowed: boolean
    mfa_enabled: boolean
    premium_type: number
    email: string
    verified: boolean
    phone: string
}
