import {
  CHANGE,
  CHANGE_MODEL,
  CHANGE_VALUE,
  CHANGE_VIEW,
  VALIDATION_RESOLVED,
  change,
  changeModel,
  changeValue,
  changeView,
  updateValidationResults,
  validate
} from './actions'

export const actions = {
  CHANGE,
  change,
  CHANGE_MODEL,
  changeModel,
  CHANGE_VIEW,
  changeView,
  CHANGE_VALUE,
  changeValue,
  updateValidationResults,
  validate,
  VALIDATION_RESOLVED
}

import {
  computePatch,
  getChangeSet,
  traverseObjectLeaf
} from './change-utils'

export const changeUtils = {
  computePatch,
  getChangeSet,
  traverseObjectLeaf
}

export {normalizeView, viewV1ToV2} from './conversion'

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

import './typedefs'

export {default as generateView} from './generator'
export {default as reducer} from './reducer'

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

import * as path from './utils/path'

export const utils = {
  doesModelContainRequiredField,
  findValue,
  getInitialValue,
  getLabel,
  getModelPath,
  getSubModel,
  hasValidQueryValues,
  parseVariables,
  populateQuery,
  path
}

export {default as validateView, validateModel} from './validator'
export {getCellDefaults} from './validator/defaults'
