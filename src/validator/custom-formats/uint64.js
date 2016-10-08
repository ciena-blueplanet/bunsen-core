import rangeFnFactory from './range-fn-factory'

const uInt64Pattern = /^(\d{1,19}|1[1-7]\d{18}|18[1-3]\d{17}|184[1-3]\d{16}|1844[1-5]\d{15}|18446[1-6]\d{14}|184467[1-3]\d{13}|1844674[1-3]\d{12}|184467440[1-6]\d{10}|1844674407[1-2]\d{9}|18446744073[1-6]\d{8}|1844674407370[1-8]\d{6}|18446744073709[1-4]\d{5}|184467440737095[1-4]\d{4}|18446744073709551[1-5]\d{2}|1844674407370955160[1-9]|1844674407370955161[1-5])$/

/**
 * Validate value as an unsigned 64-bit integer
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  return uInt64Pattern.test(`${value}`)  
}
