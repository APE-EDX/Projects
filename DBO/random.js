var Random = function(seed) {

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

    // EAX = 80AC1937
    this.state0 = 0x80AC1937;
    // EDX = 91AB2489
    this.state1 = 0x91AB2489;

    // ARG = 01462D38
    this.seed = seed;

    // Table
    this.table = [];

    // Generate all
    for (var n = 0; n < 0x3D; ++n) {
        this.GenerateSeeds();
    }
}
