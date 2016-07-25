var conversionTable = [0x00, 0x20, 0x2D, 0x2E, 0x30, 0x31, 0x32, 0x33,
                        0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x0A, 0x00];

function isGame() {
    var ret = Ptr(Ptr(Ptr(0x686260)), 0x31).value.get();
    return uint8(ret);
}

function phase2(org) {
    var dec = "";
    for (var i = 0; i < org.length; ) {
        var b = uint8(org.charCodeAt(i));
        ++i;

        if (b == 0xFF) {
            dec += "\n";
            continue;
        }

        var localLen = b & 0x7F;
        var usesTable = b & 0x80;

        if (usesTable) {
            for (var k = 0; k < localLen; k += 2) {
                b = uint8(org.charCodeAt(i));
                ++i;

                var hb = b & 0xF0;
                hb = hb >> 4;
                dec += char(conversionTable[hb]);

                var lb = b & 0xF;
                dec += char(conversionTable[lb]);
            }
        }
        else {
            for (var k = 0; k < localLen; ++k) {
                b = uint8(org.charCodeAt(i));
                ++i;

                dec += char(b ^ 0xFF);
            }
        }
    }
    
    return dec;
}

print('HELPERS');
