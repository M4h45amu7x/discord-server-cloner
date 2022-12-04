import axios from 'axios'

import type { IChannel, IPermissionOverwrite } from '../interfaces/Channel'
import type { IServer } from '../interfaces/Server'
import type { IUser } from '../interfaces/User'
import { getByteArrayFromImageURL } from './string'

export const login = async (token: string): Promise<IUser> => {
    return await new Promise(async (resolve, reject) => {
        await axios('https://discord.com/api/v9/users/@me', {
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}

export const getServerData = async (token: string, serverId: string): Promise<IServer> => {
    return await new Promise(async (resolve, reject) => {
        await axios(`https://discord.com/api/v9/guilds/${serverId}`, {
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}

export const getChannelData = async (token: string, serverId: string): Promise<IChannel[]> => {
    return await new Promise(async (resolve, reject) => {
        await axios(`https://discord.com/api/v9/guilds/${serverId}/channels`, {
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}

export const createServer = async (
    token: string,
    serverData: IServer,
    cloneRoles: boolean,
    cloneIcon: boolean,
): Promise<IServer> => {
    const clonedName = `[Cloned] - ${serverData.name} | M4h45amu7x`

    return await new Promise(async (resolve, reject) => {
        await axios('https://discord.com/api/v9/guilds', {
            method: 'POST',
            data: {
                name: clonedName.length <= 100 ? clonedName : serverData.name,
                region: serverData.region,
                icon:
                    cloneIcon &&
                    `data:image/png;base64,${await getByteArrayFromImageURL(
                        `https://cdn.discordapp.com/icons/${serverData.id}/${serverData.icon}?size=4096&quality=lossless`,
                    )}`,
                verification_level: serverData.verification_level,
                default_message_notifications: serverData.default_message_notifications,
                explicit_content_filter: serverData.explicit_content_filter,
                roles: cloneRoles ? serverData.roles.sort((a, b) => a.position - b.position) : [],
                afk_timeout: serverData.afk_timeout,
                system_channel_flags: serverData.system_channel_flags,
            },
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}

export const createChannel = async (
    token: string,
    serverId: string,
    channelData: IChannel,
    permissionOverwrites: IPermissionOverwrite[],
    parentId: string | null = null,
): Promise<IChannel> => {
    return await new Promise(async (resolve, reject) => {
        await axios(`https://discord.com/api/v9/guilds/${serverId}/channels`, {
            method: 'POST',
            data: {
                name: channelData.name,
                type: channelData.type,
                topic: channelData.topic,
                bitrate: channelData.bitrate,
                user_limit: channelData.user_limit,
                rate_limit_per_user: channelData.rate_limit_per_user,
                position: channelData.position,
                permission_overwrites: permissionOverwrites,
                parent_id: parentId,
                nsfw: channelData.nsfw,
                rtc_region: channelData.rtc_region,
                default_auto_archive_duration: channelData.default_auto_archive_duration,
                default_reaction_emoji: channelData.default_reaction_emoji,
                available_tags: channelData.available_tags,
                default_sort_order: channelData.default_sort_order,
            },
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}

export const deleteChannel = async (token: string, channelId: string) => {
    return await new Promise(async (resolve, reject) => {
        await axios(`https://discord.com/api/v9/channels/${channelId}`, {
            method: 'DELETE',
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}

export const createEmoji = async (
    token: string,
    serverId: string,
    emojiData: {
        name: string
        image: string
    },
) => {
    return await new Promise(async (resolve, reject) => {
        await axios(`https://discord.com/api/v9/guilds/${serverId}/emojis`, {
            method: 'POST',
            data: emojiData,
            headers: {
                authorization: token,
            },
        })
            .then((res) => res.data)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
    })
}
