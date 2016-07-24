function isGame() {
    var ret = Ptr(Ptr(Ptr(0x686260)), 0x31).value.get();
    return uint8(ret);
}

var key = -1;

var customSend = function(socket, buf, len, flags) {
    var org = buf.string(len.get());
    var dec = "";

    if (!isGame()) {
        for (var i = 0; i < org.length; ++i) {
            dec += char((org.charCodeAt(i) - 0xF) ^ 0xC3);
        }
    }
    else {
        print('Ingame send packet');
        if (key == 0) {
        }
        else if (key == 1){
        }
        else if (key == 2){
        }
        else if (key == 3){
        }
        else {
            for (var i = 0; i < org.length; ++i) {
                dec += char(org.charCodeAt(i) - 0xF);
            }
        }
    }

    print(dec);
    return this.fn(socket, buf, len, flags);
}

var conversionTable = [0x00, 0x20, 0x2D, 0x2E, 0x30, 0x31, 0x32, 0x33,
                        0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x0A, 0x00];

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

var customRecv = function(socket, buf, len, flags) {
    var recvLen = this.fn(socket, buf, len, flags);
    var org = buf.string(recvLen.get());
    var dec = "";

    if (!isGame()) {
        for (var i = 0; i < org.length; ++i) {
            dec += char(org.charCodeAt(i) - 0xF);
        }
    }
    else {
        dec = phase2(org);
    }

    print(dec);
    return recvLen;
}

function setDetours() {
    Redirect.restoreAll();
    Redirect(Find('ws2_32.dll', 'send'), customSend);
    Redirect(Find('wsock32.dll', 'recv'), customRecv);
}

setDetours();
