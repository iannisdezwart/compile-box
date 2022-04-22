import { exec } from 'child_process'
import { readdirSync, writeFileSync } from 'fs'

interface Output
{
	stdout: string
	stderr: string
}

const lang = process.argv[2]

/**
 * Runs a command and resolves the output.
 */
const run = (cmd: string) => new Promise<Output>((resolve, reject) =>
{
	exec(cmd, (err, stdout, stderr) => {
		if (err)
		{
			reject({ err, stdout, stderr })
		}

		resolve({ stdout, stderr })
	})
})

/**
 * Runs JavaScript code and resolves the output.
 */
const runJS = async () => await run('node /shared/code')

/**
 * Runs Python code and resolves the output.
 */
const runPython = async () => await run('python3 /shared/code')

/**
 * Compiles C code, runs it, and resolves the output.
 */
const runC = async () =>
{
	// Compile the code.

	await run('mv /shared/code /shared/code.c')
	await run('gcc -o /shared/exec /shared/code.c')

	// Run the compiled code.

	return await run('/shared/exec')
}

/**
 * Compiles C++ code, runs it, and resolves the output.
 */
const runCpp = async () =>
{
	// Compile the code.

	await run('mv /shared/code /shared/code.cpp')
	await run('g++ -o /shared/exec /shared/code.cpp')

	// Run the compiled code.

	return await run('/shared/exec')
}

/**
 * Compiles Java code, runs it, and resolves the output.
 */
const runJava = async () =>
{
	// Compile the code.

	await run('mv /shared/code /shared/code.java')
	await run('java/bin/javac /shared/code.java')

	// Find the class file with the main method and run it.

	let mainClass: string

	for (const file of readdirSync('/shared'))
	{
		if (!file.endsWith('.class'))
		{
			continue
		}

		const className = file.slice(0, -6)

		try
		{
			await run(`java/bin/javap -cp /shared -public ${ className } | fgrep -q 'public static void main(java.lang.String[])'`)

			mainClass = className
			break
		}
		catch (err)
		{
			// If `fgrep` fails, it means the class doesn't
			// have a main method.
		}
	}

	if (mainClass == null)
	{
		console.log('No main method found.')
		process.exit(1)
	}

	// The main method exists. Run the class.

	return await run(`java/bin/java -cp /shared ${ mainClass }`)
}

/**
 * Runs Bash code and resolves the output.
 */
const runBash = async () => await run('chmod a+x /shared/code && bash /shared/code')

/**
 * Compile Rust code, run it, and resolve the output.
 */
const runRust = async () =>
{
	// Compile the code.

	await run('mv /shared/code /shared/code.rs')
	await run(`~/.cargo/bin/rustc /shared/code.rs -o /shared/exec`)

	// Run the compiled code.

	return await run('/shared/exec')
}

/**
 * Run PHP code and resolve the output.
 */
const runPHP = async () => await run('php /shared/code')

/**
 * Run Ruby code and resolve the output.
 */
const runRuby = async () => await run('ruby /shared/code')

/**
 * Run Go code and resolve the output.
 */
const runGo = async () =>
{
	// Compile the code.

	await run('mv /shared/code /shared/code.go')
	await run('cd /shared && go build -o exec code.go')

	// Run the compiled code.

	return await run('/shared/exec')
}

/**
 * Run Scala code and resolve the output.
 */
const runScala = async () =>
{
	// Compile the code.

	await run('mv /shared/code /shared/code.scala')
	await run('cd /shared && scalac code.scala')

	// Find the class file with the main method and run it.

	let mainClass: string

	for (const file of readdirSync('/shared'))
	{
		if (!file.endsWith('.class'))
		{
			continue
		}

		const className = file.slice(0, -6)

		try
		{
			await run(`java/bin/javap -cp /shared -public ${ className } | fgrep -q 'public static void main(java.lang.String[])'`)

			mainClass = className
			break
		}
		catch (err)
		{
			// If `fgrep` fails, it means the class doesn't
			// have a main method.
		}
	}

	if (mainClass == null)
	{
		console.log('No main method found.')
		process.exit(1)
	}

	// The main method exists. Run the class.

	return await run(`scala -cp /shared ${ mainClass }`)
}

/**
 * Run Perl code and resolve the output.
 */
const runPerl = async () => await run('perl /shared/code')

/**
 * Run Golfscript code and resolve the output.
 */
const runGolfscript = async () => await run('golfscript /shared/code')

/**
 * Run Fish code and resolve the output.
 */
const runFish = async () => await run('python3 /shared/fish.py /shared/code')

// Map of all languages and their respective run functions.

const langFuncs = {
	js: runJS,
	py: runPython,
	c: runC,
	cpp: runCpp,
	java: runJava,
	bash: runBash,
	rust: runRust,
	php: runPHP,
	ruby: runRuby,
	go: runGo,
	scala: runScala,
	perl: runPerl,
	golfscript: runGolfscript,
	fish: runFish
}

/**
 * Main function. Runs the code and stores the output in `shared/stdout` and
 * `/shared/stderr`.
 */
const main = async () =>
{
	// Save the container ID.

	await run('cat /proc/self/cgroup | grep "docker" | sed s/\\\\//\\\\n/g | tail -1 > /shared/container')

	// Run the code and save stdout and stderr to files.

	if (langFuncs[lang] == null)
	{
		console.log(`Unknown language: ${ lang }`)
		process.exit(1)
	}

	try
	{
		const output = await langFuncs[lang]()

		// Saves the output to files.

		writeFileSync('/shared/stdout', output.stdout, 'utf-8')
		writeFileSync('/shared/stderr', output.stderr, 'utf-8')
	}
	catch (err)
	{
		console.log(err)
		process.exit(1)
	}
}

main()