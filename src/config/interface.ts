export default interface IConfig {
    sso: {
        google: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        },
    },
}
