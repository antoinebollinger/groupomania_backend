class User {
    constructor(options) {
        const defaults = {
            email: "",
            password: "",
            firsName: "",
            lastName: "",
            image: "zero.png",
            admin: false
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