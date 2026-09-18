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

### Tagging Validity

`valid_start` and `valid_end` are nullable timestamps declared in
`domain-config.yaml`. NULL means unbounded; finite endpoints are inclusive.
Existing tagging queries return these fields without changing their filters.

```javascript
await Agent.query(
  'taggings-for-tag-in-range',
  [partition, tagId, '2026-09-01T00:00:00Z', '2026-09-30T23:59:59Z'],
  'tags.knowlearning.systems'
)
```

The range query requires boolean `true` and full coverage of the requested
interval. Equal timestamps check an instant; NULL query bounds require an
unbounded tagging on that side. Reversed intervals return no rows.

Include `valid_start` and `valid_end` alongside `partition`, `value`, and any
`context` in the existing `tags[tagId][target]` write. Anyone allowed to set the
tagging can set its range. Omitted dates are preserved; NULL clears them.
The site uses the dates from its existing tagging query to display local times,
active dates in green, and expired ends in red.
