var Server = {
    decrypt: function(org) {
        var dec = "";

        if (!isGame()) {
            for (var i = 0; i < org.length; ++i) {
                dec += char(org.charCodeAt(i) - 0xF);
            }
        }
        else {
            dec = phase2(org);
        }

        return dec;
    }
};

print('SERVER');
