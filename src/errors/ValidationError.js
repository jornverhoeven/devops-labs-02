export class ValidationError extends Error {
    /**
     * 
     * @param {string} property 
     * @param {string?} description 
     */
    constructor(property, description) {
        super(description);
        this.property = property;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}