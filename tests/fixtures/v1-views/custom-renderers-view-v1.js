module.exports = {
  type: 'form',
  version: '1.0',
  containers: [
    {
      id: 'foo',
      rows: [[
        {
          renderer: 'select'
        }
      ]]
    },
    {
      id: 'bar',
      rows: [
        [
          {
            container: 'barChild1'
          },
          {
            container: 'barChild2'
          }
        ]
      ]
    },
    {
      id: 'barChild1',
      rows: [
        [{
          model: 'barChild1',
          render: 'textArea'
        }]
      ]
    },
    {
      id: 'barChild2',
      rows: [
        [{
          model: 'barChild2',
          container: 'barGrandChildren'
        }]
      ]
    },
    {
      id: 'barGrandChildren',
      rows: [
        [{
          model: 'barGrandChild',
          renderer: 'custom1'
        }],
        [{
          model: 'barOtherGrandChild',
          renderer: 'custom2'
        }]
      ]
    },
    {
      id: 'baz',
      rows: [[{
        model: 'baz',
        renderer: 'custom-renderer',
        properties: {
          someProp: 45,
          otherProp: false
        }
      }]]
    }
  ],
  rootContainers: [
    {
      container: 'foo',
      model: 'foo'
    },
    {
      container: 'bar',
      model: 'bar'
    },
    {
      container: 'baz',
      model: 'baz'
    }
  ]
}
