class Post {
    constructor(options) {
        const defaults = {
            id: "",
            postId: "",
            userId: "",
            value: 1,
        };
        const populated = Object.assign(defaults, options);
        for (const key in populated) {
            if (populated.hasOwnProperty(key)) {
                this[key] = populated[key];
            }
        }
    }
}

module.exports = Post;