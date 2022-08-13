const { addonBuilder } = require("stremio-addon-sdk");
const MetaDAO = require("./lib/meta-dao");
const { hasImdbMapping } = require("./lib/metadataEnrich");
const { ImdbToKistu } = require("./lib/utils");

const manifest = {
  id: "community.EraiRaws",
  version: "0.0.1",
  catalogs: [],
  resources: ["subtitles"],
  types: ["movie", "series"],
  name: "Erai-Raws Subtitles",
  description: "",
};
const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(({ type, id, extra }) => {
	const metaDao = new MetaDAO();
	if (id.match(/^tt\d+:\d+:\d+$/)) {
	  const [imdbId, imdbSeason, imdbEpisode] = id.split(":");
	  return metaDao.getByImdbId(imdbId, imdbSeason, imdbEpisode).then(async (metas) => {
		if (metas.length > 0) {
		  const subtitles = metas.map((meta, index) => {
			metaDao.update(
			  Object.assign(meta, { imdbId, imdbSeason, imdbEpisode })
			);
			return {
			  id: index,
			  url: meta.url,
			  lang: meta.language,
			};
		  });
		  return Promise.resolve({ subtitles: subtitles });
		} else {
		  if (!hasImdbMapping(id.split(":")[0])) {
			return Promise.reject(`No imdb mapping for: ${id.split(":")[0]}`);
		  }
		  const getKitsu = await ImdbToKistu(id, type);
		  const [kitsuPrefix, kitsu_Id, kitsuEpisode] = getKitsu.split(":");
		  const kitsuId = kitsuPrefix + ":" + kitsu_Id;
		  return metaDao.getByKitsuId(kitsuId, kitsuEpisode).then((metas) => {
			if (metas.length > 0) {
			  const subtitles = metas.map((meta, index) => {
				metaDao.update(
				  Object.assign(meta, { imdbId, imdbSeason, imdbEpisode })
				);
				return {
				  id: index,
				  url: meta.url,
				  lang: meta.language,
				};
			  });
			  return Promise.resolve({ subtitles: subtitles });
			} else {
			  return Promise.reject();
			}
		  });
		}
	  });
	}
	if (id.match(/^kitsu:\d+(?::\d+)?$/i)) {
	  const [kitsuPrefix, kitsu_Id, kitsuEpisode] = id.split(":");
	  const kitsuId = kitsuPrefix + ":" + kitsu_Id;
	  return metaDao.getByKitsuId(kitsuId, kitsuEpisode).then((metas) => {
		if (metas.length > 0) {
		  const subtitles = metas.map((meta, index) => {
			return {
			  id: index,
			  url: meta.url,
			  lang: meta.language,
			};
		  });
		  return Promise.resolve({ subtitles: subtitles });
		} else {
		  return Promise.reject();
		}
	  });
	}
});

module.exports = builder.getInterface();
