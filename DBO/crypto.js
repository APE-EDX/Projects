function Crypto(seed) {

    this.Encrypt = function(x, opcode) {
        // First step uses 2 DWORD at once
        // integer result of /8 division
        var numberOfQWords = x.length() >>> 3;

        // Keep a local copy
        var counter = this.counter;
        // Duplicates counter and shifts << 8 (all at once, << 9)
        var dupCounter = this.counter << 9;

        // Encrypted packet
        var crypted = new Packet;
        crypted.write(1, x.length());
        crypted.write(1, 0x80);

        // Apply to all QWORDs
        for (var n = 0; n < numberOfQWords; ++n) {
            var idx = uint32(counter & 0x1FF) + dupCounter;

            var a = x.read(4);
            var x0 = a ^ this.random.table[idx * 2];
            var x1 = x.read(4) ^ this.random.table[idx * 2 + 1];
            // x0 ^= ([EBP + 10] = 0)
            // x1 ^= ([EBP + 14] = 0)

            crypted.write(4, x0);
            crypted.write(4, x1);

            // Increment counter
            ++counter;
        }

        var remainingQwords = x.length() % 8;
        if (remainingQwords) {
            //counter = this.counter << 9; // [ESP + 30]
            var idx = (counter & 0x1FF) + dupCounter;

            var bytes1 = remainingQwords > 4 ? 4 : remainingQwords;
            var bytes2 = remainingQwords > 4 ? remainingQwords - 4 : 0;

            var x0 = x.read(bytes1) ^ this.random.table[idx * 2];
            crypted.write(bytes1, x0);

            if (bytes2 > 0) {
                var x1 = x.read(bytes2) ^ this.random.table[idx * 2 + 1];
                crypted.write(bytes2, x1);
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
    this.random = new Random(0x80AC1937, 0x91AB2489, 0x200, 0x3D);
}

// SEED1 = 01462D38
// STATE0 = 80AC1937
// STATE1 = 91AB2489
