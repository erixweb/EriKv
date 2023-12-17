import { writeFile, readFile } from "fs/promises"
import { existsSync } from "fs"

async function openKv(fileName = "./kv-database.json") {
	if (!existsSync(fileName)) {
		const file = await writeFile(fileName, "[]")
	}

	return fileName
}
async function insert(db, key, value) {
	const kv = await db
	const readKv = await readFile(kv)
	/**
	 * @type { Array<JSON> }
	 */
	const kvContents = JSON.parse(readKv)
	const entries = Object.entries(value)
	function findDuplicates(entries) {
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
	if (findDuplicates(entries)) return { code: 500, statusTxt: "Duplicate keys found" }
	kvContents.push({ posts: value })
	await writeFile(kv, JSON.stringify(kvContents))
}

const db = openKv()

insert(db, "posts", { uID: Math.floor(Math.random() * 10), d: "lol" })
