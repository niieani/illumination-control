const {getScene} = require('./aukey-helpers')

describe('scenes', () => {
  test('single', () => {
    expect(
      getScene({
        targetSlotNth: 4,
        stages: [
          {
            crossfade: false,
            holdMs: 50,
            hue: 500,
            saturation: 1000,
            lightness: 1000,
          },
        ],
      })
    ).toMatchInlineSnapshot(`"0432320001f403e803e800000000"`)
  })
  test('flash', () => {
    expect(
      getScene({
        targetSlotNth: 4,
        stages: [
          {
            crossfade: false,
            holdMs: 50,
            hue: 500,
            saturation: 1000,
            lightness: 1000,
          },
          {
            crossfade: false,
            holdMs: 50,
            hue: 1000,
            saturation: 1000,
            lightness: 1000,
          },
        ],
      })
    ).toMatchInlineSnapshot(
      `"0432320101f403e803e80000000032320103e803e803e800000000"`
    )
  })
})
