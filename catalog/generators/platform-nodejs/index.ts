
import * as _ from 'lodash';
import { setCpuResources, setMemoryResources, setPathHealthChecks } from 'core/resources';
import { cases } from 'core/template/transformers/cases';
import { enumItem } from 'core/catalog';
import { BaseGenerator, NodejsCoords, Runtime } from 'core/catalog/types';
import { BUILDER_NODEJS_APP } from 'core/resources/images';

import PlatformBaseSupport from 'generators/platform-base-support';
import LanguageNodejs, { LanguageNodejsExtra, LanguageNodejsProps } from 'generators/language-nodejs';

export interface PlatformNodejsProps extends LanguageNodejsProps {
    runtime: Runtime;
    nodejs: NodejsCoords;
}

export interface PlatformNodejsExtra extends LanguageNodejsExtra {
}

export default class PlatformNodejs extends BaseGenerator {
    public static readonly sourceDir: string = __dirname;

    public async apply(resources, props: PlatformNodejsProps, extra: any = {}) {
        const exProps: PlatformNodejsExtra = {
            'image': BUILDER_NODEJS_APP,
            'enumInfo': enumItem('runtime.name', 'nodejs'),
            'service': props.serviceName,
            'route': props.routeName
        };
        _.set(extra, 'shared.runtimeInfo', exProps);

        const lprops: LanguageNodejsProps = { ...props, 'builderImage': BUILDER_NODEJS_APP };

        // Check if the service already exists, so we don't create it twice
        if (!resources.service(props.serviceName)) {
            await this.generator(PlatformBaseSupport).apply(resources, props, extra);
            await this.copy();
            await this.transform(['package.json'], cases(props));
        }
        await this.generator(LanguageNodejs).apply(resources, lprops, extra);
        setMemoryResources(resources, { 'limit': '768Mi' }, props.serviceName);
        setCpuResources(resources, { 'limit': '1' }, props.serviceName);
        setPathHealthChecks(resources, '/', '/', props.serviceName);
        return resources;
    }
}
