// @ts-check

import { writeFile, readFile } from "fs/promises"
import { existsSync } from "fs"

async function openKv(fileName = "./kv-database.json") {
	if (!existsSync(fileName)) {
		const file = await writeFile(fileName, "[]")
	}

	return fileName
}
function findDuplicates(entries, key, kvContents) {
    let duplicateKeys = false
    entries.forEach((entry) => {
        if (entry[0].startsWith("u")) {
            const findDuplicates = kvContents.find(
                (kv) => kv[`${key}`][`${entry[0]}`] === entry[1]
            )
            if (findDuplicates) {
                duplicateKeys = true
            }
        }
    })

    return duplicateKeys
}
function strictType(entries, key, kvContents) {
    let correctlyTyped = true
    entries.forEach((entry) => {
        if (entry[0].endsWith("&")) {
            const checkTypes = kvContents.find(
                (kv) => typeof kv[`${key}`][`${entry[0]}`] !== typeof entry[1]
            )
            if (checkTypes) {
                correctlyTyped = false
            }
        }
    })

    return !correctlyTyped
}
async function insert(db, key, value) {
	const kv = db
	const readKv = (await readFile(kv)).toString()
	
	/**
	 * @type { Array<JSON> }
	 */
	const kvContents = JSON.parse(readKv)
	const entries = Object.entries(value)
	if (findDuplicates(entries, key, kvContents)) return { code: 500, statusTxt: "Duplicate keys found" }
	if (strictType(entries, key, kvContents)) return { code: 500, statusTxt: "Unequal types" }
	kvContents.push({ posts: value })
	await writeFile(kv, JSON.stringify(kvContents))
}
async function tableLen(db, table) {
	const kv = db
	const readKv = (await readFile(kv)).toString()

	/**
	 * @type { Array<JSON> }
	 */
	const kvContents = JSON.parse(readKv)
	return kvContents.filter(e => Object.entries(e)[0][0] === table).length
}

function uid (len) {
	return Math.ceil(Math.random() * Date.now()).toPrecision(len).toString().replace(".", "")
}

const db = await openKv()

await insert(db, "posts", { "uID&": uid(), name: "Erik" })
console.log(await tableLen(db, "posts"))

/* 
const time = new Date().getSeconds()
while (new Date().getSeconds() === time) {
	await insert(db, "posts", { "uID&": uid(), name: "Erik" })
}
 */
