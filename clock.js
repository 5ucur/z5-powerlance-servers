/*
 *  This mess was coded in like 1.5h or so, on zero hours of sleep.
 *  So if it sucks, it's clear why. Beats me why it even works so well.
 *  Releasing this under this license i found on tom7 (dot org):
 *
 *  Tom 7 Happy License Agreement - Free Happiness through Free Software
 *
 *  This program may be redistributed, reverse engineered, altered, sold,
 *  adapted, published, publicly maligned, or in fact anything you want with it,
 *  as long as it makes someone happy. If the net unhappiness which is produced
 *  from the use of the program and derivatives ever exceeds the net happiness,
 *  then distribution of the program should cease, as the license will become
 *  void.
 */

var time;
var digital;
var twelvehour = false;
var drawHints = true;
var PM;

function getName()
{
    return 'Digital Clock';
}

// The whole numbers
/*
▟█▙   ▙ ▟█▙ ▟█▙ ▟   ▟█▙ ▟█▙ ▟█▙ ▟█▙ ▟█▙
▌ ▐   ▐   ▐   ▐ ▌ ▐ ▌   ▌     ▐ ▌ ▐ ▌ ▐
█ █   █ ███ ███ ███ ███ ███   █ ███ ███
▌ ▐   ▐ ▌     ▐   ▐   ▐ ▌ ▐   ▐ ▌ ▐   ▐
▜█▛   ▛ ▜█▛ ▜█▛   ▛ ▜█▛ ▜█▛   ▛ ▜█▛ ▜█▛
*/

// Markers for 12h time
ampm = {
    "0" : [
        "▟█▙  ▟▄▙",
        "▌ ▐  ▌█▐",
        "███  ▌█▐",
        "▌ ▐  ▌▀▐",
        "▜ ▛  ▜ ▛"
    ],
    "1" : [
        "▟█▙  ▟▄▙",
        "▌ ▐  ▌█▐",
        "███  ▌█▐",
        "▌    ▌▀▐",
        "▜    ▜ ▛"
    ]
}

// Tiling because a lot of numbers share same parts
tiles = {
    "0": {
        "0": " ▟█▙ ",
        "1": "   ▙ ",
        "2": " ▟   "
    },
    "1": {
        "0": " ▌ ▐ ",
        "1": "   ▐ ",
        "2": " ▌   "
    },
    "2": {
        "0": " ███ ",
        "1": "   ▐ ",
        "2": " ▌ ▐ "
    },
    "3": {
        "0": " ▌ ▐ ",
        "1": "   ▐ ",
        "2": " ▌   "
    },
    "4": {
        "0": " ▜█▛ ",
        "1": "   ▛ "
    },
}

function onConnect()
{
    // this gotta exist even if empty...
}

// Workaround for string.includes not working here
function includes(str, substr) {
    return str.indexOf(substr) !== -1;
}

// fustercluck
function rules(layer, digit, dots) {
    // if we're working with the colon
    if (digit === ":")
        // ensure it only gets printed to the right heights
        if (layer === 1 || layer === 3)
            // put the lil arrows on the correct heights
            // ms/10 >= 75 has that nice snappy delay compared to 50 or 100
            return (!(parseInt(time.getMilliseconds()/10, 10) >= 75) ? layer === 1 ? "▼" : "▲" : " ")
        else return " "
    // working with numbers
    else
        // fustercluck proper
        // basically the tiling
        return {
            0: (includes("02356789", digit) ? tiles[0][0] : digit === "1" ? tiles[0][1] : tiles[0][2]),
            1: (includes("0489", digit) ? tiles[1][0] : includes("1237", digit) ? tiles[1][1] : tiles[1][2]),
            2: ((parseInt(digit, 10) > 1 && digit !== "7") ? tiles[2][0] : includes("17", digit) ? tiles[2][1] : tiles[2][2]),
            3: (includes("068", digit) ? tiles[3][0] : includes("134579", digit) ? tiles[3][1] : tiles[3][2]),
            4: (includes("0235689", digit) ? tiles[4][0] : tiles[4][1]),
        }[layer]
}

// fustercluck, one cluster of fucks higher
function getDigits(timestring) {
    layers = [
        '',
        '',
        '',
        '',
        '',
    ]
    // layers!
    for (let a = 0; a < 5; a++) {
        // digits!
        for (let i = 0; i < timestring.length; i++) {
            layers[a] = layers[a] + rules(a, timestring[i])
        }
    }
    return layers
}

function onUpdate()
{
    // It is safe to completely redraw the screen during every update:
    clearScreen();
    // and here comes the time
    time = new Date();
    clock = time.toTimeString().substr(0,8);

    // toLocaleString didn't work so i did a thing
    if (twelvehour) {
        PM = (parseInt(clock.substring(0, 2), 10) > 12)
        if (PM) {
            let hr = String(parseInt(clock.substring(0, 2), 10) - 12)
            if (!hr.length-1)
                hr = "0"+hr
            clock = hr + clock.substring(2, 8)
        }
    }
    // some grey text up top
    if (drawHints) {
        if (twelvehour) {
            drawText(clock, 1, 44, 0);
            drawText(PM ? "PM" : "AM", 1, 53, 0);
        } else {
            drawText(clock, 1, 47, 0);        
        }
        drawText("Enter: " + (twelvehour ? "24h" : "12h") + " mode", 1, 1, 0);
        drawText("Tab: toggle this text", 1, 1, 1);
    }

    // get our fancy digits
    digital = getDigits(clock)

    // n draw 'em
    for (let i = 0; i < 5; i++) {
        drawText(digital[i]+" ", 11+i, 11, 5+i);
    }
    // also the am pm sign
    if (twelvehour) {
        for (let i = 0; i < 5; i++) {
            drawText(ampm[PM ? "1" : "0"][i]+" ", 15-i, 23, 11+i);
        }
    }
}

// finally, the handling of keys.
function onInput(key)
{
    // enter switches 24/12
    if (key == 10) {
        twelvehour = !twelvehour
    // and tab hides the grey text
    } else if (key == 9) {
        drawHints = !drawHints
    }
}
