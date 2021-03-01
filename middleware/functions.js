exports.checkForm = (inputs) => {
    let result = true;
    let invalidElements = {};
    for (let property in inputs) {
        let regExTest = "";
        let returnMsg = "";
        switch(inputs[property].type) {
            case "text": 
            //Les textes doivent contenir des caractères alphanumériques, apostrophe et espace, et ne pas être vides
            regExTest = /^[a-zA-Z \-']+$/;
            returnMsg = "Ce champ ne peut pas être vide.";
            break;
            case "email":
            //Les emails doivent avoir une structure d'email blabla@bla.bla
            regExTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            returnMsg = "Veuillez rentrer une adresse email valide.";
            break;
            case "password":
            //Les mots de passe doivent contenir au moins 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
            regExTest = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            returnMsg = "Minimum 8 caractères et tous les caractères ci-dessous.";
            break;
            default: 
            regExTest = /^[a-zA-Z0-9]*$/;
            returnMsg = "";
            break;
        }
        if (!regExTest.test(inputs[property].value)) {
            invalidElements[property] = returnMsg;
            result = false;
        }
    }
    const resultat = {"valid": result, "elements": invalidElements};
    return resultat;
}