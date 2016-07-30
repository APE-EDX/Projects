function Alive(crypto) {

    this.NewPacket = function() {
        var packet = new Packet(null, true);
        var counter = crypto.counter + 1;

        // Set header (minus length, opcode only)
        packet.write(1, 0);
        packet.write(2, counter);

        // Set body
        // TODO: When does counter reset?

        // This operation would overflow in javascript, do it in 2 parts
        // We are not interested in the low part for this algorithm
        //var prod = 0x3996B877 * counter;
        var low = 0xB877 * counter;
        var acc = (low & 0xFFFF0000) >>> 16;
        var high = (0x3996 * counter) + acc;

        //low = (low & 0x0000FFFF) | ((high & 0x0000FFFF) << 16);
        high = (high & 0xFFFF0000) >> 16;

        //low = uint32(low);
        high = uint32((high >>> 7) * 0x239);
        var counter = counter - high;

        // 1462D48
        // 14A0418
        low = this.random.table[counter * 2] ^ 1;
        high = this.random.table[counter * 2 + 1] ^ 0;

        // Set body
        packet.write(4, low);
        packet.write(4, high);
        packet.write(1, 1);
        packet.write(1, 0);

        // Encrypt packet and set opcode
        return this.crypto.Encrypt(packet);
    };

    // Random generator
    this.random = new Random(0x80B109E8, 0x91AB2489, 0x239, 0x1);
    this.crypto = crypto;
}
