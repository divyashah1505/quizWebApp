const val = require("../../middleware/index");

async function registerValidation(req, res, next) {
  const validationRule = {
    username: "required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z]).+$/",
    email: "required_without:mobile|string|email|min:4|max:255",
    mobile: "required_without:email|numeric|digits_between:10,15",
    password:
      "required|min:8|max:50|regex:/[A-Z]/|regex:/[0-9]/|regex:/[@$!%*#?&]/",
  };
  
  const customMessages = {
    "required_without.email": "Either email or mobile number is required.",
    "required_without.mobile": "Either email or mobile number is required.",
  };

  val.validatorUtilWithCallback(validationRule, customMessages, req, res, next);
}


module.exports = { 
  registerValidation, 
}