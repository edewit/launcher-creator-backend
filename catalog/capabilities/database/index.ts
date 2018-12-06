
import { BaseCapability, Runtime } from 'core/catalog/types';

import DatabaseSecret from 'generators/database-secret';
import DatabasePostgresql from 'generators/database-postgresql';
import DatabaseMysql from 'generators/database-mysql';
import DatabaseCrudVertx from 'generators/database-crud-vertx';
import DatabaseCrudSpringBoot from 'generators/database-crud-springboot';
import DatabaseCrudNodejs from 'generators/database-crud-nodejs';
import DatabaseCrudThorntail from 'generators/database-crud-thorntail';

// Returns the corresponding database generator depending on the given database type
function databaseByType(type) {
    if (type === 'postgresql') {
        return DatabasePostgresql;
    } else if (type === 'mysql') {
        return DatabaseMysql;
    } else {
        throw new Error(`Unsupported database type: ${type}`);
    }
}

// Returns the corresponding runtime generator depending on the given runtime type
function runtimeByType(rt: Runtime) {
    if (rt.name === 'vertx') {
        return DatabaseCrudVertx;
    } else if (rt.name === 'nodejs') {
        return DatabaseCrudNodejs;
    } else if (rt.name === 'thorntail') {
        return DatabaseCrudThorntail;
    } else if (rt.name === 'springboot') {
        return DatabaseCrudSpringBoot;
    } else {
        throw new Error(`Unsupported runtime type: ${rt.name}`);
    }
}

export default class Database extends BaseCapability {
    public static readonly sourceDir: string = __dirname;

    public async apply(resources, props, extra) {
        const appName = this.name(props.application, props.tier);
        const dbServiceName = this.name(appName, 'database');
        const dbprops = {
            'application': props.application,
            'tier': props.tier,
            'serviceName': dbServiceName,
            'databaseUri': this.name(props.application, props.tier, 'database'),
            'databaseName': 'my_data',
            'secretName': this.name(props.application, props.tier, 'database-bind'),
        };
        const rtServiceName = appName;
        const rtRouteName = appName;
        const rtprops = {
            'application': props.application,
            'tier': props.tier,
            'serviceName': rtServiceName,
            'routeName': rtRouteName,
            'runtime': props.runtime,
            'maven': props.maven,
            'nodejs': props.nodejs,
            'databaseType': props.databaseType,
            'secretName': this.name(props.application, props.tier, 'database-bind'),
        };
        await this.generator(DatabaseSecret).apply(resources, dbprops, extra);
        await this.generator(databaseByType(props.databaseType)).apply(resources, dbprops, extra);
        return await this.generator(runtimeByType(props.runtime)).apply(resources, rtprops, extra);
    }
}
