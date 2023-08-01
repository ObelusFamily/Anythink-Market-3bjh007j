var mongoose = require("mongoose");
const { sendEvent } = require("../lib/event");
require("dotenv").config();
var isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
    console.log('Do not seed in production');
    return 1;
}

if (!process.env.MONGODB_URI) {
    console.warn("Missing MONGODB_URI in env, please add it to your .env file");
}
  
mongoose.connect(process.env.MONGODB_URI);
mongoose.set("debug", true);

require("../models/User");
require("../models/Item");
require("../models/Comment");

var Item = mongoose.model("Item");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");

async function seedData() {
    try {
        Comment.deleteMany();
        Item.deleteMany();
        User.deleteMany();
        
        for (let i = 1; i < 101; i++) {
            const user = new User({
                username: `user${i}`,
                email: `user-${i}@example.com`,
                setPassword: `seeded password ${i} change-me`,
            });

            user.save()
                .then(function(storedUser) {
                    sendEvent('user_created', {username: storedUser.username});

                    const item = new Item({
                        title: `${i} Rare AnyItem`,
                        slug: `${i}-rare-any-item`,
                        description: `A rare item with ${i} inscribed`,
                    });

                    item.save()
                        .then(function (storedItem) {
                            sendEvent('item_created', { item: itemData });

                            const comment = new Comment({
                                body: `This definitely is a rare item, just missing this one.`,
                                item: storedItem._id,
                                seller: user._id,
                            });

                            comment.save()
                                .then(function(storedItem) {
                                    storedItem.comments = storedItem.comments.concat([comment]);
                                    storedItem.save();
                                });
                        });
                });
        }
    } catch(err) {
        console.error(err.stack);
    }
}

seedData();

mongoose.connection.close();