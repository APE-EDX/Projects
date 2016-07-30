var SHRD = function(x, y, b) {
    x >>>= b;
    x |= (y << (32 - b));
    return x;
}

function Crypto(seed) {

    this.Encrypt = function(x, opcode) {
        // First step uses 2 DWORD at once
        // integer result of /8 division
        var numberOfQWords = x.length >>> 3;

        // Keep a local copy
        var counter = this.counter;

        // Encrypted packet
        var crypted = new Packet;
        packet.write(1, opcode);
        packet.write(1, 0x80);

        // Apply to all QWORDs
        for (var n = 0; n < numberOfQWords; ++n) {
            // Duplicates counter and shifts << 8 (all at once, << 9)
            var dupCounter = (counter & 0x1FF) << 9;
            var idx = uint32(dupCounter) + this.counter;

            var x0 = x.read(4) ^ this.random.table[idx * 2];
            var x1 = x.read(4) ^ this.random.table[idx * 2 + 1];
            // x0 ^= ([EBP + 10] = 0)
            // x1 ^= ([EBP + 14] = 0)

            crypted.write(4, x0);
            crypted.write(4, x1);
        }

        var remainingQwords = x.length % 8;
        if (remainingQwords) {
            //counter = this.counter << 9; // [ESP + 30]
            var idx = (counter & 0x1FF) + (this.counter << 9);

            var x0 = x.read(4) ^ this.random.table[idx * 2];
            var x1 = x.read(4) ^ this.random.table[idx * 2 + 1];

            crypted.write(remainingQwords > 4 ? 4 : remainingQwords, x0);
            if (remainingQwords > 4) {
                crypted.write(remainingQwords - 4, x1);
            }
        }

        // Update packet counter
        ++this.counter;

        // Return packet
        return crypted;
    }

    // Packet counter
    this.counter = 0;

    // Random generator
    this.random = new Random(0x1462D38);
}

// SEED1 = 01462D38
// STATE0 = 80AC1937
// STATE1 = 91AB2489
