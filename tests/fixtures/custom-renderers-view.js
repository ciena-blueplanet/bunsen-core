module.exports = {
  type: 'form',
  version: '2.0',
  cellDefinitions: {
    foo: {
      renderer: {
        name: 'select'
      }
    },
    bar: {
      children: [
        {
          extends: 'barChild1'
        },
        {
          extends: 'barChild2'
        }
      ]
    },
    barChild1: {
      model: 'barChild1',
      renderer: {
        name: 'textarea'
      }
    },
    barChild2: {
      model: 'barChild2',
      children: [
        {
          extends: 'barGrandChild'
        },
        {
          extends: 'barOtherGrandChild'
        }
      ]
    },
    barGrandChildren: {
      children: [
        {
          extends: 'barGrandChild'
        },
        {
          extends: 'barOtherGrandChild'
        }
      ]
    },
    barGrandChild: {
      model: 'barGrandChild',
      renderer: {
        name: 'custom1'
      }
    },
    otherGrandChild: {
      model: 'barOtherGrandChild',
      renderer: {
        name: 'custom2'
      }
    },
    baz: {
      model: 'baz',
      renderer: {
        name: 'custom-renderer',
        someProp: 45,
        otherProp: false
      }
    }
  },
  cells: [
    {
      extends: 'foo',
      model: 'foo'
    },
    {
      extends: 'bar',
      model: 'bar'
    }
  ]
}
