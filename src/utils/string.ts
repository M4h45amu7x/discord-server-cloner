import axios from 'axios'

export const getByteArrayFromImageURL = async (url: string): Promise<string> => {
    return await new Promise(async (resolve, reject) => {
        await axios(url, {
            responseType: 'arraybuffer',
        })
            .then((res) => res.data)
            .then((data) => {
                resolve(Buffer.from(data, 'binary').toString('base64'))
            })
            .catch((error) => {
                resolve('')
            })
    })
}
