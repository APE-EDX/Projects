var Client = {
    decrypt: function(num, key, org) {
        var packets = [];

        if (!isGame()) {
            var dec = "";

            for (var i = 0; i < org.length; ++i) {
                dec += char((org.charCodeAt(i) - 0xF) ^ 0xC3);
            }

            packets.push(dec);
        }
        else {
            var dec = [];
            var chr;

            key = uint8(key + 0x40);
            var fixed = (num == -1) ? -0xF : ((num % 2 == 0) ? -key : key);
            var xor = (num >= 2) ? 0xC3 : 0x00;

            for (var i = 0; i < org.length; ++i) {
                chr = uint8(uint8(org.charCodeAt(i) + fixed) ^ xor);
                dec.push(chr);
            }

            packets = phase2(dec);
        }

        return packets;
    },

    encrypt: function(num, key, org) {
        var packets = [];
        var dec = "";

        if (!isGame()) {
            for (var i = 0; i < org.length; ++i) {
                dec += char((org.charCodeAt(i) ^ 0xC3) + 0x0F);
            }

            packets.push(dec);
        }
        else {
            // Phase 1
            org = phase1(org)[0];

            key = uint8(key + 0x40);
            var fixed = (num == -1) ? 0xF : ((num % 2 == 0) ? key : -key);
            var xor = (num >= 2) ? 0xC3 : 0x00;
            var chr;

            for (var i = 0; i < org.length; ++i) {
                chr = char(uint8(org.charCodeAt(i) ^ xor) + key);
                dec += chr;
            }

            packets.push(dec);
        }

        return dec;
    },
};

print('CLIENT');
