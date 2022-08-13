const Meta = require('./meta')
class MetaDAO {
    async getAll(skip=0, limit=100) {
        return Meta.find().skip(skip).limit(limit).exec()
    }
    async getByName(name, skip=0, limit=100) {
        return Meta.find({ name: { $regex: name, $options: 'i' } }).skip(skip).limit(limit).exec()
    }
    async getByImdbId(imdbId, imdbSeason, imdbEpisode) {
        return Meta.find({ imdbId, imdbSeason, imdbEpisode }).exec()
    }
    async getByKitsuId(kitsuId, kitsuEpisode) {
        return Meta.find({ kitsuId, kitsuEpisode }).exec()
    }
    async getByURL(url) {
        return Meta.findOne({ url: url }).exec()
    }
    async add(meta) {
        return (new Meta(meta)).save()
    }
    async addIfAbsent(meta) {
        let exists = await this.getByURL(meta.url)
        if (exists != null) {
            return exists
        }
        else {
            return this.add(meta)
        }
    }
    async update(meta) {
        return Meta.updateOne({ url: meta.url }, meta).exec()
    }
    async upsert(meta) {
        let exists = await this.getByURL(meta.url)
        if (exists != null) {
            console.log(`Update: ${meta.name}`)
            return this.update(meta)
        }
        else {
            console.log(`Add: ${meta.name}`)
            return this.add(meta)
        }
    }
}

module.exports = MetaDAO