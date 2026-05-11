/**
 * @file Digital Clock (for Last Call BBS)
 * @version 0.2
 *
 */

// About 1.5 hours of running on fumes when making this, and about twice as much making it better for version 0.2

var time;                   // For the current time
var digital;                // For the fancy digits
var hourMode = 12;          // For the 24h vs 12h mode
var drawHints = true;       // For the additional text

function getName()
{
    return 'Digital Clock';
}

function onConnect()
{
    // TODO for 0.3: make hourMode and drawHints save and load
}

function onUpdate()
{
    clearScreen();

    // Fetch current time
    time = new Date();
    // And then fetch the timestring of the current hour mode (12 vs 24)
    // using a custom-defined method (see below)
    clock = time.getTimeString(hourMode);

    // Draw the hotkeys and the regular text clock
    if (drawHints) {
        drawText("Enter: " + hourMode + "h_mode", 1, 1, 0);
        drawText("Tab: toggle this text", 1, 1, 1);
        if (hourMode === 12)
            drawText(clock + " " + time.AMPM, 1, 44, 0);
        else
            drawText(clock, 1, 47, 0);
    }

    // Get the fancy digits
    digital = getDigits(clock);

    // And draw them
    for (let i = 0; i < 5; i++) {
        drawText(digital[i]+" ", 11+i, 11, 5+i);
    }

    // Get the am/pm sign and draw it, if necessary
    if (hourMode === 12) {
        for (let i = 0; i < 5; i++) {
            drawText(ampm[time.AMPM][i]+" ", 15-i, 23, 11+i);
        }
    }
}

function onInput(key)
{
    // Enter switches 24h/12h modes
    if (key == 10) {
        hourMode = 12 + 12*(hourMode === 12);
    // Tab hides the hint text
    } else if (key == 9) {
        drawHints = !drawHints;
    } 
}

//----------------------------------------------------------------------------//
// Custom functions                                                           //
//----------------------------------------------------------------------------//

// This function builds the fancy digits, layer by layer, character by character
function getDigits(timestring) {
    layers = [
        '',
        '',
        '',
        '',
        '',
    ]
    // For each layer
    for (let a = 0; a < 5; a++) {
        // And for each character in the timestring (including ":" colons)
        for (let i = 0; i < timestring.length; i++) {
            // We add the proper tile as determined by the rules function
            layers[a] = layers[a] + rules(a, timestring[i]);
        }
    }
    return layers
}

// This function fetches the correct blocks for the current layer and character
// TODO 0.3: This whole thing could be more efficient
function rules(layer, character) {
    // If we're working with the ":" colon
    if (character === ":") {
        // We ensure it only gets elements on the correct layers
        if (layer === 1 || layer === 3) {
            // Blinking on three quarters of a second has a nice snappy delay,
            // compared to full or half second synch
            if ((parseInt(time.getMilliseconds()/10, 10) < 75)) {
                if (layer === 1) // Correct arrows on correct layers!
                    return "▼"
                else
                    return "▲"
            } else return " " // Empty for blinking
        }
        else return " " // Empty for layers 0, 2, and 4
    }

    // Working with digits
    else
        // I tried avoiding the ternary operator mess but it is
        // too much work for 0.2. Maybe in 0.3. TODO!
        // Here is at least a better-formatted form
        return {
            // Layer 0
            // All the digits in "02356789" use the full layer 0
            // Digit 1 uses the right side, and 4 uses the left side
            0: ("02356789".includes(character)
                    ? tiles[0][0]
                    : character === "1"
                        ? tiles[0][1]
                        : tiles[0][2]
            ),
            // Layer 1
            // The digits in "0489" use both the sides of layer 1
            // The digits in "1237" use only the right side.
            // The remaining ones, 5 and 6, use the left side only
            1: ("0489".includes(character)
                ? tiles[1][0]
                : "1237".includes(character)
                    ? tiles[1][1]
                    : tiles[1][2]
                ),
            // Layer 2
            // All digits above 1, except for 7, use the full layer 2
            // Digits 1 and 7 use the right side, and 0 uses the sides only
            2: ((parseInt(character, 10) > 1 && character !== "7")
                ? tiles[2][0]
                : "17".includes(character)
                    ? tiles[2][1]
                    : tiles[2][2]
                ),
            // Layer 3
            // The digits in "068" use both sides of layer 3
            // The digits in "134579" use only the right side
            // The remaining digit, 2, uses only the left side
            3: ("068".includes(character)
                ? tiles[3][0]
                : "134579".includes(character)
                    ? tiles[3][1]
                    : tiles[3][2]
                ),
            // Layer 4
            // All the digits in "0235689" use the full layer 4
            // Digits 1, 4, and 7 use the right side
            4: ("0235689".includes(character)
                ? tiles[4][0]
                : tiles[4][1]
            ),
        // This is a dictionary, so we get the appropriate layer rules
        // It's essentially a lookup table except with if's inside it
        }[layer]
}

//----------------------------------------------------------------------------//
// Custom implementations for methods not included in Axiom QuickServe JS     //
//----------------------------------------------------------------------------//

// Check if string includes substring
String.prototype.includes = function(substr) {
    return this.indexOf(substr) !== -1;
}

// Pad string with pad, by length characters
// Admittedly a little unnecessarily expanded for this one-off hard-coded purpose
String.prototype.lpad = function(padLength, pad) {
    let str = this;
    while (str.length < padLength+1)
        str = pad + str;
    return str;
}

// Custom method to get timestring in 24 or 12 hour mode
Date.prototype.getTimeString = function(mode) {
    // If 12h mode
    if (mode === 12) {
        // Get current time string
        let currentTime = this.toTimeString();
        // Get the hours
        let currentHoursInt = parseInt(currentTime.substr(0, 2), 10);

        // Check if AM or PM (also apply custom property)
        // Defining PM as noon or beyond, AM as midnight or beyond
        this.AMPM = (currentHoursInt >= 12) ? "PM" : "AM";

        // Subtract 12 if PM but not noon
        if (this.AMPM === "PM" && currentHoursInt !== 12)
            currentHoursInt -= 12;

        // Pad with zero as necessary and add the rest of the timestring,
        // cut to the needed length, and return
        return String(currentHoursInt).lpad(1, '0') + currentTime.substr(2, 6);

    // If 24h mode
    } else
        // Return the usual output here, cut to the needed length
        return this.toTimeString().substr(0, 8);
}

//----------------------------------------------------------------------------//
// Layers (string arrays) definitions                                         //
//----------------------------------------------------------------------------//

// Markers for 12h time
ampm = {
    "AM" : [
        "▟█▙  ▟▄▙",
        "▌ ▐  ▌█▐",
        "███  ▌█▐",
        "▌ ▐  ▌▀▐",
        "▜ ▛  ▜ ▛"
    ],
    "PM" : [
        "▟█▙  ▟▄▙",
        "▌ ▐  ▌█▐",
        "███  ▌█▐",
        "▌    ▌▀▐",
        "▜    ▜ ▛"
    ]
}

// For reference, the whole numbers
/*
▟█▙   ▙ ▟█▙ ▟█▙ ▟   ▟█▙ ▟█▙ ▟█▙ ▟█▙ ▟█▙ // layer 0
▌ ▐   ▐   ▐   ▐ ▌ ▐ ▌   ▌     ▐ ▌ ▐ ▌ ▐ // layer 1
█ █   █ ███ ███ ███ ███ ███   █ ███ ███ // layer 2
▌ ▐   ▐ ▌     ▐   ▐   ▐ ▌ ▐   ▐ ▌ ▐   ▐ // layer 3
▜█▛   ▛ ▜█▛ ▜█▛   ▛ ▜█▛ ▜█▛   ▛ ▜█▛ ▜█▛ // layer 4
*/

// A lot of the numbers share identical parts
// So we construct them with these tiles and some logic
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
