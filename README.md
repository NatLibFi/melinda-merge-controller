# Integrates bunch of modules to handle record checking and merging in Melinda union catalogue

**DEPRECATED: See Melinda deduplication repositories:**

https://github.com/natlibfi/melinda-deduplication-validate

https://github.com/NatLibFi/melinda-deduplication-merge

https://github.com/NatLibFi/melinda-deduplication-datastore

https://github.com/NatLibFi/melinda-deduplication-listener

## Installation

```
npm install melinda-merge-controller
```

## Usage


```
var MelindaMerger = require('melinda-merge-controller');

var melindaMerger = new MelindaMerger(config);

```

config should be in following format:
```
{
	classifierStrategy: "strategty to be passed to marc-record-contrast/marc-record-rank"
	merge: "config to be passed to marc-record-merge"
	similarity: "config to be passed to marc-record-similarity"
	melindautils: "config to be passed to marc-record-merge-melindautils"
	
}
```

To validate that 2 records are duplicate and create a merged version of the record, run mergeRecords
```

melindaMerger.mergeRecords(record1, record2).then(function(result) {
	/* result is in following format:
		{
			records: record1 and record2 classified,
			merged: mergedRecord
		}
	*/
})
```

The records are in marc-record-js format. There is some additional metadata about what fields of the source records have been used to create the mergedRecord.

## License and copyright

Copyright (c) 2015, 2017 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Affero General Public License Version 3** or any later version.

