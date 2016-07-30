function Alive(crypto) {

    this.Generate() {

    };

    this.NewPacket() {
        var packet = new Packet();

        // Set header (minus opcode)
        packet.write(2, crypto.counter);

        // Set body
        var prod = 0x3996B877 * this.counter;

        var low = uint32(prod);
        var high = ((prod >> 32) >> 7) * 0x239;
        var counter = this.counter - high;

        // 1462D48
        // 14A0418
        low = low ^ this.table[counter] ^ 1;
        high = high ^ this.table[counter + 1] ^ 0;

        // Set body
        packet.write(4, low);
        packet.write(4, high);
        packet.write(4, 1);
        packet.write(4, 0);

        // Increment
        ++this.counter;

        // Encrypt packet and set opcode
        return this.crypto.Encrypt(packet, 0xD);
    };

    this.crypto = crypto;
    this.Generate();
}
