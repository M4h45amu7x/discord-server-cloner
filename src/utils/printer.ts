import figlet from 'figlet'
import gradient from 'gradient-string'

const setTitle = (title: string) => {
    process.stdout.write(String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7))
}

export const printTitle = async () => {
    setTitle('Discord Server Cloner | M4h45amu7x')

    console.log(gradient.pastel.multiline('='.repeat(102)))
    console.log()
    console.log(gradient.pastel.multiline(figlet.textSync('Discord  Server  Cloner')))
    console.log(gradient.pastel.multiline(figlet.textSync('by  M4h45amu7x')))
    console.log()
    console.log(gradient.pastel.multiline('='.repeat(102)))
    console.log()
}
