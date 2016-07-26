var conversionTable = [0x00, 0x20, 0x2D, 0x2E, 0x30, 0x31, 0x32, 0x33,
                        0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x0A, 0x00];

var GamePtrSig = SigScan('8B35????????A1????????8B00');
var GamePtr = GamePtrSig.read(7);

function isGame() {
    var ret = Ptr(Ptr(GamePtr), 0x31).value.get();
    return uint8(ret);
}

function phase1(org) {
    var dec = "";
    var len = org.length;
    var packets = [];

    // Create mask
    var mask = "0".repeat(len);
    for (var i = 0; i < len; ++i) {
        var ch = org[i];
        if (ch != 0x23 && (!(ch -= 0x20) || (ch += 0xF1) < 0 || (ch -= 0xB) < 0 || !(ch -= 0xC5))) {
            mask[i] = "1";
        }
    }

    var currentCounter = 0;
    var lastCounter = 0;
    var sequenceCounter = 0;
    var pair;
    var last;

    while (currentCounter < len) {
        lastCounter = currentCounter;

        for (; currentCounter < len && mask[currentCounter] == "0"; ++currentCounter) {}

        if (currentCounter)
        {
            var currentLen = (currentCounter - lastCounter);
            var sequences = parseInt(currentLen / 0x7E);
            for (var i = 0; i < currentLen; ++i) {
                if (i == (sequenceCounter * 0x7E)) {
                    if (!sequences) {
                        dec += char(currentLen - i);
                    }
                    else {
                        dec += char(0x7E);
                        --sequences;
                        ++sequenceCounter;
                    }
                }

                dec += char(org[lastCounter] ^ 0xFF);
                ++lastCounter;
            }
        }

        if (currentCounter >= len) {
            break;
        }

        lastCounter = currentCounter;
        pair = true;
        last = 0;

        for (; currentCounter < len && mask[currentCounter] == "1"; ++currentCounter) {}

        if (currentCounter) {
            var currentLen = (currentCounter - lastCounter);
            var sequences = parseInt(currentLen / 0x7E);
            for (var i = 0; i < currentLen; ++i) {
                if (i == (sequenceCounter * 0x7E)) {
                    if (!sequences) {
                        dec += char((currentLen - i) | 0x80);
                    }
                    else {
                        dec += char(0x7E | 0x80);
                        --sequences;
                        ++currentCounter;
                    }
                }

                var ch = org[lastCounter];
                ++lastCounter;

                switch (ch) {
                    case 0x20:  ch = 0x1; break;
                    case 0x2D:  ch = 0x2; break;
                    case 0x2E:  ch = 0x3; break;
                    case 0xFF:  ch = 0xE; break;
                    default:    ch -= 0x2C; break;
                }

                if (pair) {
                    last = ch << 4;
                    dec += char(last);
                }
                else {
                    dec[dec.length - 1] = (last | ch);
                }

                pair = !pair;
            }
        }
    }

    dec += char(0xFF);
    packets.push(dec);
    return packets;
}

function phase2(org, log) {
    var dec = "";
    var len = org.length;
    var packets = [];

    for (var counter = 0; counter < len; ) {
        var b = org[counter];
        ++counter;

        if (b == uint8(0xFF)) {
            packets.push(dec);
            dec = "";
            continue;
        }

        var usesTable = uint8(b & 0x80);
        var localLen = uint8(b & 0x7F);

        if (usesTable) {
            while (localLen && counter < len) {
                b = org[counter];
                ++counter;

                var hb = uint8((b & 0xF0) >> 4);
                if (hb > 0x0 && hb < 0xF) {
                    dec += char(conversionTable[hb]);
                    --localLen;
                }

                var lb = uint8(b & 0xF);
                if (lb > 0x0 && lb < 0xF) {
                    dec += char(conversionTable[lb]);
                    --localLen;
                }
            }
        }
        else {
            while (localLen && counter < len) {
                b = org[counter];
                ++counter;
                --localLen;

                dec += char(b ^ 0xFF);
            }
        }
    }

    if (dec) {
        packets.push(dec);
    }

    return packets;
}

print("HELPERS");
