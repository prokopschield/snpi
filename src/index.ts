import * as J from 'doge-json';
import * as pacote from 'pacote';
import path from 'path';

export async function all(pwd: string = '.') {
	pwd = path.resolve(pwd);
	const pjson = await J.read(path.resolve(pwd, 'package.json'));
	const dependencies = Object.keys(pjson.dependencies || {});
	const to_install = new Set<string>(dependencies);
	const manifests = new Map<string, pacote.ManifestResult>();
	while (to_install.size > manifests.size) {
		await Promise.all(
			[...to_install].map(async (dep: string) => {
				if (!manifests.has(dep)) {
					const manifest = await fetch_manifest(dep);
					manifests.set(dep, manifest);
					if (manifest.dependencies) {
						for (const ndep of Object.keys(manifest.dependencies)) {
							to_install.add(ndep);
						}
					}
				}
			})
		);
	}
	return [...to_install].map((pkg) => install_dependency(pwd, pkg));
}

export async function fetch_manifest(pkg: string) {
	const manifest = await pacote.manifest(pkg);
	return manifest;
}

export async function install_dependency(
	pwd: string = '.',
	pkg: string,
	overwrite = false
) {
	const install_dir = path.resolve(pwd, 'node_modules', pkg);
	if (!J.fs.existsSync(install_dir)) {
		return await pacote.extract(pkg, install_dir);
	}
}
