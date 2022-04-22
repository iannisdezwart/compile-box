# CompileBox

Runs user-submitted code in a Docker container and gives them the output.

Supported languages:
* C
* C++
* Rust
* Go
* JavaScript (NodeJS)
* Python
* Perl
* PHP
* Java
* Ruby
* Scala
* Bash
* BC


## Installation

Make sure you have Docker and NPM installed. Then run:

```sh
npm i && npm start <port number>
```

That's it ✨!


## Usage

Super simple: use the `/run` endpoint and pass in the language and code in a
JSON object.

```json
{
	"lang": "rust",
	"code": "fn main() { println!(\"Hello, world!\"); }"
}
```

After the code has been run, the response will be a JSON object as follows:

```json
{
	"stdout": "Hello, world!",
	"stderr": "",
}
```


## Security

Everything is sandboxed in a custom Docker container. Code that doesn't
terminate within a certain time is killed. Network access is disabled.

Should be somewhat safe, I hope 😅.