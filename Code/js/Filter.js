/**
 * Class to filter data from visualization - DBL Visualization
 * Authors: Heleen van Dongen, Veerle Uhl, Quinn van Rooy, Geert Wood, Hieke van Heesch, Martijn van Kekem.
 */

 /**
  * Filter - Visualization Class
  */
 class Filter {

    /**
     * Constructor for Filter.
     * @param {String} filterAttribute The attribute name to filter.
     * @param {String} filterValue     The attribute filter value.
     * @param {String} filterOperand   The type of comparison to execute (default = equals).
     */
    constructor(filterAttribute, filterValue, filterOperand = "equals") {
        this.attribute = filterAttribute;
        this.value = filterValue;
        this.operand = filterOperand;
    }

    /**
     * Check if a value matches the filter.
     * @param {String} attributeValue The value to check.
     * @returns                       Whether the value matches the filter.
     */
    checkMatch(attributeValue) {
        switch (this.operand) {
            case "equals":
                return this.value == attributeValue;
            default:
                return false;
        }
    }
 }