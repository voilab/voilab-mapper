/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    /**
     * Mapping function
     *
     * @param {Object} record
     * @param {Object|Function} mapper
     * @returns {Object}
     */
    var map = function (record, mapper) {
        var lodash = require('lodash'),
            mapper_supplementary_args = Array.prototype.slice.call(arguments, 2);

        if (lodash.isArray(record)) {
            return lodash.map(record, function (u) {
                return map.apply(map, [u, mapper].concat(mapper_supplementary_args));
            });
        }

        if (!lodash.isObject(record)) {
            return record;
        }

        // you can provide a function as the mapper.
        // if you do so, the mapper is called with the record as the first parameter and all subsequent provided parameters coming after
        // this way, the mapper can be changed accordingly with the record content
        if (lodash.isFunction(mapper)) {
            mapper = mapper.apply(mapper, [record].concat(mapper_supplementary_args));
        }

        return lodash.transform(mapper, function (acc, value, key) {
            if (value === true) {
                acc[key] = record[key];
                return true;
            }
            if (lodash.isString(value)) {
                if (record) {
                    lodash.set(acc, key, lodash.get(record, value, null));
                }
                return true;
            }
            if (lodash.isFunction(value)) {
                acc[key] = value(record);
                return true;
            }


            // recursion
            if (lodash.isObject(value)) {
                acc[key] = map(record[key], value);
            }
        }, {});
    };

    module.exports = map;
}());