class Comment {
    constructor(options) {
        const defaults = {
            id: "",
            postId: "",
            userId: "",
            content: "",
        };
        const populated = Object.assign(defaults, options);
        for (const key in populated) {
            if (populated.hasOwnProperty(key)) {
                this[key] = populated[key];
            }
        }
    }
}

module.exports = Comment;