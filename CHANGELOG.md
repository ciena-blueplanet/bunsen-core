# 0.28.3

* **Merged** in changes from `0.27.x` branch.


# 0.28.2

* **Fixed** a bug where File objects would be stripped from values

# 0.28.1
 * **Fixed** [#85](https://github.com/ciena-blueplanet/bunsen-core/issues/85)
 * **Updated** `eslint-config-frost-standard` to `6.x` and fixed lint errors.

# 0.28.0

- **Added** support for conditionally required properties
- **Added** support for tuple style arrays
- **Added** support for array models with conditional properties
- **Changed** getSubModel function

# 0.27.3

* **Fixed** a bug where File objects would be stripped from values

# 0.27.2
Please add a description of your change here, it will be automatically prepended to the `CHANGELOG.md` file.


# 0.27.1
 * **Fixed** [#85](https://github.com/ciena-blueplanet/bunsen-core/issues/85)
 * **Updated** `eslint-config-frost-standard` to `6.x` and fixed lint errors.


# 0.27.0
* UIS2 spec now includes `width` option for select

# 0.26.1

* **Fixed** regression where validation errors were misleading when supplying a string as the value for the views `cells` property.


# 0.26.0
- added 'table' renderer support to the spec

# 0.25.0
**Added** ability to specify custom conditions globally


# 0.24.1
**Added** "unless" functionality to model conditionals

# 0.24.0

* **Added** support for passthrough options (spread options). This allows new properties of downstream to be leveraged as soon as they are available, with the downside of them not being validated at the bunsen level.


# 0.23.1
**Fixed** minor issues related to the evaluation of view conditions.

# 0.23.0
Added processing of conditional cells in views. Conditions follow the same format as the ones for model properties.


# 0.22.2
**Fixed** issue where a check for required array properties was not following the recursive schema definition correctly

# 0.22.1

* Added queryForCurrentValue to select renderer options schema


# 0.22.0

* **Added** ability to drive selects via an arbitrary API endpoint.


# 0.21.4

* **Fixed** bugs where primitive arrays couldn't have more than one item added to them.


# 0.21.3

* **Added** Validation for renderer.labels for overriding checkbox-array labels



# 0.21.2
**Fixed** a recursive property check to determine if a property is required.


# 0.21.1
**Changed** empty object/array clearing to leave empty objects/arrays that are required properties of a parent object.

# 0.21.0

* **Added** more method exports to `index.js`.
* **Renamed** `getDefaultView()` to `generateView()`.



# 0.20.0

* **Upgraded** to version 6.x of `validator`.


# 0.19.2

* **Fixed** `ipv6-interface` format to not deny host of all one bits or zero bits.



# 0.19.1

* **Fixed** code to actually include new IPv6 formats.



# 0.19.0

* **Added** new formats: `ipv6-interface`, `ipv6-multicast`, and `ipv6-prefix`.


# 0.18.3

* **Removed** the processing of deletes in the `computePatch` since only `add/updates` are the only operations required.
* **Fixed** issue where a previous value of empty would cause an empty path id
* Ignored arrays since it doesn't make sense to send partial arrays


# 0.18.2
* added support for 192.168.1.5/32 (entire address is network) ipv4 prefix values.  edge case but it is valid CIDR



# 0.18.1
* **Fixed** diff computation so that any empty values are detected
* **Added** a method to generate a patch from the diff so consumers can leverage this utility


# 0.18.0

* **Added** new `forceValidation` argument to `validate` action to allow consumer to force re-validation when the value is the same.



# 0.17.0

* **Added** `hideLabel` option to cell for hiding the auto-generated label when `model` is present.
* **Added** more renderers to the v2 schema in order for validation to catch errors around those renderers.


# 0.16.8

* **Fixed** `parseVariables()` to return correct data type.



# 0.16.7

* **Fixed** validation bug where cell's `model` wasn't being applied to it's children.



# 0.16.6
* **Fixes** mac address validation


# 0.16.5

* **Fixed** bug where view generator would overwrite `cellDefinitions` by not first checking if a name was already taken.
* **Fixed** validation bug where cell wasn't being validated against proper model.


# 0.16.4
* **Fixed** Selects can be used with values other than string. This adds supports for numbers and booleans.


# 0.16.3
* **Fixed** `hasValidQuery` to return false when `populateQuery` fails on lookup.



# 0.16.2

* **Fixed** `populateQuery()` to not throw error.



# 0.16.1

* **Fixed** utility methods not to be less brittle and not throw an error when query isn't present.



# 0.16.0

* **Added** validation of the `modelType` option for select renderers.
* **Fixed** an issue where proper validation wasn't being run against root cells.


# 0.15.0

* **Added** `mac-address`, `mac-prefix`, `mac-interface` format validation.
* **Added** additional properties to the `select` renderer v2 schema

# 0.14.1

* **Fixed** issue with nested cells.


# 0.14.0
* added uint64 format validation support

# 0.13.2

* **Added** utility method to add support for square bracket array index referencing in bunsen views.


# 0.13.1

* Fixed `properties: undefined` bug when models were `evaluated`



# 0.13.0
* Introduced change-sets which can be used in `ember-frost-bunsen` to determine what values have changed
* Fix issue with validation not applying the proper empty value when defaults don't exist
* Optimized `evaluate-conditions` to avoid recursive `_.cloneDeep`


# 0.12.4

* **Added** new `clearable` option for cells to be used by facet views.


# 0.12.3

* **Fixed** bug where `label` was being dropped from `rootContainer` from v1 view being converted to v2.


# 0.12.2

* **Fixed** an issue where the first item in an array couldn't be set if the array didn't already exist.


# 0.12.1
 * **Replaced** instances of `to.be.true` and `to.be.false` with `to.be.equal(true)` and `to.be.equal(false)` because mocha/chai won't error if you have a typo in the property that's not a function (i.e. `expect(false).to.be.fooBarBaz` passes without issue, even though there's no such check as `fooBarBaz`.

# 0.12.0
object transforms now support string, boolean, number


# 0.11.3

* **Fixed** issue with container structure not being preserved by converter.


# 0.11.2
Added some missing dependencies



# 0.11.1

* **Fixed** code to actually expose `ip-address` and `ipv6-address` custom formats to consumer.



# 0.11.0

* **Added** two new formats: `ip-address` and `ipv6-address`.
* **Fixed** `ipv4-address` format to accept octets with preceding zeros.



# 0.10.2

* **Fixed** issues with converter dropping semantic containers/cells.


# 0.10.1

* **Fixed** v1 to v2 conversion.


# 0.10.0

* **Added** more tests to ensure more code is functioning as expected.
* **Fixed** bug with immutable utils `set` method and multi-dimensional arrays.
* **Replaced** some lodash method calls with native method calls in an effort to reduce our dependency on lodash when native Javascript gets the job done.


# 0.9.5

* **Fixed** issues with `unset` method and added tests to ensure method functions properly.
* Refactored reducer code to be a little bit easier to follow by splitting it up into logical modules and methods.


# 0.9.4

* **Fixed** removing last item in an array.



# 0.9.3
- Fixed ipv4-prefix format validation


# 0.9.2
Please add a description of your change here, it will be automatically prepended to the `CHANGELOG.md` file.
- The `collapsible` property will now be preserved from a container definition in v1 to v2 conversion
- Class names for containers will now be preserved in v1 to v2 conversion

# 0.9.1

* **Fixed** bug where a cell was being marked invalid when it had the `children` property but not `extends` or `model`.



# 0.9.0

* **Changed** store to use `seamless-immutable` instead of `_.cloneDeep()` for performance improvements as well as immutability.



# 0.8.0

* **Removed** remaining Ember specific code by refactoring it out to consumer.



# 0.7.2

* **Fixed** `textarea` renderer in view schema 2.



# 0.7.1

* **Fixed** some issues with validator being overly strict on format of view.


# 0.7.0
Added utility function to convert version 1 views to version 2 views.


# 0.6.0

* **Updated** validator to validate version 2 of the view schema.


# 0.5.0

* **Added** Redux actions and reducer from `ember-frost-bunsen`.
* **Added** all non-Ember utility functions from `ember-frost-bunsen`.
* **Updated** `eslint` to latest version.


# 0.4.0

* **Added** conditions evaluation from `ember-frost-bunsen`.
* **Added** generator from `ember-frost-bunsen`.
* **Added** custom formats from `ember-frost-bunsen.
* **Updated** validator code to contain latest changes from `ember-frost-bunsen`.
* **Updated** dependencies to latest versions.


# 0.3.0

* Converted source code from CommonJS to ES6 modules. Published package still includes CommonJS code under `lib` directory but now also includes the ES6 modules under a new `src` directory.



# 0.2.0
 * **Added** a new schema for v2 of bunsen views.

### What's new in bunsen views v2?
This schema isn't supported in any implementation of bunsen yet and while the schema itself is much longer, it provides the ability to write much more concise and simpler view definitions.
 * **Removed** the concept of `containers` and replaced it with `cells` that can have a `children` property (an `array` of `cells`).
 * **Replaced** the concept of `rootContainers` with a simple top-level `array` of `cells` to serve as entry-points (tabs if there is more than one)
 * **Added** the `cellDefinitions` property to the top-level of the schema, allowing for re-use of `cells`
 * **Added** an `extends` property to `cell` to allow re-use of previously defined `cellDefinitions`
 * **Added** schemas for the `options` (formerly `properties`) that can be passed into different  `renderers`




# 0.1.0
 * **Added** validator code from `ember-frost-bunsen`
