import validator from 'validator'

export default function (value) {
  try {
    return validator.isMACAddress(value)
  } catch (err) {
    return false
  }
}
