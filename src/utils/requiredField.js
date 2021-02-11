import { ValidationError } from "../errors";

export default function requiredField(fieldName) {
    throw new ValidationError(fieldName, `field ${fieldName} cannot be 'null' or 'undefined'`);
}