function Call(database) {
    "use strict";

    this.db = database;


    this.createCall = function(call, callback) {
        "use strict";

        this.db.collection('call').insertOne(call, function (err, userCart) {
            if (err) {
                console.error(err);
                throw err;
            }

            callback(userCart);
        });

    }
}


module.exports.Call = Call;
