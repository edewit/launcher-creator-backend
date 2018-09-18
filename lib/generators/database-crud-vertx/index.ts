
import { copy } from 'fs-extra';
import { join } from 'path';
import { mergePoms } from '../../core/maven';

export function apply(applyGenerator, resources, targetDir, props: any = {}) {
    // First copy the files from the base Vert.x platform module
    // and then copy our own over that
    const pprops = {
        'application': props.application,
    };
    return applyGenerator('platform-vertx', resources, targetDir, pprops)
        .then(() => copy(join(__dirname, 'files'), targetDir))
        .then(() => mergePoms(join(targetDir, 'pom.xml'), join(__dirname, 'merge', `pom.${props.databaseType}.xml`)))
        .then(() => resources);
    // TODO Don't just blindly copy all files, we need to _patch_ some of
    // them instead (eg. pom.xml and arquillian.xml and Java code)
}

export function info() {
    return require('./info.json');
}
