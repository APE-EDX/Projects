var Server = {
    decrypt: function(org) {
        var packets = [];
        var dec = "";

        if (!isGame()) {
            for (var i = 0; i < org.length; ++i) {
                dec += char(org.charCodeAt(i) - 0xF);
            }

            packets.push(dec);
        }
        else {
            // To array
            packets = phase2(org.toCharCodes());
        }

        return packets;
    },

    encrypt: function(org) {
        return phase1(org + char(0x0A));
    }
};

print('SERVER');
