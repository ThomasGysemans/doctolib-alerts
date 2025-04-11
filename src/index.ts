import { parseArgs, type ParseArgsConfig } from "node:util";
import puppeteer from "puppeteer";

const DEFAULT_URL = "https://www.doctolib.fr/orl-oto-rhino-laryngologie/nord-pas-de-calais";

const args = process.argv;
const options: ParseArgsConfig["options"] = {
    silent: {
        type: "boolean",
        short: "s"
    },
};

const { values, positionals } = parseArgs({ args, options, allowPositionals: true });

async function main() {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(DEFAULT_URL);
        await page.waitForNetworkIdle();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForNetworkIdle();
        const res = await page.$eval("body", (el) => {
            const children = el.children;
            const container = children[5];
            const list = container.querySelector("#main-content .profiles .search-results-list-view ul")!;
            const className = "div.Tappable-inactive.dl-card.dl-card-bg-white.dl-card-variant-default.dl-card-tappable > .dl-card-content > div > .dl-text > span > strong"
            const rdvs = list.querySelectorAll(className);
            const out = Array.from(rdvs).map(e => e.textContent);
            return Array.from(list.children).map(li => {
                const strong = li.querySelector("strong")
                if (strong) {
                    return strong;
                }
                const calendarContainer = li.querySelector(".availabilities-pagination");
                if (calendarContainer) {
                    const days = Array.from(calendarContainer.querySelectorAll(".availabilities-day")).map(e => ({
                        day: e.querySelector("& > .availabilities-day-title")?.textContent,
                        slots: Array.from(e.querySelectorAll("& > .availabilities-slots > div[title]")).map(t => t.getAttribute("title"))
                    }));

                }
            }).map(li => li?.textContent);
            // return {
            //     none: Array.from(list.children).map(li => li.querySelector(".dl-desktop-availabilities-overlay span:not(:has(> strong))")).map(li => li?.textContent),
            //     strong: Array.from(list.children).map(li => li.querySelector("strong")).map(li => li?.textContent),
            // };
        });
        return res;
    } finally {
        await browser.close();
    }
}



main()
    .then((answer) => console.log(answer))
    .catch((e) => console.error("Erreur !", e))

// async function getPage(url: string): Promise<HTMLElement> {
//     const res = await fetch(DEFAULT_URL, {
//         headers: {
//             "Referer": "https://www.doctolib.fr",
//             "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
//         }
//     });
//     if (res.ok) {
//         return parse(await res.text());
//     } else {
//         console.error(res);
//         throw new Error(
//             `Could not read page "${url}" because of status: ${res.status} (${res.statusText})`
//         );
//     }
// }

// async function main() {
//     const page = await getPage(DEFAULT_URL);
//     const mainContent = page.querySelector("#main-content");
//     const container = mainContent?.querySelector(".search-results-list-view");
//     // console.log(page.toString());
//     assert(!!mainContent, "Could not find #main-content");
//     assert(!!container, "Could not find the list view of search results.");
// }

// main()
//     .then(() => console.log("Success"))
//     .catch((e) => console.error("Le programme a planté", e))