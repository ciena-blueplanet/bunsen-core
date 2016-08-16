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

