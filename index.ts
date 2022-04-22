import { createAPI, readJSONBody } from '@iannisz/node-api-kit'
import { run, RunRequest } from './run'

const PORT = +process.argv[2] || 3000
const LANGS = [ 'js', 'py', 'c', 'cpp', 'java', 'bash', 'rust', 'php', 'ruby',
	'go', 'scala', 'perl', 'bc' ]
const api = createAPI(PORT)

api.post('/run', async (req, res) =>
{
	res.setHeader('Access-Control-Allow-Origin', '*')

	const body = await readJSONBody(req)

	if (body == null || body.lang == null || body.code == null)
	{
		res.statusCode = 400
		res.end('Missing required fields: "lang", "code"')
		return
	}

	if (!LANGS.includes(body.lang))
	{
		res.statusCode = 400
		res.end(`Unknown language: ${ body.lang }`)
		return
	}

	try
	{
		const result = await run(body as RunRequest)
		res.end(JSON.stringify(result))
	}
	catch (err)
	{
		console.error(err)
		res.statusCode = 500
		res.end(err.message)
		return
	}
})