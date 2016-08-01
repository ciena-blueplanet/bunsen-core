module.exports = {
  type: 'form',
  version: '1.0',
  containers: [
    {
      id: 'uncollapsed-rows',
      rows: [
        [
          {
            model: 'item-1-1'
          }, {
            model: 'item-1-2'
          }, {
            model: 'item-1-3'
          }
        ], [
          {
            model: 'item-2-1'
          }
        ], [
          {
            model: 'item-3-1'
          },
          {
            model: 'item-3-2'
          },
          {
            model: 'item-3-3'
          },
          {
            model: 'item-3-4'
          }
        ]
      ]
    },
    {
      id: 'one-row-collapse',
      rows: [[{
        model: 'item-1'
      }, {
        model: 'item-2'
      }, {
        model: 'item-3'
      }, {
        model: 'item-4'
      }]]
    },
    {
      id: 'multi-row-collapse',
      rows: [[{
        model: 'item-1'
      }], [{
        model: 'item-2'
      }], [{
        model: 'item-3'
      }], [{
        model: 'item-4'
      }]]
    }
  ],
  rootContainers: [
    {
      container: 'uncollapsed-rows'
    },
    {
      container: 'one-row-collapse'
    },
    {
      container: 'multi-row-collapse'
    }
  ]
}
