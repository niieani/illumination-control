type DigitHex =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
type FourHexDigits = `${DigitHex}${DigitHex}${DigitHex}${DigitHex}`
// 0-360
export type HueDegreeHex = `0${0 | 1}${DigitHex}${DigitHex}`
// 0-1000 (0000 - 03E8)
export type SaturationHex = `0${0 | 1 | 2 | 3}${DigitHex}${DigitHex}`
// 0-1000 (0000 - 03E8)
export type BrightnessHex = `0${0 | 1 | 2 | 3}${DigitHex}${DigitHex}`

export type Schema = {
  '20': boolean
  '21': 'white' | 'colour' | 'scene'
  '22': number // ??,
  '23': number // ??,
  '24': string // `${HueDegreeHex}${SaturationHex}${BrightnessHex}`
  '26': number // ??,
}
