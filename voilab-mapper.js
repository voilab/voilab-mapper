/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    /**
     * Mapping function
     *
     * @param {Object} record
     * @param {Object|Function} mapper
     * @param {Object} options
     * @returns {Object}
     */
    var map = function (record, mapper, options) {
        var lodash = require('lodash'),
            mapper_supplementary_args = Array.prototype.slice.call(arguments, 3);

        options = lodash.merge({
            strict: false,
            recurseOnBaseRecord: false
        }, (options || {}));

        if (lodash.isArray(record)) {
            return lodash.map(record, function (u) {
                return map.apply(map, [u, mapper, options].concat(mapper_supplementary_args));
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
            var callback_result;

            if (value === true) {
                if (options.strict && record[key] === undefined) {
                    return true;
                }
                acc[key] = record[key];
                return true;
            }
            if (lodash.isString(value)) {
                if (record) {
                    if (lodash.isFunction(record[value])) {
                        callback_result = record[value]();
                        if (options.strict && callback_result === undefined) {
                            return true;
                        }
                        acc[key] = callback_result;
                    } else {
                        if (options.strict && lodash.get(record, value) === undefined) {
                            return true;
                        }
                        lodash.set(acc, key, lodash.get(record, value, null));
                    }
                }
                return true;
            }
            if (lodash.isFunction(value)) {
                callback_result = value(record);
                if (options.strict && (callback_result === undefined || (lodash.isObject(callback_result) && lodash.isEmpty(callback_result)))) {
                    return true;
                }
                acc[key] = callback_result;
                return true;
            }


            // recursion
            if (lodash.isObject(value)) {
                callback_result = map((options.recurseOnBaseRecord ? record : record[key]), value, options);
                if (options.strict && (callback_result === undefined || lodash.isEmpty(callback_result))) {
                    return true;
                }
                acc[key] = callback_result;
            }
        }, {});
    };

    module.exports = map;
}());