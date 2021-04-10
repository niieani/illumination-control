## Similar devices

https://github.com/TheAgentK/tuya-mqtt/blob/master/docs/DEVICES.md

## Decoding timing for scenes

TIME_RATIO = 13 isn't exact 1 second unfortunately, seems not possible, measured:
5000 is 375ms == 13.3
7000 is 550ms == 12.7
9000 is 700ms == 12.85
12000 is 925ms == 12.97
16000 is 1270ms == 12.6
25000 is 1970ms == 12.7
26000 is 2040ms == 12.75 ratio or maybe even 13 (10x was 20 seconds)

Trying measuring the other way:
13.11 too slow
13.02 too slow
12.9 too fast
12.97 too fast
12.99 too fast

## Decoding scene definition

header: '06' or '05' ? unknown -- maybe scene number?
                  '4646 01 0000 03e8 03e8 0000 0000'
 saturation       '2828 01 0022 0208 01f4 0000 0000'
 brightness       '2828 01 0022 03e8 01f4 0000 0000'
light definition: 'SSSS MM HHHH CCCC BBBB PPPP TTTT'
(night) white  00 '0e0d 00 0000 0000 0000 00c8 0000' -- minimum temp, 15% bright, min time?
(read)  white  01 '0e0d 00 0000 0000 0000 03e8 01f4' -- medium temp (500), max bright (3e8 = 1000)
(soft)  green  04 '4646 02 0078 03e8 03e8 0000 0000'
    dim green     '4646 02 0078 03e8 000a 0000 0000' -- breath mode, medium speed (17990)
same but flash 04 '4646 01 0078 03e8 03e8 0000 0000
S - change speed (0x6464, i.e. 25700 is slowest 2000ms seconds; fastest is 750ms - 0x2828 = 10280; slightly slower 0x3232)
M - mode, 00 is static (one color), 01 is flash, 02 is crossfade
H - color hue (0 when in white)
C - color saturation (0 when in white)
B - color brightness (0 when in white)
P - white power 0-1000 (0 when in color)
T - white temperature 0-1000 (0 when in color)

there's 8 scenes to upload to device (or maybe that's just stored in the app?)
looks like whole light is 26 chars, e.g. white: '28280100000000000003e803e8'
every color in a scene finishes with '03e803e800000000'
of this, first 2 is saturation
next 2 is unknown
next 3 e.g. '1f4' is brightness
2 chars before, unknown
8 chars before, e.g. '46460100', prefixes every one
out of these, first six tell us about speed, e.g. '4646' or '6282' max speed?
next one is '0'
next two are either '00' or '10'
last 2 (or three?) are hue
and at the very beginning of scenes, 2 digits, e.g. '06', '05' -- hmm?

e.g. '06464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000'
     '06282801000003e803e800000000282801007803e803e80000000028280100f003e803e800000000'
same but with max speed ^^
     '06282801002203e803e800000000282801007803e803e80000000028280100f003e803e800000000'
same but first color is different hue

     '06282801002203e801f400000000282801007803e803e80000000028280100f003e803e800000000'
same but first color 50% brightness

     '062828010022020801f400000000282801007803e803e80000000028280100f003e803e800000000'
same but first color 50% saturation

     '0628280100000000000003e803e8282801007803e803e80000000028280100f003e803e800000000'
same but first is 'white' LED
or with maximum scene colors (8):
     '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000464601009d03e803e80000000046460100f103e803e800000000'
05
464601000003e803e800000000
464601007803e803e800000000
46460100f003e803e800000000
464601003d03e803e800000000
46460100ae03e803e800000000
464601011303e803e800000000
464601009d03e803e800000000
46460100f103e803e800000000


speed change:
464601000003e803e800000000
282801000003e803e800000000
