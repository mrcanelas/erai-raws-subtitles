const cinemeta = require('./cinemeta_api');
const kitsu = require('./kitsu_api');
const { enrichImdbMetadata } = require("./metadataEnrich");
const UserAgent = require('user-agents');
const userAgent = new UserAgent();

function getRandomUserAgent() {
  return userAgent.random().toString();
}

function titlelize(name) {
  return name
    .toLowerCase()
    .normalize("NFKD") // normalize non-ASCII characters
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/&/g, "and")
    .replace(/[;, ~./]+/g, " ") // replace dots, commas or underscores with spaces
    .replace(/[^\w \-()+#@!'\u0400-\u04ff]+/g, "") // remove all non-alphanumeric chars
    .replace(/^\d{1,2}[.#\s]+(?=(?:\d+[.\s]*)?[\u0400-\u04ff])/i, "") // remove russian movie numbering
    .replace(/\s{2,}/, " ") // replace multiple spaces
    .replace(/dublado/g, "")
    .replace(/filme/g, "movie")
    .replace(/ /g, "%20")
    .trim();
}

async function ImdbToKistu(id, type) {
  const [imdbId, season, episode] = id.split(":")
  const kitsuMeta = await cinemeta.getCinemetaMetadata(imdbId, type)
    .then((metadata) => enrichImdbMetadata(metadata, kitsu.animeData))
    .then((meta) => ({ meta: meta}))
  if (type == "movie") {
    const kitsuId =
      kitsuMeta.meta.kitsu_id !== undefined
        ? "kitsu:" + kitsuMeta.meta.kitsu_id
        : undefined;
    return kitsuId;
  } else {
    const episodes =
      kitsuMeta.meta.videos !== undefined ? kitsuMeta.meta.videos : undefined;
    const findEp = episodes.find(function (el) {
      return el.season == season && el.episode == episode;
    });
    const kitsuId = "kitsu:" + findEp.kitsu_id + ":" + findEp.kitsuEpisode;
    return kitsuId;
  }
}

module.exports = { getRandomUserAgent, titlelize, ImdbToKistu }