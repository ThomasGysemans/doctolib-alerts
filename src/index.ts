import { parseArgs, type ParseArgsConfig } from "node:util";
import puppeteer, { type Page } from "puppeteer";
import { Logger } from "./Logger.js";
import assert from "node:assert";

const DEFAULT_URL = "https://www.doctolib.fr/orl-oto-rhino-laryngologie/nord-pas-de-calais";

const args = process.argv;
const options = {
    silent: {
        type: "boolean",
        default: false,
        short: "s"
    },
    blank: {
        type: "boolean",
        default: false,
        short: "b"
    },
} satisfies ParseArgsConfig["options"];

const parsedArgs = parseArgs({ args, options, allowPositionals: true });
const cliOptions = parsedArgs.values;
const cliPositionals = parsedArgs.positionals;

Logger.warnings = true;
Logger.verbose = !cliOptions.silent;
Logger.colored = !cliOptions.blank;

async function isIPBlocked(page: Page): Promise<boolean> {
    const htmlText = await page.$eval("body > pre", (e) => e.textContent.toLowerCase());
    return htmlText.includes("retry later");
}

async function main() {
    const url = cliPositionals.at(2) ?? DEFAULT_URL;
    Logger.log("Initializing puppeteer...");
    const browser = await puppeteer.launch();
    try {
        Logger.log(`Opening page at ${url}`);
        const page = await browser.newPage();
        await page.goto(url);
        Logger.log("Page is opened... waiting for network idle");
        await page.waitForNetworkIdle();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForNetworkIdle();
        Logger.log("Page was fully loaded");
        assert(!!page.$("body"), "No body was found on page");
        if (await isIPBlocked(page)) {
            throw "Failed to fetch page because Doctolib automatically blocked this IP address momentarily.";
        }
        const res = await page.$eval("body", (body) => {
            function isEmptyDoctor(element) {
                const overlay = element.querySelector(".dl-desktop-availabilities-overlay");
                const label = overlay?.querySelector("svg + div");
                if (!label) {
                    return false;
                }
                const txt = label.textContent.toLowerCase()
                return txt.includes("aucune disponibilité en ligne") || txt.includes("pas de rendez-vous réservable en ligne pour ce soignant");
            }
            const container = body.querySelector("iframe + div");
            const list = container?.querySelector("#main-content .profiles .search-results-list-view ul");
            if (container == null) throw "Container is undefined";
            if (list == null) throw "List is undefined";
            return Array.from(list.children).map(li => {
                const strong = li.querySelector("strong");
                if (strong) {
                    return { day: strong.textContent, slots: [] };
                }
                const isEmpty = isEmptyDoctor(li)
                if (!isEmpty) {
                    const calendarContainer = li.querySelector(".dl-desktop-availabilities-days");
                    if (calendarContainer) {
                        const availabilitiesElements = Array.from(calendarContainer.querySelectorAll(".availabilities-day"));
                        const days = Array.from(availabilitiesElements).map(e => ({
                            day: e.querySelector("& > .availabilities-day-title > .availabilities-day-name")?.textContent + " " + e.querySelector("& > .availabilities-day-title > .availabilities-day-date")?.textContent,
                            slots: Array.from(e.querySelectorAll("& > .availabilities-slots > div[title]")).map(t => t.getAttribute("title"))
                        })).filter(r => r.slots.length);
                        return days[0];
                    }
                }
            }).filter(r => !!r);
        });
        const firstTarget = res[0];
        return `The best appointment you can get is on ${firstTarget.day} (${firstTarget.slots.join(", ")})`;
    } finally {
        await browser.close();
    }
}

Logger.announce("Scrapping Doctolib");

console.time("Runtime");
main()
    .then((answer) => Logger.success(answer))
    .catch((e) => Logger.err("Erreur !", e))
    .finally(() => console.timeEnd("Runtime"))