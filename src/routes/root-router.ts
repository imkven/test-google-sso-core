import { Request, Response, Router } from 'express';
import { AllowedSchema, Validator } from 'express-json-validator-middleware';
import { OAuth2Client } from 'google-auth-library';
import config from '../modules/config';

interface IResponse {
    names: Object;
    emailAddresses: Object;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const { validate } = new Validator({});

const router = Router();

const traces = {
    loginWithGoogle: {
        route: '/login-with-google',
        validateSchema: {
            type: 'object',
            required: ['tokenId', 'accessToken', 'token'],
            properties: {
                tokenId: {
                    type: 'string',
                },
                accessToken: {
                    type: 'string',
                },
                token: {
                    type: 'object'
                }
            },
        } as AllowedSchema,
    },
};

router.post(
    traces.loginWithGoogle.route, 
    validate({ body: traces.loginWithGoogle.validateSchema }), 
    async (req: Request, res: Response) => {
        const client = new OAuth2Client(config.sso.google);

        // Implement 1: Verify token
        const ticket = await client.verifyIdToken({
            idToken: req.body.tokenId,
            audience: `${config.sso.google.clientId}`,
        });
        if (!ticket) {
            return res.status(401).json({
                code: 'Unauthorized',
            });
        }

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({
                code: 'Unauthorized',
            });
        }

        // Implement 2 (BEST): Check token of user

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        client.setCredentials(req.body.token);

        const url = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses';
        // const url = 'https://www.googleapis.com/auth/userinfo.email';
        const d1: { data: IResponse }  = await client.request({ url });
        console.log('d1', d1.data);
        console.log('names', d1.data.names);
        console.log('emailAddresses', d1.data.emailAddresses);
        
        return res.status(200).json({
            loggedIn: true,
            profile: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            }            
        });
    }
);

export default router;