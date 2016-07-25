var key = -1;

var customSend = function(socket, buf, len, flags) {
    var org = buf.string(len.get());    
    var dec = Client.decrypt(key, org);
    print(dec);
    return this.fn(socket, buf, len, flags);
}

var customRecv = function(socket, buf, len, flags) {
    var recvLen = this.fn(socket, buf, len, flags);
    var org = buf.string(recvLen.get());
    var dec = Server.decrypt(org);
    print(dec);
    return recvLen;
}

function setDetours() {
    Redirect.restoreAll();
    Redirect(Find('ws2_32.dll', 'send'), customSend);
    Redirect(Find('wsock32.dll', 'recv'), customRecv);
}

setDetours();
print('SENT');