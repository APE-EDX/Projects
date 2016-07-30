
function Packet(data, isTemp) {

    this.toString = function() {
        return this.id() || "Packet " + this._num + " [" + this.length() + "]";
    }

    this.id = function() {
        return null;
    }

    this.length = function() {
        return this.buffer.getUint16(0, true) & 0x7FFF;
    };

    this.bufferLength = function() {
        return this.writePos;
    }

    this.read = function(len) {
        var _read = function(pos) {
            switch (len) {
                case 1: return this.buffer.getUint8(pos, true);
                case 2: return this.buffer.getUint16(pos, true);
                case 3: return (this.buffer.getUint8(pos, true) << 16) |
                    this.buffer.getUint16(pos + 1);
                case 4: return this.buffer.getUint32(pos, true);
            }
        }

        var ret = _read.apply(this, [this.readPos]);
        this.readPos += len;
        return ret;
    };

    this.write = function(len, value) {
        var _write = function(pos) {
            switch (len) {
                case 1: return this.buffer.setUint8(pos, value, true);
                case 2: return this.buffer.setUint16(pos, value, true);
                case 3: return this.buffer.setUint8(pos, (value & 0xFF0000) >> 16, true) &&
                    this.buffer.setUint16(pos + 1, value & 0x00FFFF, true);
                case 4: return this.buffer.setUint32(pos, value, true);
            }
        }

        var newPos = this.writePos + len;
        if (newPos > this.buffer.byteLength) {
            var newBuffer = new Uint8Array(newPos + this._accumulated);
            newBuffer.set(new Uint8Array(this.buffer.buffer));
            this.buffer = new DataView(newBuffer.buffer);

            // Do not over allocate
            if (this._accumulated < 32) {
                this._accumulated *= 2;
            }
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

    // Save packet number
    this._num = Packet.num;

    // Increment counter
    !isTemp && (++Packet.num);
}

// Default to 1 as first packet
Packet.num = 1;
