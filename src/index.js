import {
  dereference as _dereference,
  dereferenceSubSchema,
  getPath,
  processRef,
  recurse
} from './dereference'

export const dereference = {
  dereference: _dereference,
  dereferenceSubSchema,
  getPath,
  processRef,
  recurse
}

import {
  doesModelContainRequiredField,
  findValue,
  getInitialValue,
  getLabel,
  getModelPath,
  getSubModel,
  hasValidQueryValues,
  parseVariables,
  populateQuery
} from './utils'

export const utils = {
  doesModelContainRequiredField,
  findValue,
  getInitialValue,
  getLabel,
  getModelPath,
  getSubModel,
  hasValidQueryValues,
  parseVariables,
  populateQuery
}

export {default as validator} from './validator'
