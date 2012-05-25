var oauthModule = require('./oauth2')
  , url = require('url');

var liveconnect = module.exports =
oauthModule.submodule('liveconnect')
  .configurable({
      scope: 'specify types of access: See http://http://msdn.microsoft.com/en-us/library/live/hh243646'
  })

  .apiHost('https://apis.live.net/v5.0')
  .oauthHost('https://login.live.com')

  .authPath('https://login.live.com/oauth20_authorize.srf')
  .accessTokenPath('/oauth20_token.srf')
  .postAccessTokenParamsVia('data')

  .entryPath('/auth/liveconnect')
  .callbackPath('/auth/liveconnect/callback')

  .authQueryParam('scope', function () {
    return this._scope && this.scope();
  })

  .authCallbackDidErr( function (req) {
    var parsedUrl = url.parse(req.url, true);
    return parsedUrl.query && !!parsedUrl.query.error;
  })
  .handleAuthCallbackError( function (req, res) {
    var parsedUrl = url.parse(req.url, true)
      , errorDesc = parsedUrl.query.error_description;
    if (res.render) {
      res.render(__dirname + '/../views/auth-fail.jade', {
        errorDescription: errorDesc
      });
    } else {
      // TODO Replace this with a nice fallback
      throw new Error("You must configure handleAuthCallbackError if you are not using express");
    }
  })

  .fetchOAuthUser( function (accessToken) {
    var p = this.Promise();
    console.log(accessToken);
    this.oauth.get(this.apiHost() + '/me', accessToken, function (err, data) {
      if (err)
        return p.fail(err);
      var oauthUser = JSON.parse(data);
      p.fulfill(oauthUser);
    })
    return p;
  })
  .convertErr( function (data) {
    return new Error(JSON.parse(data.data).error.message);
  });

liveconnect.mobile = function (isMobile) {
  if (isMobile) {
    this.authPath('https://login.live.com/oauth20_authorize.srf');
  }
  return this;
};
