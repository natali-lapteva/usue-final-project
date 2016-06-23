var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        var collection = this.db.collection('item');

        collection.aggregate([
            {$group: {_id: "$category", num: {$sum: 1}}},
            {$sort: {_id: 1}}
        ], function (err, categories) {
            if (err) {
                console.error(err);
                throw err;
            }

            var allSum = categories.reduce(function (sum, item) {
                return sum + item.num;
            }, 0);

            var allCategory = {
                _id: "Все",
                num: allSum
            };

            callback([allCategory].concat(categories));
        });
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";
        var query = category === 'Все' ? {} : {category};
        var collection = this.db.collection('item');

        collection
            .find(query)
            .sort({_id: 1})
            .skip(page * itemsPerPage)
            .limit(itemsPerPage)
            .toArray(function (err, items) {
                if (err) {
                    console.error(err);
                    throw err;
                }

                callback(items);
            })
    }


    this.getNumItems = function(category, callback) {
         var query = category === 'Все' ? {} : {category};
         var collection = this.db.collection('item');

         collection
             .count(query, function (err, numItems) {
                 if (err) {
                     console.error(err);
                     throw err;
                 }

                 callback(numItems);
             });
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";
        var collection = this.db.collection('item');
        collection
            .find({$text: {$search: query}})
            .sort({_id: 1})
            .skip(page * itemsPerPage)
            .limit(itemsPerPage)
            .toArray(function (err, items) {
                if (err) {
                    console.error(err);
                    throw err;
                }

                callback(items);
            });

    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;
        var collection = this.db.collection('item');
        collection
            .count({$text: {$search: query}}, function (err, numItems) {
                if (err) {
                    console.error(err);
                    throw err;
                }

                callback(numItems);
            });
    }


    this.getItem = function(itemId, callback) {
        "use strict";
        var collection = this.db.collection('item');
        collection
             .findOne({_id: itemId}, function (err, item) {
                 if (err) {
                     console.error(err);
                     throw err;
                 }

                 callback(item);
             });


    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";
        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        var collection = this.db.collection('item');
        collection.update(
            {_id: itemId},
            {$push: {reviews: reviewDoc}},
            function (err, item) {
                if (err) {
                    console.error(err);
                    throw err;
                }

                collection.findOne({_id: itemId}, function (err, item) {
                    if (err) {
                        console.error(err);
                        throw err;
                    }

                    callback(item);
                });
        });
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
