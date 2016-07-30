
function Packet(data) {

    this.length = function() {
        return this.writePos;
    };

    this.read = function(len) {
        var _read = function(pos) {
            switch (len) {
                case 1: return this.buffer.getUint8(pos);
                case 2: return this.buffer.getUint16(pos);
                case 3: return (this.buffer.getUint8(pos) << 16) |
                    this.buffer.getUint16(pos + 1);
                case 4: return this.buffer.getUint32(pos);
            }
        }

        var ret = _read.apply(this, [this.counter]);
        this.counter += len;
        return ret;
    };

    this.write = function(len, value) {
        var _write = function(pos) {
            switch (len) {
                case 1: return this.buffer.setUint8(pos, value);
                case 2: return this.buffer.setUint16(pos, value);
                case 3: return this.buffer.setUint8(pos, (value & 0xFF0000) >> 16) |
                    this.buffer.setUint16(pos + 1, value & 0x00FFFF);
                case 4: return this.buffer.setUint32(pos, value);
            }
        }

        var newPos = this.writePos + len;
        if (newPos > this.buffer.byteLength) {
            var newBuffer = new Uint8Array(newPos + this._accumulated);
            newBuffer.set(this.buffer.buffer);
            this.buffer = new DataView(newBuffer.buffer);
            this._accumulated *= 2;
        }

        var ret = _write.apply(this, [this.writePos]);
        this.writePos = newPos;
        return ret;
    };

    // Setup attributes
    this.buffer = new DataView(new Uint8Array(data || []).buffer);
    this.readPos = 0;
    this.writePos = this.buffer.byteLength;

    // Write expanding
    this._accumulated = 1;
}
