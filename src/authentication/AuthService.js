const { AuthenticationService } = require('@feathersjs/authentication');
const { NotAuthenticated } = require('@feathersjs/errors');

const selectCorrectIDtype = require('../helpers/selectCorrectIDtype');

class CustomAuthenticationService extends AuthenticationService {
  /**
   * Create and return a new JWT for a given authentication request.
   * Will trigger the `login` event.
   * @param data The authentication request (should include `strategy` key)
   * @param params Service call parameters
   */
  async create(data, params) {
    const { entity } = this.configuration;
    const authStrategies = params.authStrategies || this.configuration.authStrategies;

    if (!authStrategies.length) {
      throw new NotAuthenticated('No authentication strategies allowed for creating a JWT (`authStrategies`)');
    }

    let refreshTokenPayload;
    let authResult;

    const feConfig = this.app.get('feathers-auth-extend') || undefined;

    if ((feConfig === undefined || feConfig.refreshTokens) && data.action === 'refresh' && !data.refresh_token) {
      throw new NotAuthenticated('No refresh token');
    } else if ((feConfig === undefined || feConfig.refreshTokens) && data.action === 'refresh') {
      refreshTokenPayload = await this.verifyAccessToken(data.refresh_token, params.jwt);
      if (refreshTokenPayload.tokenType !== 'refresh') {
        throw new NotAuthenticated('Invalid token');
      }
      authResult = {
        [entity]: refreshTokenPayload[entity],
        authentication: { strategy: data.strategy },
      };
    } else if (feConfig !== undefined && feConfig.magicTokens && data.action === 'loginToken' && !data.login_token) {
      throw new NotAuthenticated('Invalid token');
    } else if (feConfig !== undefined && feConfig.magicTokens && data.action === 'loginToken') {

      const users = this.app.service('users');

      let getUser = await users.find({
        query: {
          email: data.email,
          loginToken: data.login_token
        },
        paginate: false
      });

      if (getUser.length !== 1) {
        throw new NotAuthenticated('No Token Match');
      }

      let user = getUser[0];

      if (Date.now() > user.loginTokenExpires) {
        throw new NotAuthenticated('Token Expired');
      } else {

        await users.patch(
          selectCorrectIDtype(users, user),
          {
            isVerified: true,
            loginTokenExpires: null,
            loginToken: null,
          });
      }

      authResult = {
        authentication: { strategy: 'local' },
        user: {
          _id: user._id
        }
      };

    } else {
      authResult = await this.authenticate(data, params, ...authStrategies);
    }

    if (authResult && authResult.accessToken) {
      return authResult;
    }

    const [payload, jwtOptions] = await Promise.all([
      this.getPayload(authResult, params),
      this.getTokenOptions(authResult, params)
    ]);

    const accessToken = await this.createAccessToken(payload, jwtOptions, params.secret);

    if (data.action !== 'refresh' && feConfig.refreshTokens) {

      /**
       * Generate refresh token
       */
      const refreshTokenJwtOptions = {
        ...jwtOptions,
        expiresIn: feConfig.refreshExpires
      };

      refreshTokenPayload = {
        ...payload,
        tokenType: 'refresh',
        [entity]: authResult[entity]
      };

      const refreshToken = await this.createAccessToken(refreshTokenPayload, refreshTokenJwtOptions, params.secret);

      return Object.assign({}, {accessToken, refreshToken: refreshToken}, authResult);

    } else {

      return Object.assign({}, {accessToken}, authResult);

    }

  }
}

module.exports = CustomAuthenticationService;
