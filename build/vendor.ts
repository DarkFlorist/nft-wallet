import * as path from 'path'
import * as url from 'url'
import { promises as fs } from 'fs'
import { recursiveDirectoryCopy } from '@zoltu/file-copier'

const directoryOfThisFile = path.dirname(url.fileURLToPath(import.meta.url))

const dependencyPaths = [
	{ packageName: 'preact', subfolderToVendor: 'dist', entrypointFile: 'preact.module.js' },
	{ packageName: 'preact/jsx-runtime', subfolderToVendor: 'dist', entrypointFile: 'jsxRuntime.module.js' },
	{ packageName: 'preact/hooks', subfolderToVendor: 'dist', entrypointFile: 'hooks.module.js' },
	{ packageName: 'ethers', subfolderToVendor: 'dist', entrypointFile: 'ethers.js' },
	{ packageName: '@preact/signals-core', subfolderToVendor: 'dist', entrypointFile: 'signals-core.module.js' },
	{ packageName: '@preact/signals', subfolderToVendor: 'dist', entrypointFile: 'signals.module.js' },
	{ packageName: 'funtypes', subfolderToVendor: 'lib', entrypointFile: 'index.mjs' },
]

async function vendorDependencies() {
	for (const { packageName, subfolderToVendor } of dependencyPaths) {
		const sourceDirectoryPath = path.join(directoryOfThisFile, '..', 'node_modules', packageName, subfolderToVendor)
		const destinationDirectoryPath = path.join(directoryOfThisFile, '..', 'app', 'vendor', packageName)
		await recursiveDirectoryCopy(sourceDirectoryPath, destinationDirectoryPath, undefined, rewriteSourceMapSourcePath.bind(undefined, packageName))
	}

	const indexHtmlPath = path.join(directoryOfThisFile, '..', 'app', 'index.html')
	const oldIndexHtml = await fs.readFile(indexHtmlPath, 'utf8')
	const importmap = dependencyPaths.reduce(
		(importmap, { packageName, entrypointFile }) => {
			importmap.imports[packageName] = `./${path.join('.', 'vendor', packageName, entrypointFile).replace(/\\/g, '/')}`
			return importmap
		},
		{ imports: {} as Record<string, string> }
	)
	const importmapJson = JSON.stringify(importmap, undefined, '\t').replace(/^/gm, '\t\t')
	const newIndexHtml = oldIndexHtml.replace(/<script type='importmap'>[\s\S]*?<\/script>/m, `<script type='importmap'>\n${importmapJson}\n\t</script>`)
	await fs.writeFile(indexHtmlPath, newIndexHtml)
}

// rewrite the source paths in sourcemap files so they show up in the debugger in a reasonable location and if two source maps refer to the same (relative) path, we end up with them distinguished in the browser debugger
async function rewriteSourceMapSourcePath(packageName: string, sourcePath: string, destinationPath: string) {
	const fileExtension = path.extname(sourcePath)
	if (fileExtension !== '.map') return
	const fileContents = JSON.parse(await fs.readFile(sourcePath, 'utf-8')) as { sources: Array<string> }
	for (let i = 0; i < fileContents.sources.length; ++i) {
		// we want to ensure all source files show up in the appropriate directory and don't leak out of our directory tree, so we strip leading '../' references
		const sourcePath = fileContents.sources[i].replace(/^(?:.\/)*/, '').replace(/^(?:..\/)*/, '')
		fileContents.sources[i] = ['dependencies://dependencies', packageName, sourcePath].join('/')
	}
	await fs.writeFile(destinationPath, JSON.stringify(fileContents))
}

vendorDependencies().catch(error => {
	console.error(error)
	debugger
	process.exit(1)
})
