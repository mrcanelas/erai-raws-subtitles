const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MetaSchema = new Schema({
    name: {
        type: 'String',
        required: true
    },
    url: {
        type: 'String',
        required: true
    },
    language: {
        type: 'String',
        required: false
    },
    imdbId: {
        type: 'String',
        required: false
    },
    imdbSeason: {
        type: 'String',
        required: false
    },
    imdbEpisode: {
        type: 'String',
        required: false
    },
    kitsuId: {
        type: 'String',
        required: false
    },
    kitsuEpisode: {
        type: 'String',
        required: false
    },

});

const Meta = mongoose.model('Meta', MetaSchema);

module.exports = Meta
module.exports.MetaSchema = MetaSchema