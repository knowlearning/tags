# KnowLearning Tagging

## Usage

### Creating and Removing Tags

```javascript
const tags = await Agent.state('tags')

const tagId = 'dacc9090-1c56-11f0-a9d9-670bacd2d69b'
const itemToTagId = '31f98ad0-381d-11f0-bf81-df92c6aad829'
const partition = 'Public Tags'

if (!tags[tagId]) tags[tagId] = {}

tags[tagId][itemToTagId] = { partition, value: true }

//  To remove
tags[tagId][itemToTagId] = { partition, value: null }
```

### Consuming Tags

```javascript
// Get all tags an item has been tagged with
const partition = 'Public Tags'
const target = '31f98ad0-381d-11f0-bf81-df92c6aad829'
await Agent.query('taggings-for-target', [partition, target], 'tags.knowlearning.systems')

// Get items tagged by a set of tags
const partition = 'Public Tags'
const tagSet = [
  'b0926ed0-0d0c-11ef-bdf5-877c72019f04',
  'dacc9090-1c56-11f0-a9d9-670bacd2d69b'
]
const itemsTagged = await Agent.query('taggings-intersection', [partition, tagSet], 'tags.knowlearning.systems')
// returns: [{target: '08b37440-0cbf-11ef-9008-15cef562b52e'}]
```