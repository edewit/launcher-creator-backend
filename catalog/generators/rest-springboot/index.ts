
import { BaseGenerator } from 'core/catalog/types';
import PlatformSpringBoot, { PlatformSpringBootProps } from 'generators/platform-springboot';

export interface RestSpringProps extends PlatformSpringBootProps {
}

export default class RestSpring extends BaseGenerator {
    public static readonly sourceDir: string = __dirname;

    public async apply(resources, props: RestSpringProps, extra: any = {}) {
        // Check if the generator was already applied, so we don't do it twice
        if (!await this.filesCopied()) {
            // First copy the files from the base springboot platform module
            // and then copy our own over that
            const pprops = {
                'application': props.application,
                'serviceName': props.serviceName,
                'maven': props.maven,
            } as PlatformSpringBootProps;
            await this.generator(PlatformSpringBoot).apply(resources, pprops, extra);
            await this.copy();
            await this.mergePoms();
        }
        extra['sourceMapping'] = { 'greetingEndpoint': 'src/main/java/io/openshift/booster/service/GreetingController.java' };
        return resources;
    }
}
