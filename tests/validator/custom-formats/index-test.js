const expect = require('chai').expect

const customFormats = require('../../../lib/validator/custom-formats')
const bgpAs = require('../../../lib/validator/custom-formats/bgp-as').default
const date = require('../../../lib/validator/custom-formats/date')
const hexString = require('../../../lib/validator/custom-formats/hex-string')
const int8 = require('../../../lib/validator/custom-formats/int8').default
const int16 = require('../../../lib/validator/custom-formats/int16').default
const int32 = require('../../../lib/validator/custom-formats/int32').default
const int64 = require('../../../lib/validator/custom-formats/int64')
const ipv4Address = require('../../../lib/validator/custom-formats/ipv4-address').default
const ipv4Interface = require('../../../lib/validator/custom-formats/ipv4-interface').default
const ipv4Prefix = require('../../../lib/validator/custom-formats/ipv4-prefix').default
const netmask = require('../../../lib/validator/custom-formats/netmask')
const portNumber = require('../../../lib/validator/custom-formats/port-number')
const time = require('../../../lib/validator/custom-formats/time').default
const uint8 = require('../../../lib/validator/custom-formats/uint8').default
const uint16 = require('../../../lib/validator/custom-formats/uint16').default
const uint32 = require('../../../lib/validator/custom-formats/uint32').default
const url = require('../../../lib/validator/custom-formats/url')
const vlanId = require('../../../lib/validator/custom-formats/vlan-id').default

describe('custom formats', () => {
  it('includes bgp-as format', () => {
    expect(customFormats['bgp-as']).to.equal(bgpAs)
  })

  it('includes date format', () => {
    expect(customFormats.date).to.equal(date)
  })

  it('includes hex-string format', () => {
    expect(customFormats['hex-string']).to.equal(hexString)
  })

  it('includes int8 format', () => {
    expect(customFormats.int8).to.equal(int8)
  })

  it('includes int16 format', () => {
    expect(customFormats.int16).to.equal(int16)
  })

  it('includes int32 format', () => {
    expect(customFormats.int32).to.equal(int32)
  })

  it('includes int64 format', () => {
    expect(customFormats.int64).to.equal(int64)
  })

  it('includes ipv4-address format', () => {
    expect(customFormats['ipv4-address']).to.equal(ipv4Address)
  })

  it('includes ipv4-interface format', () => {
    expect(customFormats['ipv4-interface']).to.equal(ipv4Interface)
  })

  it('includes ipv4-prefix format', () => {
    expect(customFormats['ipv4-prefix']).to.equal(ipv4Prefix)
  })

  it('includes netmask format', () => {
    expect(customFormats.netmask).to.equal(netmask)
  })

  it('includes port-number format', () => {
    expect(customFormats['port-number']).to.equal(portNumber)
  })

  it('includes time format', () => {
    expect(customFormats.time).to.equal(time)
  })

  it('includes uint8 format', () => {
    expect(customFormats.uint8).to.equal(uint8)
  })

  it('includes uint16 format', () => {
    expect(customFormats.uint16).to.equal(uint16)
  })

  it('includes uint32 format', () => {
    expect(customFormats.uint32).to.equal(uint32)
  })

  it('includes url format', () => {
    expect(customFormats.url).to.equal(url)
  })

  it('includes vlan-id format', () => {
    expect(customFormats['vlan-id']).to.equal(vlanId)
  })
})
