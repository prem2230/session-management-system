export interface IEnvConfig {
    port: number;
    nodeEnv: string | undefined;
    mongodb: {
        uri: string;
    };
    redis: {
        url: string;
    };
    secretKey: string;
    apiBaseUrl: string;
}