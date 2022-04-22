import * as childProcess from 'child_process'
import { randomBytes } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'

export interface RunRequest
{
	lang: string
	code: string
}

const KILL_AFTER_SECONDS = 10

/**
 * Executes a given command asynchronously.
 */
const exec = (cmd: string, options: childProcess.ExecOptions = {}) =>
	new Promise((resolve, reject) =>
{
	childProcess.exec(cmd, options, (err, stdout, stderr) =>
	{
		console.log(cmd, { stdout, stderr })

		if (err)
		{
			reject(new Error(JSON.stringify({ err, stdout, stderr })))
			return
		}

		resolve({ stdout, stderr })
	})
})

/**
 * Starts the docker container and runs the code in it.
 */
export const run = async (req: RunRequest) =>
{
	// Set up a shared directory for the code.

	const id = randomBytes(8).toString('hex')
	const sharedDir = `/tmp/compile-box-shared-${ id }`

	console.log(`[${ id }] Running ${ req.lang } code:\n${ req.code }\n`)

	let stdout: string
	let stderr: string

	try
	{
		// Copy the shared directory boilerplate to the shared directory.

		await exec(`cp -r ./shared-dir ${ sharedDir }`)

		// Copy the code to the shared directory.

		const codeFile = `${ sharedDir }/code`
		writeFileSync(codeFile, req.code, 'utf-8')

		// Run the docker container.

		const containerCmd = `node /shared/run.js ${ req.lang }`
		const dockerArgs = `--network none --rm -a STDOUT -v ${ sharedDir }:/shared`
		await exec(`docker run ${ dockerArgs } compile-box ${ containerCmd }`, {
			timeout: KILL_AFTER_SECONDS * 1000
		})

		// Read the output from the shared directory.

		stdout = readFileSync(`${ sharedDir }/stdout`, 'utf-8')
		stderr = readFileSync(`${ sharedDir }/stderr`, 'utf-8')
	}
	catch (err)
	{
		// Clean up the shared directory.

		await exec(`rm -rf ${ sharedDir }`)

		console.log(`[${ id }] Error:\n${ err }\n`)

		// Re-throw the error.

		throw err
	}

	// Clean up the shared directory.

	await exec(`rm -rf ${ sharedDir }`)

	console.log(`[${ id }] Finished:`, { stdout, stderr })

	return { stdout, stderr }
}