var SHRD = function(x, y, b) {
    x >>>= b;
    x |= (y << (32 - b));
    return x;
}

function Packet(data) {
    this.buffer = data || [];
    this.counter = 0;

    this.mask = function(len) {
        if (len == 1) return 0xFF;
        if (len == 2) return 0xFFFF;
        if (len == 3) return 0xFFFFFF;
        if (len == 4) return 0xFFFFFFFF;
        return 0;
    }

    this.read = function(len) {
        var counter = this.counter;

        // Current read padding
        var remaining = counter % 4;
        var readLen = Math.min(len, 4 - remaining);

        // Read
        this.counter += readLen;

        var pad = (3 - remaining - (readLen - 1)) * 8;
        var mask = this.mask(readLen) << pad || 1;

        // Is it 4 bytes aligned?
        if (remaining == 0) {
            return (this.buffer[counter / 4] & mask) >>> pad;
        }

        // Read current
        var idx = counter >>> 2; // Integer division by 4
        var ret = (this.buffer[idx] & mask) >>> pad;

        // Is there more?
        if (len > 4 - remaining) {
            ret <<= (4 - remaining) * 8;
            ret |= this.read(4 - remaining);
        }

        return ret;
    }
}

function alive(crypto) {

}

function Crypto(seed) {
    this.GenerateSimple = function(arg) {
        var ECX = arg; // ESP + 4??
        var ESI, EBP, EBX;
        var EAX = this.state0;
        var EDX = this.state1;

        for (var n = 0; n < 0x40; ++n) {
            EBP = EDX;
            EBX = EAX;

            EBX = SHRD(EBX, EBP, 2);
            EBP >>>= 2;
            EBP ^= EDX;
            EBX ^= EAX;

            EBX = SHRD(EBX, EBP, 3);
            ECX = EDX;
            ESI = EAX;
            EBP >>>= 3;
            ESI = SHRD(ESI, ECX, 1);

            EBX ^= ESI;
            EBX ^= EAX;

            ECX >>>= 1;
            EBP ^= ECX;
            EBP ^= EDX;

            EBX = SHRD(EBX, EBP, 1);
            EBP >>>= 1;
            EBP ^= EDX;
            EBX ^= EAX;

            EBX = SHRD(EBX, EBP, 1);
            EDX = EBX;
            EDX ^= ESI;
            EDX ^= EAX;
            EBP = 0;

            EAX <<= 0x1F;
            EDX &= 1;

            EBP |= ESI;
            EAX |= ECX;
            EBX = 0;
            EDX ^= EBP;
            EBX ^= EAX;

            EAX = EDX;
            EDX = EBX;
        }

        this.state0 = EAX;
        this.state1 = EDX;
    }

    this.GenerateSeeds = function() {
        for (var n = 0; n < 0x200; ++n) {
            this.GenerateSimple(this.seed);
            this.table.push(this.state0);
            this.table.push(this.state1);
        }

        var mask = 0xFFFFFFFF;
        var ESI = 0xFFFFFFFF;
        var ECX = 0;
        var EDX = 0x80000000;
        var idx = 6;
        //var EAX = EBX;

        for (var n = 3; n < 0x200; n += 7)
        {
            EBX = this.table[idx]
            EBP = this.table[idx + 1];

            EBP &= mask;
            EBX &= ESI;
            EBX |= ECX;

            this.table[idx] = EBX;

            EBX = mask;
            ESI = SHRD(ESI, EBX, 1);
            EBP |= EDX;
            ECX = SHRD(ECX, EDX, 1);
            EBX >>>= 1;

            mask = EBX;
            this.table[idx + 1] = EBP;

            EDX >>>= 1;
            EBX = ECX;

            idx += 14; // 0x38..56 / 4 = 14

            EBX |= EDX;
        }
    }

    this.Encrypt = function(x) {
        // First step uses 2 DWORD at once
        // integer result of /8 division
        var numberOfQWords = x.length >>> 3;

        // Keep a local copy
        var counter = this.counter;

        // Apply to all QWORDs
        for (var n = 0; n < numberOfQWords; ++n) {
            // Duplicates counter and shifts << 8 (all at once, << 9)
            var dupCounter = (counter & 0x1FF) << 9;
            var idx = uint32(dupCounter) + this.counter;

            var x0 = x.read(4) ^ table[idx * 2];
            var x1 = x.read(4) ^ table[idx * 2 + 1];

            // x0 ^= ([EBP + 10] = 0)
            // x1 ^= ([EBP + 14] = 0)
        }

        var remainingQwords = x.length % 8;
        if (remainingQwords) {
            //counter = this.counter << 9; // [ESP + 30]
            var idx = (counter & 0x1FF) + (this.counter << 9);

            var x0 = x.read(4) ^ table[idx * 2];
            var x1 = x.read(4) ^ table[idx * 2 + 1];
        }

        // Update packet counter
        ++this.counter;
    }

    // EAX = 80AC1937
    this.state0 = 0x80AC1937;
    // EDX = 91AB2489
    this.state1 = 0x91AB2489;

    // ARG = 01462D38
    this.seed = seed;

    // Table
    this.table = [];

    // Packet counter
    this.counter = 0;

    // Generate all
    for (var n = 0; n < 0x3D; ++n) {
        this.GenerateSeeds();
    }
}

// SEED1 = 01462D38
// STATE0 = 80AC1937
// STATE1 = 91AB2489
