class Post {
    constructor(options) {
        const defaults = {
            id: "",
            userId: "",
            content: "",
            imageUrl: "",
            postDate: current_date,
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