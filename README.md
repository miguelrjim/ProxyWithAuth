# Home Assistant Add-on: Proxy With Auth

Proxy requests to an underlying service while adding an authorization token from a different service.

## About

Let's say you are running frigate behind authentik through a proxy provider (this was the specific reason why I created this addon), requests from home assistant would fail as those would not be authorized, you could remove authorization for certain paths but that's not the most secure way to handle it; this addon serves as an intermediary which handles retrieving the authorization token and attaching it to the original request before sending it to it's intended destination.

## Configuration

In the following section we will configure a proxy to frigate; some variables need to be replaced to work properly in your setup.

### Authentik

```yaml
proxies:
  - auth: authentik
    options: >-
      {"domain": "<AUTHENTIK_DOMAIN>", "clientId":
      "<CLIENT_ID>", "username": "<USERNAME>", "password":
      "<PASSWORD>"}
    path: <URL_PATH>
    target: <TARGET_URL>
```
- `<AUTHENTIK_DOMAIN>`: This is the domain the addon will use to build the POST request to get the Bearer token needed for authorization, if the domain is `authentik.example.com` the url will end up being `https://authentik.example.com/application/o/token/`.
- `<CLIENT_ID>`: This value you can retrieve directly from the authentik admin panel, it's in the `Authentication` tab for the particular provider you are trying to get the token from.
- `<USERNAME>`: User that has access on the particular provider; it should be a Service Account.
- `<PASSWORD>`: App password for the given user; this is not the regular password that a user sets in their account, it's specific to Service Accounts.
- `<URL_PATH>`: Path that proxy server will use to route them to the target url; i.e. `frigate`, this will make it so that any request received on this add-on to `/frigate` would actually reach the `<TARGET_URL>`.
- `<TARGET_URL>`: The intended destination of the requests; i.e. `https://frigate.example.com`

## How to use

Once the add-on is running, get the hostname for it (i.e. `local-proxy-with-auth`); any kind of requests to `http://local-proxy-with-auth:3000` will be picked up by the proxy server and handled properly; with the above configuration for frigate whenever a request is done from home assistant to `http://local-proxy-with-auth:3000/frigate` it would get proxied to `https://frigate.example.com` with the header `Authorization: Bearer SOME_TOKEN` added by calling the authentik API.

This proxy server doesn't expose any kind of ports so it only works for network requests inside home assistant (other addons can get to it as well).