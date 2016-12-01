const expect = require('chai').expect

const customFormats = require('../../../lib/validator/custom-formats')
const bgpAs = require('../../../lib/validator/custom-formats/bgp-as')
const date = require('../../../lib/validator/custom-formats/date')
const hexString = require('../../../lib/validator/custom-formats/hex-string')
const int8 = require('../../../lib/validator/custom-formats/int8')
const int16 = require('../../../lib/validator/custom-formats/int16')
const int32 = require('../../../lib/validator/custom-formats/int32')
const int64 = require('../../../lib/validator/custom-formats/int64')
const ipv4Address = require('../../../lib/validator/custom-formats/ipv4-address')
const ipv4Interface = require('../../../lib/validator/custom-formats/ipv4-interface')
const ipv4Prefix = require('../../../lib/validator/custom-formats/ipv4-prefix')
const ipv6Address = require('../../../lib/validator/custom-formats/ipv6-address')
const ipv6Interface = require('../../../lib/validator/custom-formats/ipv6-interface')
const ipv6Multicast = require('../../../lib/validator/custom-formats/ipv6-multicast')
const ipv6Prefix = require('../../../lib/validator/custom-formats/ipv6-prefix')
const netmask = require('../../../lib/validator/custom-formats/netmask')
const portNumber = require('../../../lib/validator/custom-formats/port-number')
const time = require('../../../lib/validator/custom-formats/time')
const uint8 = require('../../../lib/validator/custom-formats/uint8')
const uint16 = require('../../../lib/validator/custom-formats/uint16')
const uint32 = require('../../../lib/validator/custom-formats/uint32')
const uint64 = require('../../../lib/validator/custom-formats/uint64')
const url = require('../../../lib/validator/custom-formats/url')
const vlanId = require('../../../lib/validator/custom-formats/vlan-id')

describe('validator/custom-formats', () => {
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

  it('includes ipv6-address format', () => {
    expect(customFormats['ipv6-address']).to.equal(ipv6Address)
  })

  it('includes ipv6-interface format', () => {
    expect(customFormats['ipv6-interface']).to.equal(ipv6Interface)
  })

  it('includes ipv6-multicast format', () => {
    expect(customFormats['ipv6-multicast']).to.equal(ipv6Multicast)
  })

  it('includes ipv6-prefix format', () => {
    expect(customFormats['ipv6-prefix']).to.equal(ipv6Prefix)
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

  it('includes uint64 format', () => {
    expect(customFormats.uint64).to.equal(uint64)
  })

  it('includes url format', () => {
    expect(customFormats.url).to.equal(url)
  })

  it('includes vlan-id format', () => {
    expect(customFormats['vlan-id']).to.equal(vlanId)
  })
})
