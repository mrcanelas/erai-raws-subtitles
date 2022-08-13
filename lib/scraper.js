const axios = require("axios");
const cheerio = require("cheerio");
const MetaDAO = require("./meta-dao");
const metaDao = new MetaDAO();
const parseFileName = require("parse-filename");
const { parse } = require("parse-torrent-title");
const { getKitsu } = require("./kitsu");
const { getRandomUserAgent } = require("./utils");

const defaultTimeout = 30000;
const baseUrl = "https://txt.erai-raws.org/";
const urlIgnore = [
  ".",
  "?dir=Sub",
  "?dir=Sub/Fonts",
  "?dir=Sub/Movies",
  "https://www.facebook.com/Erai.raws/",
  "https://twitter.com/Erai_raws",
  "https://www.pinterest.com/erairaws/",
  "https://discord.gg/2PfWaar",
  "https://t.me/Erai_raws",
];

const subFormats = ".ass" || "srt" || ".ssa";

function scrapeSubs(link) {
  const requestUrl = link || "?dir=Sub";
  return singleRequest(baseUrl + requestUrl)
    .then((body) => parseTableBody(body, requestUrl))
    .then((links) =>
      links.length > 0 ? links.map((newUrl) => scrapeSubs(newUrl)) : links
    )
    .catch((err) => err);
}

function singleRequest(requestUrl, config = {}) {
  const timeout = config.timeout || defaultTimeout;
  const options = {
    headers: { "User-Agent": getRandomUserAgent() },
    timeout: timeout,
  };

  return axios
    .get(requestUrl, options)
    .then((response) => {
      const body = response.data;
      if (!body) {
        throw new Error(`No body: ${requestUrl}`);
      } else if (
        body.includes("502: Bad gateway") ||
        body.includes("403 Forbidden")
      ) {
        throw new Error(`Invalid body contents: ${requestUrl}`);
      }
      return body;
    })
    .catch((error) => Promise.reject(error.message || error));
}

function parseTableBody(body, lastUrl) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(body);

    if (!$) {
      reject(new Error("Failed loading body"));
    }

    const links = [];

    $("a").each((i, element) => {
      const hiperLink = $(element).attr("href");
      console.log(hiperLink);
      if (hiperLink.includes(subFormats)) {
        const subUrl = baseUrl + hiperLink;
        metaDao.getByURL(subUrl).then(async (results) => {
          if (!results) {
            const subInfo = parseFileName({
              data: subUrl,
              debug: false,
            });
            const subName = decodeURI(subInfo.filename);
            const parsedSubName = parse(subName);
            const kitsuId = await getKitsu(parsedSubName.title);
            const filterLanguages = parsedSubName.languages.filter(
              (lang) => !lang.includes("multi subs")
            );
            const meta = {
              name: subName,
              url: subUrl,
              language: filterLanguages[0],
              imdbId: null,
              imdbSeason: null,
              imdbEpisode: null,
              kitsuId: kitsuId,
              kitsuEpisode: parsedSubName.episode,
            };
            metaDao.addIfAbsent(meta).then(console.log(`Added: ${meta.name}`));
          } else {
            console.log(`${results.name} already exists in DB`);
          }
        });
      } else if (!urlIgnore.includes(hiperLink)) {
        links.push(hiperLink);
      }
    });
    console.log(links);
    resolve(links);
  });
}

module.exports = { scrapeSubs };
