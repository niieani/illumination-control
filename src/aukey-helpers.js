// this isn't exact 1 second unfortunately, seems not possible, measured:
// see reverse-engineering.md
const TIME_RATIO = 13

/**
 * @param {{targetSlotNth: number, stages: Array<{crossfade: boolean, holdMs: number} & ({hue: number, saturation: number, lightness: number} | {power: number, temperature: number})>}} input
 * @returns {string}
 */
const getScene = ({
  targetSlotNth,
  stages = [],
}) => {
  if (!stages?.length) {
    throw new Error('Scene must provide at least one stage!')
  }

  const codedStages = stages.map(({
    crossfade = false,
    holdMs = 1000,
    // holdMs2 = 100,
    // color bulb:
    hue,
    saturation = 1000,
    lightness = 1000,
    // white bulb:
    power,
    temperature = 1000,
  }) => {
    // maximum 5 seconds! maybe that's it? 5 seconds == 0xFFFF ?
    // that would mean 1 second = 13107
    const realHold = holdMs * TIME_RATIO
    if (realHold > 0xFFFF || hue > 360 || saturation > 1000 || lightness > 1000 || power > 1000 || temperature > 1000) {
      throw new Error('You went too high')
    }
    const codedColor = typeof hue === 'number' ? [
      hue.toString(16).padStart(4, '0'),
      saturation.toString(16).padStart(4, '0'),
      lightness.toString(16).padStart(4, '0'),
    ] : ['0000', '0000', '0000']
    const codedWhite = typeof power === 'number' ? [
      power.toString(16).padStart(4, '0'),
      temperature.toString(16).padStart(4, '0'),
    ] : ['0000', '0000']

    if (typeof hue !== 'number' && typeof power !== 'number') {
      throw new Error(`I don't know what will happen if there ain't no color nor white!`)
    }
    // 'SSSS MM HHHH AAAA LLLL PPPP TTTT'
    return [
      realHold.toString(16).padStart(4, '0'),
      // mode:
      crossfade && stages.length === 1 ? '00' : crossfade ? '02' : '01',
      ...codedColor,
      ...codedWhite,
    ].join('')
  })
  return [
    targetSlotNth.toString(16).padStart(2, '0'),
    ...codedStages,
  ].join('')
}

const schema = {
  power: '20',
  // 'white' | 'colour' | 'scene'
  mode: '21',
  color: '24',
  // 0 - 1000
  strength: '22',
  // 0 - 1000
  whiteTemperature: '23',
  sceneDefinition: '25',
  turnOffAfterSeconds: '26',
}

const getColor = (/** @type number */ hue, /** @type number */ saturation, /** @type number */ brightneses) => `${hue.toString(16).padStart(4, '0')}${saturation.toString(16).padStart(4, '0')}${brightneses.toString(16).padStart(4, '0')}`


module.exports.getScene = getScene;
module.exports.getColor = getColor;
module.exports.schema = schema;
