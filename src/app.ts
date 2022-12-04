import chalk from 'chalk'
import inquirer from 'inquirer'
import sleep from 'sleep-promise'

import type { IPermissionOverwrite2 } from './interfaces/Channel'
import { printTitle } from './utils/printer'
import {
    createChannel,
    createEmoji,
    createServer,
    deleteChannel,
    getChannelData,
    getServerData,
    login,
} from './utils/requester'
import { getByteArrayFromImageURL } from './utils/string'

const runApp = async () => {
    const ui = new inquirer.ui.BottomBar()

    await printTitle()

    const { option } = await inquirer.prompt({
        type: 'list',
        name: 'option',
        message: 'Select option:',
        choices: ['Start', 'Exit'],
    })
    if (option === 'Exit') return process.exit(0)

    const { token, serverId, delay, features } = await inquirer.prompt([
        {
            type: 'password',
            name: 'token',
            message: 'Your token:',
        },
        {
            type: 'input',
            name: 'serverId',
            message: 'Guild id:',
        },
        {
            type: 'checkbox',
            name: 'features',
            message: 'Delay in ms:',
            choices: [
                'Delete default channels',
                'Clone guild icon',
                'Clone channels',
                'Clone roles',
                'Clone permissions',
                'Clone emojis',
            ],
        },
        {
            type: 'number',
            name: 'delay',
            message: 'Delay in ms:',
            default: 500,
        },
    ])

    await login(token)
        .then((result) => ui.updateBottomBar(`Logged in as ${result.username}#${result.discriminator}`))
        .catch(() => {
            ui.updateBottomBar(chalk.hex('#ff5555')("Can't login"))
            process.exit(1)
        })

    ui.updateBottomBar(chalk.hex('#55ff55')('Loading guild data...'))
    await getServerData(token, serverId)
        .then(async (serverData) => {
            ui.updateBottomBar(chalk.hex('#55ff55')('Loading channel data...'))

            await getChannelData(token, serverId)
                .then(async (channelData) => {
                    ui.updateBottomBar(chalk.hex('#55ff55')('Creating guild...'))

                    await createServer(
                        token,
                        serverData,
                        features.includes('Clone roles'),
                        features.includes('Clone guild icon'),
                    )
                        .then(async (createdServerData) => {
                            let channelPermissions: IPermissionOverwrite2[] = []

                            if (features.includes('Delete default channels')) {
                                ui.updateBottomBar(chalk.hex('#55ff55')('Deleting default channels...'))

                                for (const row of await getChannelData(token, createdServerData.id)) {
                                    await deleteChannel(token, row.id)
                                        .then((result) =>
                                            ui.updateBottomBar(chalk.hex('#55ff55')(`Deleted channel: ${row.name}`)),
                                        )
                                        .catch((error) => {
                                            if (error.response?.data)
                                                ui.log.write(
                                                    chalk.hex('#ff5555')(
                                                        `Can't delete channel: ${row.name} (${error.response.data.message})`,
                                                    ),
                                                )
                                            else ui.log.write(chalk.hex('#ff5555')(`Can't delete channel: ${row.name}`))
                                        })
                                    await sleep(delay)
                                }
                            }

                            if (features.includes('Clone channels')) {
                                if (features.includes('Clone roles') && features.includes('Clone permissions')) {
                                    const cachedRoles = serverData.roles.sort((a, b) => a.position - b.position)
                                    const createdRoles = createdServerData.roles.sort((a, b) => a.position - b.position)
                                    for (const row of channelData) {
                                        for (const row2 of row.permission_overwrites) {
                                            for (let i = 0; i < cachedRoles.length; i++) {
                                                const role = cachedRoles[i]

                                                if (role.id === row2.id)
                                                    channelPermissions.push({
                                                        channelId: row.id,
                                                        id: createdRoles[i].id,
                                                        type: row2.type,
                                                        allow: row2.allow,
                                                        deny: row2.deny,
                                                    })
                                                else if (row2.id.length === 18)
                                                    channelPermissions.push({
                                                        channelId: row.id,
                                                        id: row2.id,
                                                        type: row2.type,
                                                        allow: row2.allow,
                                                        deny: row2.deny,
                                                    })
                                            }
                                        }
                                    }
                                    channelPermissions = channelPermissions.filter(
                                        (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i,
                                    )
                                }

                                ui.updateBottomBar(chalk.hex('#55ff55')('Creating channels...'))

                                const categories = channelData
                                    .filter((chRow) => chRow.type === 4)
                                    .sort((a, b) => a.position - b.position)
                                for (const row of categories) {
                                    await createChannel(
                                        token,
                                        createdServerData.id,
                                        row,
                                        channelPermissions
                                            .filter((cpRow) => cpRow.channelId === row.id)
                                            .map((row) => {
                                                return {
                                                    id: row.id,
                                                    type: row.type,
                                                    allow: row.allow,
                                                    deny: row.deny,
                                                }
                                            }),
                                    )
                                        .then(async (createdCategoryData) => {
                                            const channels = channelData
                                                .filter((chRow) => chRow.type !== 4 && chRow.parent_id === row.id)
                                                .sort((a, b) => a.position - b.position)
                                            for (const row2 of channels) {
                                                await createChannel(
                                                    token,
                                                    createdServerData.id,
                                                    row2,
                                                    channelPermissions
                                                        .filter((cpRow) => cpRow.channelId === row2.id)
                                                        .map((row) => {
                                                            return {
                                                                id: row.id,
                                                                type: row.type,
                                                                allow: row.allow,
                                                                deny: row.deny,
                                                            }
                                                        }),
                                                    createdCategoryData.id,
                                                )
                                                    .then((result) =>
                                                        ui.updateBottomBar(
                                                            chalk.hex('#55ff55')(`Created channel: ${row2.name}`),
                                                        ),
                                                    )
                                                    .catch((error) => {
                                                        if (error.response?.data)
                                                            ui.log.write(
                                                                chalk.hex('#ff5555')(
                                                                    `Can't create channel: ${row2.name} (${error.response.data.message})`,
                                                                ),
                                                            )
                                                        else
                                                            ui.log.write(
                                                                chalk.hex('#ff5555')(
                                                                    `Can't create channel: ${row2.name}`,
                                                                ),
                                                            )
                                                    })
                                                await sleep(delay)
                                            }
                                        })
                                        .then((result) =>
                                            ui.updateBottomBar(chalk.hex('#55ff55')(`Created category: ${row.name}`)),
                                        )
                                        .catch((error) => {
                                            if (error.response?.data)
                                                ui.log.write(
                                                    chalk.hex('#ff5555')(
                                                        `Can't create category: ${row.name} (${error.response.data.message})`,
                                                    ),
                                                )
                                            else
                                                ui.log.write(chalk.hex('#ff5555')(`Can't create category: ${row.name}`))
                                        })
                                    await sleep(delay)
                                }

                                const channels = channelData
                                    .filter((chRow) => chRow.type !== 4 && !chRow.parent_id)
                                    .sort((a, b) => a.position - b.position)
                                for (const row of channels) {
                                    await createChannel(
                                        token,
                                        createdServerData.id,
                                        row,
                                        // @ts-ignore
                                        channelPermissions.filter((cpRow) => cpRow.channelId === row.id),
                                    )
                                        .then((result) =>
                                            ui.updateBottomBar(chalk.hex('#55ff55')(`Created channel: ${row.name}`)),
                                        )
                                        .catch((error) => {
                                            if (error.response?.data)
                                                ui.log.write(
                                                    chalk.hex('#ff5555')(
                                                        `Can't create channel: ${row.name} (${error.response.data.message})`,
                                                    ),
                                                )
                                            else ui.log.write(chalk.hex('#ff5555')(`Can't create channel: ${row.name}`))
                                        })
                                    await sleep(delay)
                                }
                            }

                            if (features.includes('Clone emojis')) {
                                ui.updateBottomBar('Uploading emojis...')
                                for (const row of serverData.emojis) {
                                    await createEmoji(token, createdServerData.id, {
                                        name: row.name,
                                        image: `data:image/png;base64,${await getByteArrayFromImageURL(
                                            `https://cdn.discordapp.com/emojis/${row.id}?size=4096&quality=lossless`,
                                        )}`,
                                    })
                                        .then((result) =>
                                            ui.updateBottomBar(chalk.hex('#55ff55')(`Uploaded emoji: ${row.name}`)),
                                        )
                                        .catch((error) => {
                                            if (error.response?.data)
                                                ui.log.write(
                                                    chalk.hex('#ff5555')(
                                                        `Can't upload emoji: ${row.name} (${error.response.data.message})`,
                                                    ),
                                                )
                                            else ui.log.write(chalk.hex('#ff5555')(`Can't upload emoji: ${row.name}`))
                                        })
                                    await sleep(delay)
                                }
                            }

                            ui.updateBottomBar(chalk.hex('#55ff55')(`Successfully cloned ${serverData.name} guild`))
                            process.exit(0)
                        })
                        .catch((error) => {
                            if (error.response?.data)
                                ui.log.write(chalk.hex('#ff5555')(`Can't create guild: ${error.response.data.message}`))
                            else ui.log.write(chalk.hex('#ff5555')("Can't create guild"))
                            process.exit(1)
                        })
                })
                .catch((error) => {
                    if (error.response?.data)
                        ui.log.write(chalk.hex('#ff5555')(`Can't load channels data: ${error.response.data.message}`))
                    else ui.log.write(chalk.hex('#ff5555')("Can't load channels data"))
                    process.exit(1)
                })
        })
        .catch((error) => {
            if (error.response?.data)
                ui.log.write(chalk.hex('#ff5555')(`Can't load guild data: ${error.response.data.message}`))
            else ui.log.write(chalk.hex('#ff5555')("Can't load guild data"))
            process.exit(1)
        })
}

runApp()
