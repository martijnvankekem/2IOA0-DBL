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
     * @param {Array}  filterValues    The attribute filter values.
     * @param {String} filterKind      The attribute filter kind.
     * @param {String} filterOperand   The type of comparison to execute (default = equals).
     */
    constructor(filterAttribute, filterValues, filterKind = "all", filterOperand = "equals") {
        this.attribute = filterAttribute;
        this.values = filterValues;
        this.kind = filterKind;
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
                return this.values.includes(attributeValue);
            default:
                return false;
        }
    }
 }