# Url Shortener Microservice

[GitHub Project](https://github.com/NeckersBOX/url-shortener)

Example usage:

```
https://shorting.herokuapp.com/add/http://too.loooong.url
https://shorting.herokuapp.com/1a3

```

Example output `https://shorting.herokuapp.com/add/http://too.loooong.url`:

```
{ "original_url": "http://too.loooong.url", "short_url": "https://shorting.herokuapp.com/1a3" }
```

Example output `https://shorting.herokuapp.com/1a3`: _Redirect to **http://too.loooong.url**_
