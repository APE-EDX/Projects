// Some counters
var fakeAll = true;
var sendNumber = 1;
var recvNumber = 0;

// Send detour
var customSend = function(socket, bufs, count, bytes, flags, overlapped, completion) {
    // Get the send length and buffer
    var len = bufs.value.get();
    var buf = Ptr(bufs.get(), ptrSize()).value;
    var str = buf.string(len);

    // Print some information
    print(sendNumber + ". Send= (" + len + ") : " + buf.read(0) + ": " + 
        buf.read(4) + " . " + buf.read(8));
    ++sendNumber;

    // Call original function
    if (!fakeAll || sendNumber < 3) {
        return this.fn(socket, bufs, count, bytes, flags, overlapped, completion);
    }

    // Fake everything. Set the bytes sent to len and return 0 (no error)
    bytes.value = len;
    SetLastError.fn(0);
    return 0;
}

// Is the WSARecv operation is put off, store the references
var shouldOverlap = false;
var overlappedBuffer = null;
var customRecv = function(socket, bufs, count, bytes, flags, overlapped, completion) {
    // Save overlapped first, just in case
    var buf = bufs.read(ptrSize());
    overlappedBuffer = buf;
    shouldOverlap = overlapped;

    // Default return value (-1, error)
    var ret = -1;

    // Call original only if it is during the handshake process (2 packets)
    if (!fakeAll || recvNumber < 2) {
        ret = this.fn(socket, bufs, count, bytes, flags, overlapped, completion);

        // If result is not -1, it was received fine
        if (uint32(ret.get()) != -1) {
            // Simply fetch and print
            shouldOverlap = false;
            print(ret + " " + ret.get());
            if (isHandshake) {
                var len = bytes.value.get();
                print("Recv (" + len + ")=" + buf.read());
            }
        }
        else {
            // The operation will overlap
            print('Should overlap: ' + overlapped);
        }

        ++recvNumber;
    }
    else {
        // Fake the operation will overlap by setting the last error
        print('Set last error');
        SetLastError.fn(997); // WSA_IO_PENDING
    }

    return ret;
}

// GetQueuedCompletionStatus detour
var customOverlapped = function(handle, bytes, key, overlappedPtr, time) {
    // Call original function (block inf)
    var ret = this.fn(handle, bytes, key, overlappedPtr, -1);
    
    // Get the object that was completed
    var overlapped = overlappedPtr.read();

    // If return was TRUE and the object is the overlapped one
    if (ret.get() && shouldOverlap.get() == overlapped.get()) {
        // Read the buffer and print
        print("OverlappedRecv (" + bytes.read() + ")=" + overlappedBuffer.read());
    }
    
    // Return
    return ret;
}

// Hook SetLastError to be able to manually call it
var customSetLastError = function(error) {
    return this.fn(error);
}

// Setup all hooks
Redirect(Find('ws2_32.dll', 'WSASend'), customSend);
Redirect(Find('ws2_32.dll', 'WSARecv'), customRecv);
Redirect(Find('kernel32.dll', 'GetQueuedCompletionStatus'), customOverlapped);
var SetLastError = 
    Redirect(Find('kernel32.dll', 'SetLastError'), customSetLastError);

print('SENT ' + ptrSize());