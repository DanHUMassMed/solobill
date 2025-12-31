export const ValidationRules = {
  email: (value) => {
    if (!value) return true; // Optional field or handled by required check
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) || 'Invalid email format';
  },
  required: (value, fieldName) => {
    return (value && value.toString().trim().length > 0) || `${fieldName} is required`;
  },
  numeric: (value, fieldName) => {
    return (!isNaN(parseFloat(value)) && isFinite(value)) || `${fieldName} must be a number`;
  }
};

export const ConsultantValidator = {
  validate(data) {
    const errors = {};
    const nameCheck = ValidationRules.required(data.name, 'Full Name');
    const addrCheck = ValidationRules.required(data.addressL1, 'Address Line 1');
    const emailCheck = ValidationRules.required(data.email, 'Email');
    const emailFormat = ValidationRules.email(data.email);

    if (nameCheck !== true) errors.name = nameCheck;
    if (addrCheck !== true) errors.addressL1 = addrCheck;
    if (emailCheck !== true) errors.email = emailCheck;
    else if (emailFormat !== true) errors.email = emailFormat;

    return { isValid: Object.keys(errors).length === 0, errors };
  }
};

export const ClientValidator = {
  validate(data) {
    const errors = {};
    const nameCheck = ValidationRules.required(data.name, 'Client Name');
    const addrCheck = ValidationRules.required(data.addressL1, 'Address Line 1');
    const contactCheck = ValidationRules.required(data.contactNm, 'Contact Name');
    const emailFormat = ValidationRules.email(data.billingRepEmail);

    if (nameCheck !== true) errors.name = nameCheck;
    if (addrCheck !== true) errors.addressL1 = addrCheck;
    if (contactCheck !== true) errors.contactNm = contactCheck;
    if (emailFormat !== true) errors.billingRepEmail = emailFormat;

    return { isValid: Object.keys(errors).length === 0, errors };
  }
};

export const ProjectValidator = {
  validate(data) {
    const errors = {};
    const clientCheck = ValidationRules.required(data.clientId, 'Client');
    const nameCheck = ValidationRules.required(data.name, 'Project Name');
    const rateCheck = ValidationRules.required(data.contractingRate, 'Rate');
    const rateNumeric = ValidationRules.numeric(data.contractingRate, 'Rate');

    if (clientCheck !== true) errors.clientId = clientCheck;
    if (nameCheck !== true) errors.name = nameCheck;
    if (rateCheck !== true) errors.contractingRate = rateCheck;
    else if (rateNumeric !== true) errors.contractingRate = rateNumeric;

    return { isValid: Object.keys(errors).length === 0, errors };
  }
};
