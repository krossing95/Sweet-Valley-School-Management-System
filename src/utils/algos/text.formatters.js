import { DATATYPES } from '../static/index.js'

export default function TextFormatters() {
    const { UNDEFINED } = DATATYPES
    const capitalize = (string) => {
        if (typeof string === UNDEFINED || string === null) return ''
        const array = string.trim().toLowerCase().split(' ')
        const formattedString = array.map(str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`)
        return formattedString.join(' ')
    }
    const cleanText = (string) => {
        if (typeof string === UNDEFINED || string === null) return ''
        return string.trim().replace('<script>', '').replace('</script>', '')
    }
    return {
        capitalize, cleanText
    }
}