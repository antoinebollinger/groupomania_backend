class User {
    constructor(options) {
        const defaults = {
            id: "",
            email: "",
            password: "",
            firsName: "",
            lastName: "",
            imageUrl: "zero.png",
            admin: false,
            deleted: false
        };
        const populated = Object.assign(defaults, options);
        for (const key in populated) {
            if (populated.hasOwnProperty(key)) {
                this[key] = populated[key];
            }
        }
    }
}

module.exports = User;