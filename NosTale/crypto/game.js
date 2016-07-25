var Client = {
    decrypt: function(key, org) {
        var dec = "";

        if (!isGame()) {
            for (var i = 0; i < org.length; ++i) {
                dec += char((org.charCodeAt(i) - 0xF) ^ 0xC3);
            }
        }
        else {
            if (key == 0) {
            }
            else if (key == 1){
            }
            else if (key == 2){
            }
            else if (key == 3){
            }
            else {
                for (var i = 0; i < org.length; ++i) {
                    dec += char(org.charCodeAt(i) - 0xF);
                }
            }
        }

        return dec;
    }
};

print('CLIENT');