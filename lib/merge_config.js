define([], function() {
	"use strict";

	return {
		melindaUtils: {
			asteri: {
				Xendpoint: 'http://localhost:8080/melinda.kansalliskirjasto.fi/X' 
			}
		},
		merge: {
			fields: {
				"010": { "action": "copy" },
				"014": { "action": "copy" },
				"015": { "action": "copy" },
				"019": { "action": "copy" },
				"020": { "action": "moveSubfields", "options": { "subfields": ["z","c"] } },
				"022": { "action": "copy" },
				"024": { "action": "copy" },
				"027": { "action": "copy" },
				"028": { "action": "copy" },
				"033": { "action": "copy" },
				"039": { "action": "copy" },
				"045": { "action": "copy" },
				"050": { "action": "copy" },
				"060": { "action": "copy" },
				"072": { "action": "copy" },
				"08.": { "action": "moveSubfields", "options": { "subfields": ["9"] } },
				"246": { "action": "copy" },
				"490": { "action": "copy" },
				"5..": { "action": "moveSubfields", "options": { "subfields": ["9"] } },
				"6..": { "action": "moveSubfields", "options": { "subfields": ["9"] } },
				"600": { "action": "copy", "options": { "compareWithout": ["9","e","4"] } },
				"610": { "action": "copy", "options": { "compareWithout": ["9","e","4"] } },
				"611": { "action": "copy", "options": { "compareWithout": ["9","e","4"] } },
				"7..": { "action": "copy", "options": { "compareWithout": ["9","e","4"] } },
				"830": { "action": "copy" },
				"852": { "action": "copy" },
				"856": { "action": "copy" },
				"866": { "action": "copy" },
				"9..": { "action": "copy", "options": { "compareWithout": ["9"] } }
			}
		}
	};
});