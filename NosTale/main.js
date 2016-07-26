var num = -1;
var key = -1;
var sessId = false;

var customSend = function(socket, buf, len, flags) {
    var org = buf.string(len.get());
    var dec = Client.decrypt(num, key, org);
    print('Send (' + dec.length + ' - ' + dec[0].length + '): ' + dec);

    if (isGame() && key == -1) {
        num = uint8(((sessId >> 6) & 0xFF) & 0x80000003);
        key = uint8(sessId & 0xFF);
        print("(Num,Key)=(" + num + "," + key + ")");
    }

    return this.fn(socket, buf, len, flags);
}

var customRecv = function(socket, buf, len, flags) {
    var recvLen = this.fn(socket, buf, len, flags);
    var org = buf.string(recvLen.get());
    var dec = Server.decrypt(org);

    print('Recv (' + dec.length + '): ');

    var tokens = dec[0].split(' ');
    if (!isGame() && tokens.length >= 2) {
        sessId = parseInt(tokens[1]);
        key = num = -1;
        print('SessionID: ' + sessId);
    }

    return recvLen;
}

function setDetours() {
    Redirect.restoreAll();
    Redirect(Find('ws2_32.dll', 'send'), customSend);
    Redirect(Find('wsock32.dll', 'recv'), customRecv);
}

setDetours();
print('SENT');
