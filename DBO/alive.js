function Alive(crypto) {

    this.Generate() {

    };

    this.NewPacket() {
        var packet = new Packet();

        // Set header (minus opcode)
        packet.write(2, crypto.counter);

        // Set body
        // TODO: 52 bits limit
        // TODO: When does counter reset?
        var prod = 0x3996B877 * crypto.counter;

        var low = uint32(prod);
        var high = ((prod >> 32) >> 7) * 0x239;
        var counter = crypto.counter - high;

        // 1462D48
        // 14A0418
        low = low ^ this.random.table[counter * 2] ^ 1;
        high = high ^ this.random.table[counter * 2 + 1] ^ 0;

        // Set body
        packet.write(4, low);
        packet.write(4, high);
        packet.write(4, 1);
        packet.write(4, 0);

        // Encrypt packet and set opcode
        return this.crypto.Encrypt(packet, 0xD);
    };

    this.random = new Random(0x666);
    this.crypto = crypto;
    this.Generate();
}
